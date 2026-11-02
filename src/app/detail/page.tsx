'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, ShieldAlert, Download, Fingerprint, ScanLine, CheckCircle2, Search } from 'lucide-react';

export default function DetailAnalysisPage() {
   const router = useRouter();
   const [aiData, setAiData] = useState<any>(null);
   const [beforeImage, setBeforeImage] = useState<string | null>(null);
   const [afterImage, setAfterImage] = useState<string | null>(null);

   const handleSave = () => {
      alert("Data berhasil disimpan!");
      router.push('/dashboard');
   };

   useEffect(() => {
      const savedResult = localStorage.getItem('aiResult');
      const savedBefore = localStorage.getItem('beforePhoto');
      const savedAfter = localStorage.getItem('afterPhoto');

      if (savedResult && savedResult !== "undefined") {
      try {
         setAiData(JSON.parse(savedResult));
      }
      catch(error) {
         console.error("Gagal parse Data AI:", error);
         localStorage.removeItem('aiResult');
      }
   } 
      if (savedBefore) setBeforeImage(savedBefore);
      if (savedAfter) setAfterImage (savedAfter);
   }, []);

   if (!aiData) return <div className="p-8 text-center">Memuat hasil analisis...</div>
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#7a1b2f] uppercase tracking-wider">Forensic Inspection Log</span>
            <span className="text-xs text-gray-500">ID: RPT-2023-SONY-782</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Hasil Analisis AI: Sony Alpha A7 IV (SN-849201)</h1>
          <p className="text-sm text-gray-500 mt-1">Diperiksa: 24 Okt 2023, 14:22 WIB • Model: Visual Inspection v2.1 (Neural Parity Matcher)</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
         <Link href="/dashboard" >
         <Button variant="outline" className="flex-1 sm:flex-none">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Dashboard
         </Button>
         </Link>
          <Button onClick={handleSave} className="bg-[#7a1b2f] hover:bg-[#5c1423] text-white flex-1 sm:flex-none">
            <Save className="mr-2 h-4 w-4" /> Simpan ke Riwayat
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 rounded-full mt-0.5">
            <ShieldAlert className="w-5 h-5 text-[#7a1b2f]" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Catatan: Hasil analisis AI merupakan indikasi perubahan visual yang perlu diverifikasi langsung oleh pihak pemilik dan penyewa.</p>
            <p className="text-xs text-gray-500 mt-1">bukan kepastian mutlak kerusakan baru.</p>
          </div>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">ISO 27037 Compliant</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              <span className="font-bold text-sm text-gray-900">Kondisi Before (Sebelum Sewa)</span>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Mulus / Tanpa Anomali</span>
          </div>
          <div className="relative aspect-[4/3] bg-gray-100">
             <img src={beforeImage || "https://"} alt="Before" className="w-full h-full object-cover" />
             
             <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-white/20 border border-white/50 backdrop-blur-sm pointer-events-none">
                <span className="absolute -top-6 left-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Ref: Area 2</span>
             </div>
             <div className="absolute bottom-1/4 left-1/4 w-24 h-16 bg-white/20 border border-white/50 backdrop-blur-sm pointer-events-none">
                <span className="absolute -bottom-6 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Ref: Area 1</span>
             </div>

             <div className="absolute bottom-4 left-4 bg-black/80 text-white text-xs px-2 py-1 rounded">LOG: 18 OKT 2023 10:14 WIB • EXIF VERIFIED</div>
          </div>
          <div className="p-4 flex justify-between items-center text-xs text-gray-500 bg-white">
            <span>Resolusi: 33.0 MP Baseline Frame</span>
            <span>Integritas Hash: SHA-256 Valid</span>
          </div>
        </Card>

        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7a1b2f]"></span>
              <span className="font-bold text-sm text-gray-900">Kondisi After (Setelah Pengembalian)</span>
            </div>
            <span className="text-xs bg-[#7a1b2f] text-white px-2 py-1 rounded">{aiData.anomalies?.length || 0} Anomali Ditemukan</span>
          </div>
          <div className="relative aspect-[4/3] bg-gray-100">
             <img src={afterImage || "https://"} alt="After" className="w-full h-full object-cover filter contrast-125 brightness-90" />
             
             <div className="absolute top-4 left-4 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> OVERLAY AKTIF: KLIK PIN UNTUK INSPEKSI
             </div>

             <div className="absolute top-1/3 right-1/4 flex items-center gap-2">
                <span className="bg-[#7a1b2f] text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">PIN [2] • Micro</span>
                <div className="w-4 h-4 bg-red-500/80 rounded-full border-2 border-white shadow-lg cursor-pointer"></div>
             </div>

             <div className="absolute bottom-1/3 left-1/3 flex items-center gap-2">
                <div className="w-5 h-5 bg-[#7a1b2f] rounded-full border-2 border-white shadow-lg cursor-pointer flex items-center justify-center text-[10px] text-white">1</div>
                <span className="bg-[#7a1b2f] text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">PIN [1] • 3.2cm</span>
             </div>

             <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded">LOG: 24 OKT 2023 14:18 WIB</div>
          </div>
          <div className="p-4 flex justify-between items-center text-xs text-gray-500 bg-white">
            <span>AI Delta Vector: 98.4% Confidence Score</span>
            <span className="text-[#7a1b2f] font-medium">Delta Koordinat Terkunci</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b">
               <CardTitle className="text-xs font-semibold text-gray-500 uppercase flex justify-between items-center">
                  <span>Status Validasi Visual</span>
                  <span className="text-gray-400 text-[10px] normal-case">Algoritma: Structural Similarity (SSIM)</span>
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               <div className="bg-red-50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-[#7a1b2f] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#7a1b2f]">{aiData.anomalies?.length || 0} Indikasi Perubahan</div>
                    <div className="text-xs text-red-700 mt-1">Terdeteksi pada area kosmetik eksternal kamera</div>
                  </div>
               </div>

               <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-medium text-gray-700">
                     <span>Tingkat Kemiripan Keseluruhan</span>
                     <span className="font-bold text-[#7a1b2f]">{aiData.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                     <div className="bg-[#7a1b2f] h-2 rounded-full" style={{ width: `${aiData.confidence}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                     <span>Deviasi: 5.2% (Area minor)</span>
                     <span>Batas Toleransi: 2.0%</span>
                  </div>
               </div>

               <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 mb-2">
                     <ScanLine className="w-4 h-4 text-[#7a1b2f]"/> Kesimpulan & Rekomendasi AI
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                     Fungsi mekanis tidak dapat dipastikan lewat foto visual. Disarankan pemeriksaan fisik bersama penyewa untuk fungsi shutter counter, mounting sensor, dan responsivitas dial.
                  </p>
               </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm bg-gray-50/50">
             <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm">
                      <Fingerprint className="w-5 h-5 text-gray-400" />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-gray-900">Viridical Iveniar S.D</div>
                      <div className="text-xs text-gray-500">Lead Quality Assurance Inspector</div>
                   </div>
                </div>
                <span className="text-xs font-medium text-gray-600 bg-white border px-2 py-1 rounded shadow-sm flex items-center gap-1">
                   <CheckCircle2 className="w-3 h-3 text-green-500" /> E-Signed
                </span>
             </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b bg-white">
               <CardTitle className="text-sm font-bold text-gray-900 flex justify-between items-center">
                  <span className="flex items-center gap-2">Rincian Perubahan yang Ditemukan <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">2 Item</span></span>
                  <span className="text-xs text-gray-500 font-normal">Klik kartu untuk menyorot koordinat foto</span>
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
             {aiData.anomalies?.length > 0 ? (
               aiData.anomalies.map((anomaly: any, index: number) => (
                   <div key={index} className="p-5 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
                     <div className="flex items-start gap-4">
                     <div className="w-6 h-6 rounded bg-[#7a1b2f] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</div>
                   <div className="flex-1">
                   <div className="flex justify-between items-start mb-1">
                     <h4 className="font-bold text-gray-900 flex items-center gap-2">{anomaly.location || "Area Tidak Diketahui"} 
                       <span className="bg-red-50 text-[#7a1b2f] text-[10px] px-1.5 py-0.5 rounded font-medium border border-red-100">{anomaly.type} {anomaly.size ? `±${anomaly.size}` : ''}</span>
                     </h4>
                     <Search className="w-4 h-4 text-gray-400 group-hover:text-[#7A1B2F]" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                     AI mendeteksi adanya {anomaly.type} pada area {anomaly.location}.
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                     <span className="bg-gray-100 px-2 py-1 rounded">Keparahan: {anomaly.severity || "Unknown"}</span>
                  </div>
                 </div>
               </div>
            </div>
               ))
             ): (
               <div className="p-8 text-center text-green-600 font-medium">
                  Tidak ada anomali yang ditemukan. Kondisi aman. 
               </div>
             )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 p-4 rounded-lg border border-gray-200 gap-4">
             <div className="flex items-center gap-2 text-xs text-gray-600">
                <ShieldAlert className="w-4 h-4 text-[#7a1b2f]" /> Audit tercatat permanen pada sistem penyimpanan aman BalikBarang Ledger.
             </div>
             <Button variant="outline" size="sm" className="bg-white">
                Ekspor PDF Evidensi <Download className="w-4 h-4 ml-2" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}