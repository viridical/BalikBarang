import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg ({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient ({ adapter });

export async function GET(req: Request) {
    try {
    const {searchParams} = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) {
        return NextResponse.json({error: 'Email diperlukan'}, {status: 400});
    }
    const user = await prisma.user.findUnique({
        where:{email},
    });
    if (!user) {
        return NextResponse.json({error: 'User tidak ditemukan'}, {status: 404});
    }
    const isPremium =
    user.subscriptionStatus === 'Premium' &&
    user.subscriptionEndsAt &&
    new Date(user.subscriptionEndsAt) > new Date ();

    return NextResponse.json({
        status: isPremium? 'Premium' : 'Free',
        subscriptionEndsAt: user.subscriptionEndsAt,
    });
} catch (error) {
    console.error("API Subscription Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}