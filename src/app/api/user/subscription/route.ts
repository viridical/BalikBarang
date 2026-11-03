import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const dynamic = 'force-dynamic'; // Pastikan tidak di-cache

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email diperlukan' }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }
    
    const isPremium = 
      user.subscriptionStatus === 'Premium' && 
      user.subscriptionEndsAt && 
      new Date(user.subscriptionEndsAt) > new Date();
    
    return NextResponse.json({
      status: isPremium ? 'Premium' : 'Free',
      subscriptionEndsAt: user.subscriptionEndsAt,
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' } // Pastikan respons tidak di-cache
    });
  } catch (error) {
    console.error("API Subscription Error:", error);
    return NextResponse.json({ error: 'Gagal memuat data langganan' }, { status: 500 });
  }
}