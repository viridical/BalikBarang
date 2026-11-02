import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg ({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient ({ adapter });

export async function GET(
    request: Request,
    { params }: { params: Promise<{id: string}>}
) {
    try {
        const { id } = await params;
        const inspection = await prisma.inspection.findUnique({
            where: {id},
        });
        if (!inspection) {
            return NextResponse.json ({ error: 'Data tidak ditemukan'}, {status: 404});
        }
        return NextResponse.json ({ success: true, data: inspection });
    } catch (error) {
        console.error("Gagal mengambil detail:", error);
        return NextResponse.json ({ error:'Gagal mengambil data'}, {status: 300});
    }
}