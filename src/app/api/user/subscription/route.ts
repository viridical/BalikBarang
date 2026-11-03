
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const isPremium =
      user.subscriptionStatus === "Premium" &&
      user.subscriptionEndsAt !== null &&
      user.subscriptionEndsAt > new Date();

    // Jika masa aktif habis, ubah kembali menjadi Free.
    if (
      user.subscriptionStatus === "Premium" &&
      !isPremium
    ) {
      await prisma.user.update({
        where: {
          email: session.user.email,
        },
        data: {
          subscriptionStatus: "Free",
        },
      });
    }

    return NextResponse.json({
      status: isPremium ? "Premium" : "Free",
      endsAt: isPremium
        ? user.subscriptionEndsAt
        : null,
    });

  } catch (error) {
    console.error("Subscription API Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
