import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({adapter});

export async function GET() {
    try{
        const inspection = await prisma.inspection.findMany({
            orderBy: { createdAt: 'desc'},
        });

        return NextResponse.json({
            success: true, data: inspection });

    } catch (error) {
        console.error("Gagal mengambil data:", error);
        return NextResponse.json({ error: 'Gagal mengambil data'}, {status: 500 });
    }
}