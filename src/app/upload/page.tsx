'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle2, RefreshCw, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export default function UploadPage(){
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [beforeImage, setBeforeImage]= useState<string | null>(null);
    const [afterImage, setAfterImage]= useState<string |null>(null);
    const [assetName, setAssetName] = useState('');
    const [assetSn, setAssetSn] = useState('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === 'before') setBeforeImage(reader.result as string);
          else setAfterImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }

    const handleCompare = async () => {
      if(!beforeImage || !afterImage){
        alert("Harap unggah kedua foto (Before dan After) terlebih dahulu");
        return;
      }
      if(!assetName.trim || !assetSn.trim()) {
        alert("Harap isi Nama Barang dan Serial Number (SN)!");
        return;
      }
        setIsLoading(true);
        try{
          const beforeRes = await fetch(beforeImage);
          const beforeBlob = await beforeRes.blob();
          const afterRes = await fetch(afterImage);
          const afterBlob = await afterRes.blob(); 

          const formData = new FormData();
          formData.append("before", new File ([beforeBlob], "before.jpg", {type: "image/jpeg"}));
          formData.append("after", new File ([afterBlob], "after.jpg", {type: "image/jpeg"}));

          const response = await fetch ('/api/compare',{
            method: 'POST',
            body: formData,
          });

            const data = await response.json();
            if (data.success && data.data){
                localStorage.setItem('aiResult', JSON.stringify(data.data));
                localStorage.setItem('beforePhoto', beforeImage!);
                localStorage.setItem('afterPhoto', afterImage);
                router.push('/detail');
            } else{
              alert(data.error || "Gagal menganalisis Gambar")
            }
        } catch(error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    return(
        <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
         <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-100 text-[#7a1b2f] text-[10px] font-bold px-2 py-0.5 rounded uppercase">Analisis Visual A/B</span>
              <span className="text-xs text-gray-500">Pipeline Forensik v2.4</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Unggah Foto Kondisi Barang</h1>
            
            <p className="text-gray-500 mt-1">Bandingkan foto sebelum disewakan (Before) dan setelah dikembalikan (After) untuk mendeteksi perubahan visual, lecet mikro, dan anomali fisik secara instan.</p>
         </div>
         <div className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7a1b2f]"></span> Engine Model: Forensix-V3 Neural Comparator
         </div>
      </div>
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
              <Camera className="w-6 h-6 text-gray-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Nama Barang / Unit</label>
                <input 
                type="text" 
                placeholder="Contoh: Sony Alpha A7 IV"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full h-8 text-sm border border-gray-300 rounded px-2 focus:outline-none focus:ring-1 focus:ring-[#7a1b2f]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Serial Number (SN)</label>
                <input 
                type="text"
                placeholder="Contoh: SN-849021"
                value={assetSn}
                onChange={(e) => setAssetSn(e.target.value)}
                className="w-full h-8 text-sm border border-gray-300 rounded px-2 focus:outline-none focus:ring-1 focus:ring-[#7a1b2f]"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500"/> Status Aset: Aktif Disewakan</span>
            <Button variant="outline" size="sm" className="h-8">Ubah Unit</Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded">1. BASELINE (BEFORE)</span>
              <span className="text-xs text-gray-500">Kondisi Awal</span>
            </div>
            <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-gray-100 h-8 px-3">
           <RefreshCw className="w-3 h-3 mr-1"/> Ganti Foto
           <input type="file" accept="image/*" className="hidden" onChange= {(e) => handleImageUpload(e, 'before')} />
           </label>
             </div>
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] bg-gray-100">
              <img src={beforeImage || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"} alt="Baseline" className="w-full h-full object-cover" />
              <span className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">Kondisi Mulus (Pristine)</span>
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-[10px] px-2 py-1 rounded">EXIF: 50mm • ISO 100 • 1/160s</div>
            </div>
          </CardContent>
          <div className="p-4 flex justify-between items-center text-xs text-gray-500 bg-white">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500"/> Foto terverifikasi</span>
            <span>12 Okt 2023, 09:30 WIB • 3.4 MB • Hash: #a9f02c</span>
          </div>
        </Card>
         <Card className="border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-[#7a1b2f] text-xs font-bold px-2 py-1 rounded">2. PENGEMBALIAN (AFTER)</span>
              <span className="text-xs text-gray-500">Siap Dianalisis</span>
            </div>
            <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-gray-100 h-8 px-3">
           <RefreshCw className="w-3 h-3 mr-1"/> Ganti Foto
           <input type="file" accept="image/*" className="hidden" onChange= {(e) => handleImageUpload(e, 'after')} />
           </label>
          </div>
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] bg-gray-100">
              <img src={afterImage || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"} alt="After" className="w-full h-full object-cover filter contrast-125 brightness-90" />
              <span className="absolute top-4 left-4 bg-[#7a1b2f] text-white text-[10px] font-bold px-2 py-1 rounded">Baru Diunggah</span>
              
              <div className="absolute top-1/4 right-1/4 w-32 h-24 border-2 border-red-500 bg-red-500/20 backdrop-blur-sm">
                <div className="absolute -top-5 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-t-sm">Area Discrepancy</div>
                <div className="absolute -bottom-5 right-0 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-b-sm">Potensi Scuff</div>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-[10px] px-2 py-1 rounded">EXIF: 50mm • ISO 120 • 1/160s</div>
            </div>
          </CardContent>
           <div className="p-4 flex justify-between items-center text-xs text-gray-500 bg-white">
            <span className="flex items-center gap-1"><ShieldAlert className="w-4 h-4 text-red-500"/> Foto baru diunggah</span>
            <span>Hari ini, 14:15 WIB • 3.8 MB • Hash: #d4e81b</span>
          </div>
        </Card>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#7a1b2f]" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Kalibrasi Deteksi Maksimal</div>
            <div className="text-xs text-gray-500">Tips: Ambil foto dari sudut dan pencahayaan yang serupa agar deteksi visual AI bekerja optimal tanpa bias bayangan.</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Sudut Cocok</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Luminansi Seimbang</span>
        </div>
      </div>
        <div className="flex flex-col items-center justify-center space-y-3 pt-6 pb-12">
        <Button 
          onClick={handleCompare} 
          disabled={isLoading}
          className="bg-[#7a1b2f] hover:bg-[#5c1423] text-white px-8 py-6 text-lg rounded-lg shadow-md disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">Memproses Analisis AI...</span>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" /> Bandingkan dengan AI <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Enkripsi SHA-256 Otentik • Waktu Komparasi Est. ~1.8 detik
        </p> 
      </div> 
      </div> 
    );
}