
"use client";

import Script from "next/script";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown } from "lucide-react";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default function SubscriptionPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [isSnapReady, setIsSnapReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const [subscription, setSubscription] = useState<{
    status: string;
    endsAt: string | null;
  } | null>(null);

  // Mengambil status subscription
  const checkSubscription = useCallback(async () => {
    if (!session?.user?.email) return null;

    try {
      const res = await fetch("/api/user/subscription", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil status subscription");
      }

      const data = await res.json();
      setSubscription(data);

      return data;
    } catch (error) {
      console.error("Subscription Error:", error);
      return null;
    }
  }, [session?.user?.email]);

  // Pemeriksaan awal
  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (!session?.user?.email) {
      setIsChecking(false);
      return;
    }

    let cancelled = false;

    checkSubscription().finally(() => {
      if (!cancelled) setIsChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [session, sessionStatus, checkSubscription]);

  // Verifikasi pembayaran langsung ke backend
  const verifyPayment = async (orderId: string) => {
    setIsVerifying(true);

    try {
      for (let i = 0; i < 10; i++) {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
          cache: "no-store",
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(
            result.error || "Gagal memverifikasi pembayaran"
          );
        }

        console.log("Payment Verification:", result);

        if (result.status === "success") {
          const data = await checkSubscription();

          if (
            data?.status === "Premium" &&
            data?.endsAt &&
            new Date(data.endsAt).getTime() > Date.now()
          ) {
            alert("Pembayaran berhasil! Akun lu sekarang Premium.");
            return true;
          }
        }

        if (
          ["deny", "cancel", "expire"].includes(result.status)
        ) {
          alert(`Pembayaran ${result.status}.`);
          return false;
        }

        await delay(2000);
      }

      alert(
        "Pembayaran belum terkonfirmasi. Silakan periksa kembali beberapa saat lagi."
      );

      return false;
    } catch (error) {
      console.error("Payment Verification Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal memverifikasi pembayaran."
      );

      return false;
    } finally {
      setIsVerifying(false);
      setIsLoading(false);
    }
  };

  // Memproses pembayaran
  const handleSubscribe = async () => {
    if (isLoading) return;

    if (!session?.user?.email) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    if (!isSnapReady || !window.snap?.pay) {
      alert("Midtrans belum siap. Silakan coba kembali.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat transaksi");
      }

      if (!data.token || !data.orderId) {
        throw new Error("Token atau Order ID tidak ditemukan");
      }

      window.snap.pay(data.token, {
        onSuccess: async (result) => {
          console.log("Payment Success:", result);

          await verifyPayment(data.orderId);
        },

        onPending: async (result) => {
          console.log("Payment Pending:", result);

          setIsLoading(false);

          alert("Pembayaran masih menunggu konfirmasi.");
        },

        onError: (result) => {
          console.error("Payment Failed:", result);

          setIsLoading(false);
          alert("Pembayaran gagal.");
        },

        onClose: () => {
          console.log("Popup Midtrans ditutup");

          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Payment Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pembayaran."
      );

      setIsLoading(false);
    }
  };

  if (isChecking || sessionStatus === "loading") {
    return (
      <div className="p-8 text-center text-gray-500">
        Memeriksa status langganan...
      </div>
    );
  }

  const isPremium =
    subscription?.status === "Premium" &&
    !!subscription.endsAt &&
    new Date(subscription.endsAt).getTime() > Date.now();

  const snapSrc =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <div className="p-8">
      <Script
        id="midtrans-snap"
        src={snapSrc}
        data-client-key={
          process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
        }
        strategy="afterInteractive"
        onReady={() => {
          console.log("Snap script ready:", !!window.snap?.pay);
          setIsSnapReady(!!window.snap?.pay);
        }}
        onError={() => {
          console.error("Gagal memuat Snap.js");
          setIsSnapReady(false);
        }}
      />

      <div className="text-center mb-12">
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          Langganan Premium
        </h1>

        <p className="text-gray-500 mt-2">
          Dapatkan akses tanpa batas ke fitur analisis AI.
        </p>
      </div>

      <Card className="max-w-md mx-auto border-gray-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-[#7a1b2f] mb-2">
            Pro Plan
          </h2>

          <div className="text-4xl font-bold text-gray-900 mb-6">
            Rp 99.000
            <span className="text-sm font-normal text-gray-500">
              /bulan
            </span>
          </div>

          <ul className="text-left text-sm text-gray-600 space-y-2 mb-8">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Unlimited analisis AI
            </li>

            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Riwayat tak terbatas
            </li>

            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Prioritas dukungan
            </li>
          </ul>

          {isPremium ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              <div className="flex items-center justify-center gap-2 font-bold mb-2">
                <Crown className="w-5 h-5" />
                Anda Sudah Premium!
              </div>

              <p className="text-sm">Status: Aktif</p>

              <p className="text-xs mt-1">
                Berlaku hingga:{" "}
                {new Date(subscription!.endsAt!).toLocaleDateString(
                  "id-ID",
                  { dateStyle: "long" }
                )}
              </p>
            </div>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={
                isLoading ||
                !isSnapReady ||
                isVerifying
              }
              className="w-full bg-[#7a1b2f] hover:bg-[#5c1423] text-white h-12"
            >
              {isVerifying
                ? "Memverifikasi Pembayaran..."
                : isLoading
                  ? "Memproses..."
                  : !isSnapReady
                    ? "Memuat Pembayaran..."
                    : "Berlangganan Sekarang"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
