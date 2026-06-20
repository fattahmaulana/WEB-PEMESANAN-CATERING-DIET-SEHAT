import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, QrCode } from 'lucide-react';
import MenuCard from '../components/MenuCard';
import { useStore, MenuDiet } from '../lib/store';
import { jalankanSistemPakar, TingkatAktivitas, TujuanDiet, HasilInferensi, JenisKelamin } from '../utils/forwardChaining';
import HeroPlate from '../components/HeroPlate';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { menuDiet, penggunaAktif, tambahPesanan } = useStore();
  const navigate = useNavigate();
  const [showConsult, setShowConsult] = useState(false);
  const [result, setResult] = useState<HasilInferensi | null>(null);

  const [usia, setUsia] = useState<string>('25');
  const [gender, setGender] = useState<JenisKelamin>('L');
  const [beratBadan, setBeratBadan] = useState<string>('65');
  const [tinggiBadan, setTinggiBadan] = useState<string>('165');
  const [aktivitas, setAktivitas] = useState<TingkatAktivitas>('Sedang');
  const [tujuan, setTujuan] = useState<TujuanDiet>('T01');

  // Order Flow State
  const [activeMenu, setActiveMenu] = useState<MenuDiet | null>(null);
  const [jumlah, setJumlah] = useState('1');
  const [alamat, setAlamat] = useState('');
  const [showQris, setShowQris] = useState(false);
  const [bukti, setBukti] = useState<string | null>(null);

  const handleConsult = (e: React.FormEvent) => {
    e.preventDefault();
    const u = parseInt(usia);
    const w = parseFloat(beratBadan);
    const h = parseFloat(tinggiBadan);
    if (!u || !w || !h) return;

    const res = jalankanSistemPakar({ 
      usia: u, 
      gender, 
      beratBadan: w, 
      tinggiBadan: h, 
      levelAktivitas: aktivitas, 
      tujuanDiet: tujuan 
    }, menuDiet);
    setResult(res);
  };

  const handlePesanClick = (menuId: string) => {
    if (!penggunaAktif) {
      alert("Harap login terlebih dahulu untuk melakukan pemesanan.");
      navigate('/login');
      return;
    }
    const menu = menuDiet.find(m => m.id === menuId);
    if (menu) {
      setActiveMenu(menu);
      setJumlah('1');
      setAlamat('');
      setShowQris(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBukti(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processOrder = async () => {
    if (!activeMenu || !penggunaAktif) return;
    if (!bukti) {
      alert("Harap unggah bukti pembayaran terlebih dahulu.");
      return;
    }
    const qty = parseInt(jumlah) || 1;
    try {
      await tambahPesanan({
        idPengguna: penggunaAktif.id,
        idMenu: activeMenu.id,
        jumlah: qty,
        alamat,
        totalHarga: activeMenu.harga * qty,
        buktiPembayaran: bukti
      });
      alert("Pesanan berhasil dikonfirmasi! Silakan cek di Dashboard Anda.");
      setActiveMenu(null);
      setShowConsult(false);
      setResult(null);
      setBukti(null);
    } catch (err: any) {
      alert(err.message || 'Gagal membuat pesanan.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50 overflow-hidden selection:bg-lime-400 selection:text-zinc-950 pt-20">
      <main className="px-6 md:px-12 max-w-[1600px] mx-auto flex flex-col justify-center min-h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          <div className="lg:col-span-5 relative z-10 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider">Mesin Inferensi Aktif</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.95] tracking-tight text-white mb-6">
                METABOLISME<br />
                <span className="text-lime-400">PRESISI.</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed max-w-md">
                Sistem pakar yang merekayasa pola makan Anda berdasarkan kalibrasi BMR dan TDEE secara ilmiah.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button 
                onClick={() => {
                  setResult(null);
                  setActiveMenu(null);
                  setShowConsult(true);
                }}
                className="h-14 px-8 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-display font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <span className="relative z-10">Mulai Analisis</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            </motion.div>
          </div>

          <div className="lg:col-span-7 h-[60vh] lg:h-[80vh] relative min-h-[400px]">
            <HeroPlate />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-24 pb-24 border-t border-zinc-900 pt-16"
        >
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-display font-medium text-white tracking-tight">
              Katalog <span className="text-zinc-500">Menu</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuDiet.map((menu) => (
              <MenuCard 
                key={menu.id} 
                namaPaket={menu.namaPaket} 
                deskripsi={menu.deskripsi} 
                totalKalori={menu.totalKalori} 
                protein={menu.protein}
                karbohidrat={menu.karbohidrat}
                lemak={menu.lemak}
                harga={menu.harga} 
                kategori={menu.kategori}
                fotoMakanan={menu.fotoMakanan} 
              />
            ))}
          </div>
        </motion.div>
      </main>

      {/* Consult Modal / Result Overlay */}
      <AnimatePresence>
        {showConsult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-xl flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative my-8"
            >
              <button 
                onClick={() => {
                  if (activeMenu) {
                    if (showQris) setShowQris(false);
                    else setActiveMenu(null);
                  } else {
                    setShowConsult(false);
                  }
                }}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                ✕
              </button>
              
              {!result && !activeMenu ? (
                <form className="space-y-6 mt-4" onSubmit={handleConsult}>
                  <div className="mb-8">
                    <h3 className="text-2xl font-display font-medium text-white mb-2">Kalibrasi Fisik</h3>
                    <p className="text-zinc-400 text-sm">Masukkan data Anda untuk perhitungan BMR & TDEE akurat.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Usia (Tahun)</label>
                      <input required type="number" value={usia} onChange={e=>setUsia(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-lime-400 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Jenis Kelamin</label>
                      <select value={gender} onChange={e=>setGender(e.target.value as JenisKelamin)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-lime-400 transition-colors appearance-none">
                        <option value="L">Pria</option>
                        <option value="P">Wanita</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Berat Badan (KG)</label>
                      <input required type="number" step="0.1" value={beratBadan} onChange={e=>setBeratBadan(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-lime-400 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Tinggi Badan (CM)</label>
                      <input required type="number" step="0.1" value={tinggiBadan} onChange={e=>setTinggiBadan(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-lime-400 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Tingkat Aktivitas (Per Minggu)</label>
                    <select value={aktivitas} onChange={e=>setAktivitas(e.target.value as TingkatAktivitas)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-lime-400 transition-colors appearance-none">
                      <option value="Ringan">Ringan (Jarang/Tidak Olahraga)</option>
                      <option value="Sedang">Sedang (Olahraga 3-5 hari/minggu)</option>
                      <option value="Berat">Berat (Olahraga berat tiap hari)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Tujuan Diet</label>
                    <select value={tujuan} onChange={e=>setTujuan(e.target.value as TujuanDiet)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-lime-400 transition-colors appearance-none">
                      <option value="T01">Weight Loss (Penurunan Berat)</option>
                      <option value="T02">Maintenance (Pemeliharaan)</option>
                      <option value="T03">Muscle Gain (Peningkatan Massa Otot)</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full h-12 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold uppercase tracking-wider transition-colors mt-8 rounded-lg">
                    Eksekusi Mesin Inferensi
                  </button>
                </form>
              ) : result && !activeMenu ? (
                <div className="mt-4">
                  <div className="mb-6">
                    <h3 className="text-2xl font-display font-medium text-white mb-2">Hasil Analisis</h3>
                    <p className="text-lime-400 text-sm font-mono uppercase tracking-wider">Mifflin-St Jeor Engine</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">BMR</p>
                      <p className="text-lg font-display font-bold text-white">{result.bmr}</p>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">TDEE</p>
                      <p className="text-lg font-display font-bold text-white mt-1">{result.tdee}</p>
                    </div>
                    <div className="bg-zinc-950 border border-lime-900 shadow-[0_0_15px_rgba(163,230,53,0.1)] p-3 rounded-xl flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] text-lime-400 uppercase tracking-widest mb-1">Target</p>
                      <p className="text-lg font-display font-bold text-lime-400 mt-1">{result.targetKalori}</p>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Rekomendasi Paket</span>
                    <span className="text-xs font-mono text-lime-400 uppercase tracking-widest">{result.kategoriPaket}</span>
                  </div>

                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                     {result.rekomendasiMenu.length > 0 ? result.rekomendasiMenu.map(menu => (
                      <div key={menu.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex gap-4 items-center">
                        <img src={menu.fotoMakanan} alt={menu.namaPaket} className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-1">
                           <h4 className="font-display font-bold text-white leading-tight mb-1">{menu.namaPaket}</h4>
                           <p className="text-xs text-zinc-400 mb-2">{menu.totalKalori} Kkal • Rp {menu.harga.toLocaleString('id-ID')}</p>
                           <button onClick={() => handlePesanClick(menu.id)} className="text-xs bg-lime-400 text-zinc-950 px-3 py-1.5 rounded font-bold uppercase tracking-wider hover:bg-lime-300">
                             Pesan
                           </button>
                        </div>
                      </div>
                     )) : (
                        <p className="text-zinc-500 text-sm text-center py-4">Sistem gagal menemukan paket yang sesuai.</p>
                     )}
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button onClick={() => setResult(null)} className="w-full h-12 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors">
                      Hitung Ulang
                    </button>
                  </div>
                </div>
              ) : activeMenu ? (
                <div className="mt-4">
                  <div className="mb-6">
                    <h3 className="text-2xl font-display font-medium text-white mb-2">Detail Pesanan</h3>
                    <p className="text-lime-400 text-sm font-mono uppercase tracking-wider">{activeMenu.namaPaket}</p>
                  </div>

                  {!showQris ? (
                    <form className="space-y-6" onSubmit={e => { e.preventDefault(); setShowQris(true); }}>
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Alamat Pengiriman</label>
                         <textarea required value={alamat} onChange={e=>setAlamat(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white focus:outline-none focus:border-lime-400 transition-colors min-h-[100px]" placeholder="Masukkan alamat lengkap" />
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                           <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Jumlah (Porsi)</label>
                           <input required type="number" min="1" value={jumlah} onChange={e=>setJumlah(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-lime-400 transition-colors" />
                        </div>
                        <div className="space-y-2 flex-1">
                           <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Total Harga</label>
                           <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-12 px-4 text-lime-400 flex items-center font-bold">
                             Rp {(activeMenu.harga * (parseInt(jumlah)||1)).toLocaleString('id-ID')}
                           </div>
                        </div>
                      </div>

                      <button type="submit" className="w-full h-12 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold uppercase tracking-wider transition-colors mt-8 rounded-lg flex items-center justify-center gap-2">
                        Lanjut ke Pembayaran <ArrowRight className="w-4 h-4"/>
                      </button>
                    </form>
                  ) : (
                    <div className="flex flex-col items-center">
                       <div className="bg-white p-4 rounded-xl mb-6">
                         <QrCode className="w-48 h-48 text-zinc-950" />
                       </div>
                       <p className="text-zinc-400 text-sm mb-2 font-mono uppercase tracking-widest">Scan QR Code untuk Membayar</p>
                       <p className="text-white text-2xl font-bold font-display mb-8">Rp {(activeMenu.harga * (parseInt(jumlah)||1)).toLocaleString('id-ID')}</p>
                       
                       {bukti ? (
                         <div className="mb-6 p-4 border border-lime-400/50 bg-lime-400/10 rounded-lg text-lime-400 text-sm font-mono flex flex-col items-center justify-center gap-2 w-full">
                           ✓ Bukti berhasil diunggah
                           <img src={bukti} alt="Bukti Transfer" className="mt-2 max-h-32 rounded-lg border border-lime-400/30" />
                         </div>
                       ) : (
                         <div className="mb-6 w-full">
                           <label className="w-full h-12 border border-zinc-700 hover:border-lime-400 text-zinc-300 hover:text-lime-400 transition-colors rounded-lg flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider cursor-pointer">
                             Unggah Bukti Transfer
                             <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                           </label>
                         </div>
                       )}
                       
                       <button onClick={processOrder} className={`w-full h-12 font-bold uppercase tracking-wider transition-colors rounded-lg flex items-center justify-center gap-2 ${bukti ? 'bg-lime-400 hover:bg-lime-300 text-zinc-950' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
                         Konfirmasi Pembayaran
                       </button>
                       <button onClick={() => setShowQris(false)} className="mt-4 text-sm text-zinc-500 hover:text-white transition-colors">
                         Kembali
                       </button>
                    </div>
                  )}
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
