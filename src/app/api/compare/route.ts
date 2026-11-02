import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg";
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST (request: Request){
    try{
        if(!process.env.GEMINI_API_KEY) {
            return Response.json(
                {error: "API key Gemini belum dikonfigurasi."},
                { status: 500}
            );
        }
        const formData = await request.formData();
        const before = formData.get("before");
        const after = formData.get("after");
        const assetName = formData.get("assetName") as string || "Barang Tanpa Nama";
        const assetSn = formData.get("assetSn") as string || "SN-UNKNOWN"

        if (!(before instanceof File) || !(after instanceof File)) {
            return Response.json(
                { error: "Foto before dan after wajib diunggah."},
                { status: 400}
            );
        }
        for (const file of [before, after]) {
            if (!allowedTypes.includes(file.type)) {
                return Response.json(
                    { error: "Gunakan foto JPEG, PNG, atau WEBP."},
                    {status: 400}
                );
            }
                    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
            return Response.json(
                {error: "Ukuran setiap foto maksimal 5 MB"},
                { status: 400}
                );
            }
        }
        const [beforeBuffer, afterBuffer] = await Promise.all([
            before.arrayBuffer(),
            after.arrayBuffer(),
        ]);
        const beforeBase64 = Buffer.from(beforeBuffer).toString("base64");
        const afterBase64 = Buffer.from(afterBuffer).toString("base64");

              const prompt = `
        Anda adalah AI inspektur barang rental. Bandingkan Gambar 1 (Before) dan Gambar 2 (After).
        Cari kerusakan fisik baru seperti goresan, penyok, atau retak. Abaikan perbedaan cahaya atau sudut foto.

        Balas HANYA dengan format JSON ini:
        {
          "status": "SAFE" atau "DISCREPANCY",
          "confidence": (angka 0-100),
          "anomalies": [
            {
              "id": 1,
              "type": "Tipe kerusakan (misal: Scratch)",
              "location": "Lokasi singkat",
              "size": "Ukuran (misal: 3cm)",
              "severity": "Cosmetic" atau "Structural",
              "xPercent": (angka 0-100 dari kiri),
              "yPercent": (angka 0-100 dari atas)
            }
          ]
        }
        Jika tidak ada kerusakan, isi "anomalies" dengan [].
        `;

        const result = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData:{
                            mimeType: before.type,
                            data: beforeBase64,
                            },
                        },
                        {inlineData:{
                            mimeType: after.type,
                            data: afterBase64,
                            },
                        },
                    ],
                },
            ],

            config: {
                responseMimeType: "application/json",
            },
        });

        const output = result.text;

        if (!output){
            throw new Error("Gemini tidak memberikan hasil.");
        }
        let analysis: any;

        try {
            analysis = JSON.parse(output);
        }
        catch {
            throw new Error("Format hasil analisis tidak valid.");
        }

        const savedInspection = await prisma.inspection.create({
            data: {
                assetId: `${assetName} (${assetSn})`,
                beforeImage: "https://",
                afterImage: "https://",
                status: analysis.status,
                confidence: analysis.confidence,
                anomalies: JSON.stringify(analysis.anomalies),
                userId: null,
            }
        });
        return Response.json ({ success: true, data: analysis });
    }
    catch (error){
        console.error("Gemini comparison error:", error);

        return Response.json(
            { error: "Analisis gagal. Coba lagi dengan foto yang lebih jelas."},
            {status: 500});
    }
}