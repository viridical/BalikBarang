
import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY tidak ditemukan");
    }

    const body = await request.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    if (
      !order_id ||
      !status_code ||
      !gross_amount ||
      !signature_key
    ) {
      return NextResponse.json(
        { error: "Data notifikasi tidak lengkap" },
        { status: 400 }
      );
    }

    // Validasi signature Midtrans
    const expectedSignature = createHash("sha512")
      .update(
        `${order_id}${status_code}${gross_amount}${serverKey}`
      )
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(signature_key, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Cari transaksi
    const payment = await prisma.payment.findUnique({
      where: { orderId: order_id },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validasi nominal
    if (Number(payment.amount) !== Number(gross_amount)) {
      return NextResponse.json(
        { error: "Nominal pembayaran tidak sesuai" },
        { status: 400 }
      );
    }

    const isPaid =
      transaction_status === "settlement" ||
      (
        transaction_status === "capture" &&
        fraud_status === "accept"
      );

    if (isPaid) {
      await prisma.$transaction(async (tx) => {
        // Cegah pemrosesan transaksi sukses berulang kali.
        const updated = await tx.payment.updateMany({
          where: {
            orderId: order_id,
            status: { not: "success" },
          },
          data: {
            status: "success",
          },
        });

        if (updated.count === 0) {
          return;
        }

        const user = await tx.user.findUnique({
          where: { id: payment.userId },
          select: {
            subscriptionEndsAt: true,
          },
        });

        if (!user) {
          throw new Error("User transaksi tidak ditemukan");
        }

        const now = new Date();

        const startDate =
          user.subscriptionEndsAt &&
          user.subscriptionEndsAt > now
            ? user.subscriptionEndsAt
            : now;

        // Tambahkan satu bulan kalender.
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
        message: "Subscription berhasil diperbarui",
      });
    }

    // Pembayaran masih menunggu
    if (transaction_status === "pending") {
      await prisma.payment.updateMany({
        where: {
          orderId: order_id,
          status: { not: "success" },
        },
        data: {
          status: "pending",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Pembayaran pending",
      });
    }

    // Pembayaran gagal, dibatalkan, atau kedaluwarsa
    if (
      ["deny", "cancel", "expire"].includes(
        transaction_status
      )
    ) {
      await prisma.payment.updateMany({
        where: {
          orderId: order_id,
          status: { not: "success" },
        },
        data: {
          status: "failed",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Notifikasi berhasil diproses",
    });

  } catch (error) {
    console.error("Midtrans Webhook Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
