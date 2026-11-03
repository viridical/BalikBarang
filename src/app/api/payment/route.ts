import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  try {
    // 1. Validasi login
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    // 2. Ambil user dari database
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // 3. Cek apakah masih Premium
    if (
      user.subscriptionStatus === "Premium" &&
      user.subscriptionEndsAt &&
      user.subscriptionEndsAt > new Date()
    ) {
      return NextResponse.json(
        { error: "Subscription Anda masih aktif" },
        { status: 409 }
      );
    }

    // 4. Validasi environment
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY belum tersedia");
    }

    const isProduction =
      process.env.MIDTRANS_IS_PRODUCTION === "true";

    const snapUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    // 5. Buat order
    const orderId =
      `SUB-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const grossAmount = 99000;

    // 6. Simpan transaksi sebelum meminta Snap Token
    await prisma.payment.create({
      data: {
        orderId,
        amount: grossAmount,
        status: "pending",
        userId: user.id,
      },
    });

    // 7. Authorization
    const authHeader = Buffer.from(
      `${serverKey}:`
    ).toString("base64");

    // 8. Request ke Midtrans
    const response = await fetch(snapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount,
        },
        customer_details: {
          email: user.email,
          first_name: user.name || "Customer",
        },
        callbacks: {
          finish:
            "https://balik-barang.vercel.app/subscription",
        },
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      console.error("Midtrans Error:", data);

      await prisma.payment.update({
        where: { orderId },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: "Gagal membuat transaksi Midtrans" },
        { status: 502 }
      );
    }

    // 9. Kirim token ke frontend
    return NextResponse.json({
      token: data.token,
      orderId,
    });

  } catch (error) {
    console.error("Payment API Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
