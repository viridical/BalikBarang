import { NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = payload;

    const serverKey = process.env.MIDTRANS_SERVER_KEY!;

    const expectedSignature = crypto
      .createHash("sha512")
      .update(
        `${order_id}${status_code}${gross_amount}${serverKey}`
      )
      .digest("hex");

    const valid =
      typeof signature_key === "string" &&
      signature_key.length === expectedSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(signature_key),
        Buffer.from(expectedSignature)
      );

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { orderId: order_id },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment tidak ditemukan" },
        { status: 404 }
      );
    }

    if (
      Number(gross_amount) !== payment.amount
    ) {
      return NextResponse.json(
        { error: "Nominal pembayaran tidak sesuai" },
        { status: 400 }
      );
    }

    const paid =
      transaction_status === "settlement" ||
      (
        transaction_status === "capture" &&
        fraud_status === "accept"
      );

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: order_id },
        data: { status: transaction_status },
      });

      if (paid) {
        const user = await tx.user.findUnique({
          where: { id: payment.userId },
        });

        if (!user) {
          throw new Error("User tidak ditemukan");
        }

        const now = new Date();

        const currentEnd = user.subscriptionEndsAt;
        const startDate =
          user.subscriptionStatus === "Premium" &&
          currentEnd &&
          currentEnd > now
            ? currentEnd
            : now;

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        await tx.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: "Premium",
            subscriptionEndsAt: endDate,
          },
        });
      }
    });

    return NextResponse.json({ status: "OK" });

  } catch (error) {
    console.error("Webhook Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
