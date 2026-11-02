'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Lock } from 'lucide-react';

export default function LoginPage(){
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardContent className="p-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-[#7a1b2f] rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#7a1b2f]"></span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sistem Audit Forensik Sewa</span>
          </div>
          
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Masuk ke BalikBarang</h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            Verifikasi kondisi barang rental sebelum dan sesudah sewa dengan bantuan AI.
          </p>

          <div className="w-full bg-gray-100 rounded-lg p-4 mb-8 relative">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>PRATINJAU KOMPARASI AI</span>
              <span>99.8% Presisi</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative aspect-video bg-gray-300 rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80" alt="Lens" className="object-cover w-full h-full opacity-80" />
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">Pra-Sewa</span>
              </div>
              <div className="relative aspect-video bg-gray-300 rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80" alt="Lens" className="object-cover w-full h-full opacity-80" />
                <span className="absolute bottom-1 left-1 bg-[#7a1b2f] text-white text-[10px] px-1 rounded">Pasca-Sewa</span>
                <div className="absolute top-2 right-2 bg-red-500 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white">1</div>
              </div>
            </div>
          </div>

          <Button onClick={() => signIn('google',{callbackUrl:'/dashboard'})} className="w-full bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 h-12">
            <Home className="mr-2 h-5 w-5" />
            Masuk dengan Akun Google
          </Button>

          <p className="text-xs text-gray-500 mt-6 text-center">
            Cepat, transparan, dan melindungi pemilik serta penyewa barang.
          </p>
          
          <div className="w-full mt-6 bg-gray-50 rounded p-3 flex items-center justify-center gap-2 text-xs text-gray-600">
            <Lock className="w-4 h-4" /> Enkripsi data & privasi foto terlindungi
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 text-xs text-gray-400 flex gap-4">
        <span>Protokol ISO 27001</span>
        <span>•</span>
        <span>Bukti Sah Digital</span>
        <span>•</span>
        <span>AI Visual Log</span>
      </div>
    </div>
  );
}