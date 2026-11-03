"use client";

import Script from "next/script";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown } from "lucide-react";

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [subscription, setSubscription] = useState<{ status: string; endsAt: string | null } | null>(null);

  const checkSubscription = async () => {
    if (!session?.user?.email) {
      setIsChecking(false);
      return;
    }
    try {
      const res = await fetch(`/api/user/subscription?email=${session.user.email}`);
      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.error("Gagal mengecek langganan:", error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [session]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `SUB-${Date.now()}`,
          grossAmount: 99000,
          customerEmail: session?.user?.email,
        }),
      });
      const data = await res.json();

      if (data.token && (window as any).snap) {
        (window as any).snap.pay(data.token, {
          onSuccess: function () {
            alert("Pembayaran Berhasil! Status Anda akan diperbarui.");
            // Tunggu 2 detik agar webhook selesai memproses, lalu cek ulang status
            setTimeout(() => {
              checkSubscription();
            }, 2000);
          },
          onPending: function () {
            alert("Menunggu Pembayaran");
          },
          onError: function () {
            alert("Pembayaran Gagal!");
          },
        });
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return <div className="p-8 text-center text-gray-500">Memeriksa status langganan...</div>;
  }

  const isPremium = subscription?.status === "Premium";

  return (
    <div className="p-8">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="beforeInteractive"
      />

      <div className="text-center mb-12">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Langganan Premium</h1>
        <p className="text-gray-500 mt-2">Dapatkan akses tanpa batas ke fitur analisis AI.</p>
      </div>

      <Card className="max-w-md mx-auto border-gray-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-[#7a1b2f] mb-2">Pro Plan</h2>
          <div className="text-4xl font-bold text-gray-900 mb-6">
            Rp 99.000<span className="text-sm font-normal text-gray-500">/bulan</span>
          </div>

          <ul className="text-left text-sm text-gray-600 space-y-2 mb-8">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Unlimited analisis AI
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Riwayat tak terbatas
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Prioritas dukungan
            </li>
          </ul>

          {isPremium ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              <div className="flex items-center justify-center gap-2 font-bold mb-1">
                <Crown className="w-5 h-5" /> Anda Sudah Premium!
              </div>
              <p className="text-xs">
                Masa aktif hingga:{" "}
                {new Date(subscription.endsAt!).toLocaleDateString("id-ID", { dateStyle: "long" })}
              </p>
            </div>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-[#7a1b2f] hover:bg-[#5c1423] text-white h-12"
            >
              {isLoading ? "Memproses..." : "Berlangganan Sekarang"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}