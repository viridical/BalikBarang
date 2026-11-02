import { NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

export async function POST(req: Request){
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    const { order_id, status_code, gross_amount, signature_key, transaction_status, customer_details} = payload;
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;

    const hash = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  if (hash !== signature_key) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }
  if (transaction_status === "settlement" || transaction_status === "capture") {
    const customerEmail = customer_details?.email;

    if (customerEmail) {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      await prisma.user.update({
        where: {email: customerEmail},
        data: {
          subscriptionStatus: 'Premium',
          subscriptionEndsAt: oneMonthFromNow,
        },
      });
      console.log(`User ${customerEmail} berhasil menjadi Premium.`);
    } else {
      console.log("Pembayaran sukses, tetapi email tidak ditemukan.");
    }
  }
  return NextResponse.json({status: "OK"});
} catch (error) {
  console.error("Webhook Error", error);
  return NextResponse.json ({error: "Internal Server Error"}, {status: 500});
}
}