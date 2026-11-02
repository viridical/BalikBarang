'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, AlertTriangle, CheckCircle2, Search, Filter, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [inspections, setInspections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userName = session?.user?.name || 'Inspector';

  useEffect(() => {
    async function fetchData (){
      try {
        const res = await fetch ('/api/inspections');
        const data = await res.json();
        if (data.success) setInspections(data.data);
      } catch (error){
        console.error("Gagal mengambil data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const total = inspections.length;
  const discrepancy = inspections.filter(i => i.status === 'DISCREPANCY').length;
  const safe = inspections.filter(i => i.status === 'SAFE').length;
  
  if (isLoading) return <div className="p-8 text-center text-gray-500">Memuat data dashboard...</div>;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7a1b2f]"></span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verifikasi Forensik Aset Aktif</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Halo, {userName} 👋
          </h1>
          <p className="text-gray-500 mt-1">Pantau perbandingan visual kondisi peralatan sewa Anda secara instan dengan presisi bukti audit.</p>
        </div>
          <Link href="/upload"> 
          <Button className="bg-[#7A1B2F] hover:bg-[5C1423] text-white">
            <Camera className="mr-2 h-4 w-4" /> + Bandingkan Foto
          </Button>
          </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Pemeriksaan</p>
              <div className="p-1.5 bg-gray-100 rounded"><CheckCircle2 className="w-4 h-4 text-gray-500" /></div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{total} <span className="text-sm font-normal text-gray-500">Barang</span></div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Semua siklus tercatat</span>
              <span className="font-medium">100%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-semibold text-[#7a1b2f] uppercase">Perubahan Terdeteksi</p>
              <div className="p-1.5 bg-red-50 rounded"><AlertTriangle className="w-4 h-4 text-[#7a1b2f]" /></div>
            </div>
            <div className="text-3xl font-bold text-[#7a1b2f] mb-2">{discrepancy} <span className="text-sm font-normal text-gray-500">Barang</span></div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#7a1b2f] rounded-full"></span> Indikasi visual baru</span>
              <span className="font-medium text-[#7a1b2f]">21.4%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Kondisi Stabil / Aman</p>
              <div className="p-1.5 bg-gray-100 rounded"><CheckCircle2 className="w-4 h-4 text-gray-500" /></div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{safe} <span className="text-sm font-normal text-gray-500">Barang</span></div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span> Kesesuaian baseline penuh</span>
              <span className="font-medium">78.6%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="bg-white border-b pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Tinjauan Discrepancy Terakhir 
              <span className="text-[10px] bg-red-100 text-[#7a1b2f] px-2 py-0.5 rounded-full font-medium">AI Scan #8492</span>
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Perbandingan piksel visual Move-In vs. Return Check untuk Sony Alpha A7 IV</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-200 rounded-sm"></span> Baseline 01 Okt</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-sm"></span> Pengembalian Hari Ini</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative flex h-[400px]">
            <div className="w-1/2 bg-gray-100 relative group overflow-hidden">
               <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80" alt="Baseline" className="w-full h-full object-cover" />
               <span className="absolute top-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">BASELINE (MOVE-IN)</span>
            </div>
            <div className="w-1/2 bg-gray-100 relative group overflow-hidden">
               <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80" alt="Current" className="w-full h-full object-cover filter contrast-125 brightness-90" />
               <span className="absolute top-4 right-4 bg-[#7a1b2f] text-white text-xs px-2 py-1 rounded">RETURN CHECK (TODAY)</span>
               
               <div className="absolute top-1/4 right-1/4 w-32 h-24 border-2 border-red-500 bg-red-500/20 backdrop-blur-sm cursor-pointer">
                  <div className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-t-sm whitespace-nowrap">Goresan Prisma 2.2mm</div>
                  <div className="absolute bottom-1 right-1 text-[10px] text-white font-mono">Conf. 88.4%</div>
               </div>
            </div>
            <div className="absolute inset-y-0 left-1/2 w-1 bg-white -ml-0.5 cursor-ew-resize flex items-center justify-center">
               <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border">
                  <div className="flex gap-0.5">
                     <div className="w-0.5 h-3 bg-gray-400"></div>
                     <div className="w-0.5 h-3 bg-gray-400"></div>
                  </div>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Daftar Pemeriksaan Terbaru</h2>
            <p className="text-sm text-gray-500">Hasil perbandingan visual otomatis dengan pembuktian metadata digital.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Cari nama peralatan..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Nama Peralatan / Serial Aset</th>
                <th className="px-6 py-3 font-medium">Waktu Pemeriksaan</th>
                <th className="px-6 py-3 font-medium">Status Kondisi Visual</th>
                <th className="px-6 py-3 font-medium text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody>
            {inspections.length > 0 ? inspections.map((row) => (
              <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <Camera className="w-5 h-5 text-gray-400" />
                    </div>
                  <div>
                    <div className="font-medium text-gray-900">{row.assetId}</div>
                      <div className="text-xs text-gray-500">ID: {row.id.split('-')[0]}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{new Date(row.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  row.status === 'DISCREPANCY' ? 'bg-red-50 text-[#7a1b2f]' : 'bg-gray-100 text-gray-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'DISCREPANCY' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                  {row.status === 'DISCREPANCY' ? 'Ada Indikasi Perubahan' : 'Kondisi Sesuai / Aman'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/detail?id=${row.id}`}>
                    <Button variant="ghost" size="sm" className="text-[#7a1b2f] hover:text-[#5c1423]">
                    Buka Hasil <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </td>
             </tr>
            )) : (
             <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Belum ada data pemeriksaan.</td>
              </tr>
                      )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t flex justify-between items-center text-sm text-gray-500">
          <span>Menampilkan 4 dari 28 riwayat pemeriksaan</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
            <Button variant="outline" size="sm">Berikutnya</Button>
          </div>
        </div>
      </div>
    </div>
  );
}