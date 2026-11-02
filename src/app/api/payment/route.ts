import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { orderId, grossAmount } = await req.json();

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const auth = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64");

  const response = await fetch(snapUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: "Gagal membuat transaksi" }, { status: 502 });
  }

  return NextResponse.json({ token: data.token });
}