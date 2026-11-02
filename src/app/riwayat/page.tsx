'use client';

import Link from 'next/link';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight, ArrowRightLeft, Eye } from 'lucide-react';

export default function RiwayatPage({ onNavigate }: { onNavigate: (page: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7a1b2f]"></span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Archived Verification Logs</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Riwayat Pemeriksaan Kondisi</h1>
          <p className="text-gray-500 mt-1 max-w-2xl">Daftar seluruh dokumentasi perbandingan kondisi barang rental yang pernah dianalisis secara forensik berbasis AI visual timeline.</p>
        </div>
        <div className="flex gap-4 bg-white p-3 rounded-lg border shadow-sm w-full sm:w-auto">
          <div>
            <div className="text-xs text-gray-500 uppercase">Total Logged</div>
            <div className="text-xl font-bold text-gray-900">28 <span className="text-sm font-normal">Aset</span></div>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div>
            <div className="text-xs text-[#7a1b2f] uppercase">Discrepancies</div>
            <div className="text-xl font-bold text-[#7a1b2f]">6 <span className="text-sm font-normal">Item</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input placeholder="Cari nama barang atau serial number..." className="pl-9 bg-gray-50 border-0" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="default" className="bg-[#2d3748] text-white">Semua (28)</Button>
          <Button variant="outline" className="text-gray-600">Ada Indikasi Perubahan (6)</Button>
          <Button variant="outline" className="text-gray-600">Kondisi Sesuai (22)</Button>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { id: '#BB-2023-1092', sn: 'SN-849201', time: '24 Okt 2023, 14:20 WIB', name: 'Sony Alpha A7 IV Body Only', status: 'alert', text: '2 Indikasi Perubahan Visual', conf: '94.8%' },
          { id: '#BB-2023-1088', sn: 'SN-772910', time: '23 Okt 2023, 11:05 WIB', name: 'DJI Ronin RS3 Pro Combo', status: 'safe', text: 'Kondisi Sesuai / Bersih', conf: '99.4%' },
          { id: '#BB-2023-1074', sn: 'SN-994120', time: '18 Okt 2023, 16:40 WIB', name: 'MacBook Pro M2 Max 16"', status: 'alert', text: '1 Indikasi Perubahan Visual', conf: '91.2%' },
          { id: '#BB-2023-1065', sn: 'SN-338102', time: '16 Okt 2023, 10:15 WIB', name: 'Lens Sony FE 70-200mm f/2.8 GM II', status: 'safe', text: 'Kondisi Sesuai / Bersih', conf: '99.8%' },
        ].map((item, i) => (
          <Card key={i} className="p-6 flex flex-col lg:flex-row items-center gap-6 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span className="bg-gray-100 px-2 py-1 rounded">{item.id}</span>
                <span>{item.sn}</span>
                <span>•</span>
                <span>{item.time}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{item.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                  item.status === 'alert' ? 'bg-red-50 text-[#7a1b2f]' : 'bg-gray-100 text-gray-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'alert' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                  {item.text}
                </span>
                <span className="text-xs text-gray-500">Conf: {item.conf}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto overflow-hidden">
              <div className="relative w-32 h-24 rounded overflow-hidden border">
                <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80" alt="Before" className="object-cover w-full h-full" />
                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded">BEFORE (IN)</span>
              </div>
              <ArrowRightLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="relative w-32 h-24 rounded overflow-hidden border">
                <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80" alt="After" className="object-cover w-full h-full filter contrast-125" />
                <span className="absolute bottom-1 left-1 bg-[#7a1b2f] text-white text-[10px] px-1 rounded">AFTER (OUT)</span>
              </div>
            </div>

            <div className="w-full lg:w-auto text-right">
              <Link href="/detail">
              <Button variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-800 w-full lg:w-auto">
                Lihat Detail Hasil <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 text-sm text-gray-500">
        <span className="flex items-center gap-2"><Eye className="w-4 h-4"/> Menampilkan 4 dari 28 riwayat pemeriksaan</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>&lt;</Button>
          <Button variant="outline" size="sm" className="h-8 px-3 bg-gray-100">1 / 7</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">&gt;</Button>
        </div>
      </div>
    </div>
  );
}