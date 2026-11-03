import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { orderId, grossAmount, customerEmail } = await req.json();

    const isProduction =
      process.env.MIDTRANS_IS_PRODUCTION === "true";

    const snapUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const auth = Buffer.from(
      `${process.env.MIDTRANS_SERVER_KEY}:`
    ).toString("base64");

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
        customer_details: {
          email: customerEmail,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Midtrans Error:", data);
      return NextResponse.json(
        { error: "Gagal membuat transaksi" },
        { status: 502 }
      );
    }

    return NextResponse.json({ token: data.token });

  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
