import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { error: "Order ID tidak valid" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        orderId,
        user: {
          email: session.user.email,
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (payment.status === "success") {
      return NextResponse.json({
        success: true,
        status: "success",
      });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY tidak ditemukan");
    }

    const isProduction =
      process.env.MIDTRANS_IS_PRODUCTION === "true";

    const baseUrl = isProduction
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";

    const response = await fetch(
      `${baseUrl}/v2/${encodeURIComponent(orderId)}/status`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization:
            `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Midtrans Status Error:", result);

      return NextResponse.json(
        { error: "Gagal memeriksa pembayaran" },
        { status: response.status }
      );
    }

    if (
      result.order_id !== orderId ||
      Number(result.gross_amount) !== payment.amount
    ) {
      return NextResponse.json(
        { error: "Data transaksi tidak sesuai" },
        { status: 400 }
      );
    }

    const isPaid =
      result.transaction_status === "settlement" ||
      (
        result.transaction_status === "capture" &&
        result.fraud_status === "accept"
      );

    if (!isPaid) {
      return NextResponse.json({
        success: false,
        status: result.transaction_status,
      });
    }

    await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.updateMany({
        where: {
          orderId,
          status: { not: "success" },
        },
        data: {
          status: "success",
        },
      });

      if (updated.count === 0) return;

      const user = await tx.user.findUnique({
        where: { id: payment.userId },
        select: { subscriptionEndsAt: true },
      });

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      const now = new Date();

      const startDate =
        user.subscriptionEndsAt &&
        user.subscriptionEndsAt > now
          ? user.subscriptionEndsAt
          : now;

      const nextExpiry = new Date(startDate);
      const originalDay = nextExpiry.getUTCDate();

      nextExpiry.setUTCDate(1);
      nextExpiry.setUTCMonth(
        nextExpiry.getUTCMonth() + 1
      );

      const lastDay = new Date(
        Date.UTC(
          nextExpiry.getUTCFullYear(),
          nextExpiry.getUTCMonth() + 1,
          0
        )
      ).getUTCDate();

      nextExpiry.setUTCDate(
        Math.min(originalDay, lastDay)
      );

      await tx.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionStatus: "Premium",
          subscriptionEndsAt: nextExpiry,
        },
      });
    });

    return NextResponse.json({
      success: true,
      status: "success",
    });

  } catch (error) {
    console.error("Payment Verification Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}