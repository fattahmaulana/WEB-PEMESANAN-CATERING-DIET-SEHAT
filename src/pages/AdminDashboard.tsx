import React, { useState, useEffect, useRef } from 'react';
import { useStore, MenuDiet } from '../lib/store';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const { penggunaAktif, pesanan, menuDiet, perbaruiStatusPesanan, tambahMenu, perbaruiMenu, hapusMenu, fetchPesanan } = useStore();
  const [activeTab, setActiveTab] = useState<'PESANAN' | 'MENU'>('PESANAN');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Menu form state
  const [namaPaket, setNamaPaket] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [totalKalori, setTotalKalori] = useState(0);
  const [protein, setProtein] = useState(0);
  const [karbohidrat, setKarbohidrat] = useState(0);
  const [lemak, setLemak] = useState(0);
  const [harga, setHarga] = useState(0);
  const [kategori, setKategori] = useState('');
  const [kategoriKodel, setKategoriKodel] = useState('P01');

  // Image state: either a File object (new upload) or a URL string (existing)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect non-admin
  if (!penggunaAktif || penggunaAktif.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  // Fetch pesanan when component mounts or user changes
  useEffect(() => {
    if (penggunaAktif?.role === 'ADMIN') {
      fetchPesanan();
    }
  }, [penggunaAktif]);

  // Upload a File directly to Supabase Storage and return the public URL
  const uploadImageFile = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${Date.now()}_menu.${ext}`;

    const { error } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (error) throw new Error(`Upload gambar gagal: ${error.message}`);

    const { data: urlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar yang diperbolehkan (JPG, PNG, WebP, dll).');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditMenu = (menu: MenuDiet) => {
    setEditingId(menu.id);
    setNamaPaket(menu.namaPaket);
    setDeskripsi(menu.deskripsi);
    setTotalKalori(menu.totalKalori);
    setProtein(menu.protein);
    setKarbohidrat(menu.karbohidrat);
    setLemak(menu.lemak);
    setHarga(menu.harga);
    setKategori(menu.kategori);
    setKategoriKodel(menu.kategoriKodel);
    // For editing, show existing image as preview
    setImageFile(null);
    setImagePreview(menu.fotoMakanan || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNamaPaket(''); setDeskripsi(''); setTotalKalori(0); setProtein(0);
    setKarbohidrat(0); setLemak(0); setHarga(0); setKategori(''); setKategoriKodel('P01');
    clearImage();
    setShowForm(false);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();

    // For new menu, image is required. For editing, existing image is ok.
    if (!imageFile && !imagePreview) {
      alert('Harap pilih file gambar terlebih dahulu.');
      return;
    }

    setSaving(true);
    try {
      // Upload new image file if selected
      let fotoUrl = imagePreview; // default to existing URL (for edit)
      if (imageFile) {
        fotoUrl = await uploadImageFile(imageFile);
      }

      const data = {
        namaPaket, deskripsi, totalKalori, protein, karbohidrat, lemak, harga,
        fotoMakanan: fotoUrl, kategori, kategoriKodel
      };

      if (editingId) {
        await perbaruiMenu(editingId, data);
      } else {
        await tambahMenu(data);
      }
      resetForm();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan menu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Yakin hapus menu ini?')) return;
    setDeleting(id);
    try {
      await hapusMenu(id);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus menu.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50 pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-white mb-2">Pusat Komando Admin</h1>
        <p className="text-zinc-400 mb-12 font-mono text-sm uppercase tracking-widest">Ringkasan Sistem & Manajemen Basis Data</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-zinc-500 uppercase tracking-widest font-mono text-xs mb-2">Total Pesanan</p>
            <p className="text-4xl font-display font-bold text-white">{pesanan.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-zinc-500 uppercase tracking-widest font-mono text-xs mb-2">Katalog Menu Aktif</p>
            <p className="text-4xl font-display font-bold text-white">{menuDiet.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-zinc-500 uppercase tracking-widest font-mono text-xs mb-2">Status Sistem</p>
            <p className="text-2xl font-display font-bold text-lime-400 mt-2">Optimal</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-zinc-800">
          <button 
            onClick={() => setActiveTab('PESANAN')} 
            className={`pb-4 px-4 font-bold uppercase tracking-wider text-sm transition-colors ${activeTab === 'PESANAN' ? 'text-lime-400 border-b-2 border-lime-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Pesanan Masuk
          </button>
          <button 
            onClick={() => setActiveTab('MENU')} 
            className={`pb-4 px-4 font-bold uppercase tracking-wider text-sm transition-colors ${activeTab === 'MENU' ? 'text-lime-400 border-b-2 border-lime-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Katalog Menu
          </button>
        </div>

        {activeTab === 'PESANAN' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/50">
                    <th className="p-4 text-xs tracking-widest uppercase font-mono text-zinc-500">ID Pesanan & Tgl</th>
                    <th className="p-4 text-xs tracking-widest uppercase font-mono text-zinc-500">Menu & QTY</th>
                    <th className="p-4 text-xs tracking-widest uppercase font-mono text-zinc-500">Alamat</th>
                    <th className="p-4 text-xs tracking-widest uppercase font-mono text-zinc-500">Bukti Pemb.</th>
                    <th className="p-4 text-xs tracking-widest uppercase font-mono text-zinc-500">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {pesanan.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">Belum ada pesanan masuk.</td>
                    </tr>
                  ) : (
                    pesanan.map(order => {
                      const menu = menuDiet.find(m => m.id === order.idMenu);
                      return (
                        <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4">
                            <div className="font-mono text-zinc-300 text-xs mb-1">{order.id}</div>
                            <div className="text-zinc-500 text-xs">{new Date(order.tanggalPengiriman).toLocaleString('id-ID')}</div>
                          </td>
                          <td className="p-4 text-zinc-300">
                            <div className="font-bold text-white">{menu?.namaPaket || 'Menu dihapus'}</div>
                            <div className="text-xs text-lime-400 mt-1">{order.jumlah} porsi • Rp {order.totalHarga.toLocaleString('id-ID')}</div>
                          </td>
                          <td className="p-4 text-zinc-400 text-xs max-w-[200px] truncate" title={order.alamat}>{order.alamat || '-'}</td>
                          <td className="p-4">
                            {order.buktiPembayaran ? (
                              <button onClick={() => setSelectedImage(order.buktiPembayaran!)} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded border border-zinc-700 transition-colors font-mono uppercase">
                                Lihat Bukti
                              </button>
                            ) : (
                              <span className="text-[10px] text-zinc-600 font-mono">Tidak Ada</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-2">
                              <span className={`inline-block px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded w-max ${
                                order.statusPesanan === 'MENUNGGU' ? 'bg-amber-500/10 text-amber-500' :
                                order.statusPesanan === 'DIPROSES' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-lime-500/10 text-lime-400'
                              }`}>
                                {order.statusPesanan}
                              </span>
                              <select 
                                value={order.statusPesanan}
                                onChange={(e) => perbaruiStatusPesanan(order.id, e.target.value as any)}
                                className="bg-zinc-950 border border-zinc-700 text-zinc-300 text-[10px] p-1 rounded outline-none w-max uppercase tracking-wider"
                              >
                                <option value="MENUNGGU">Ubah: Menunggu</option>
                                <option value="DIPROSES">Ubah: Diproses</option>
                                <option value="DIKIRIM">Ubah: Dikirim</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'MENU' && (
          <div className="space-y-6">
            {!showForm ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-display font-bold text-white">Daftar Menu Aktif</h2>
                  <button onClick={() => setShowForm(true)} className="bg-lime-400 text-zinc-950 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded hover:bg-lime-300 transition-colors">
                    + Tambah Menu
                  </button>
                </div>
                <div className="grid gap-4">
                  {menuDiet.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 font-mono text-sm">Belum ada menu. Klik "+ Tambah Menu" untuk memulai.</div>
                  ) : (
                    menuDiet.map(menu => (
                      <div key={menu.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src={menu.fotoMakanan || 'https://via.placeholder.com/150?text=No+Image'} 
                            alt={menu.namaPaket} 
                            className="w-16 h-16 rounded object-cover border border-zinc-800" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error'; }}
                          />
                          <div>
                            <h4 className="font-bold text-white">{menu.namaPaket}</h4>
                            <p className="text-xs text-zinc-500 font-mono mt-1">{menu.kategori} ({menu.kategoriKodel}) • {menu.totalKalori} Kkal • Rp {menu.harga.toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditMenu(menu)} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded transition-colors font-mono">Edit</button>
                          <button 
                            onClick={() => handleDeleteMenu(menu.id)} 
                            disabled={deleting === menu.id}
                            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded transition-colors font-mono disabled:opacity-50"
                          >
                            {deleting === menu.id ? 'Menghapus...' : 'Hapus'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-xl font-display font-bold text-white mb-6">{editingId ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
                <form onSubmit={handleSaveMenu} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Nama Paket</label>
                      <input required value={namaPaket} onChange={e=>setNamaPaket(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white text-sm outline-none focus:border-lime-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Harga (Rp)</label>
                      <input required type="number" value={harga} onChange={e=>setHarga(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white text-sm outline-none focus:border-lime-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Deskripsi</label>
                    <textarea required value={deskripsi} onChange={e=>setDeskripsi(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white text-sm outline-none focus:border-lime-400 min-h-[80px]" />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Kalori</label>
                      <input required type="number" value={totalKalori} onChange={e=>setTotalKalori(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white text-sm outline-none focus:border-lime-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Protein</label>
                      <input required type="number" value={protein} onChange={e=>setProtein(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white text-sm outline-none focus:border-lime-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Karbo</label>
                      <input required type="number" value={karbohidrat} onChange={e=>setKarbohidrat(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white text-sm outline-none focus:border-lime-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Lemak</label>
                      <input required type="number" value={lemak} onChange={e=>setLemak(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white text-sm outline-none focus:border-lime-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Kode Klasifikasi (TDEE)</label>
                      <select required value={kategoriKodel} onChange={e=>setKategoriKodel(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white text-sm outline-none focus:border-lime-400">
                        <option value="P01">P01 (TK &lt;= 1400)</option>
                        <option value="P02">P02 (1400 &lt; TK &lt;= 1700)</option>
                        <option value="P03">P03 (1700 &lt; TK &lt;= 2100)</option>
                        <option value="P04">P04 (2100 &lt; TK &lt;= 2500)</option>
                        <option value="P05">P05 (TK &gt; 2500)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Nama Kategori (Label)</label>
                      <input required value={kategori} placeholder="Misal: Paket Super Defisit" onChange={e=>setKategori(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white text-sm outline-none focus:border-lime-400" />
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Foto Makanan</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Image Preview */}
                      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[160px] relative">
                        {imagePreview ? (
                          <div className="relative w-full h-full flex flex-col items-center justify-center">
                            <img src={imagePreview} alt="Preview" className="max-h-[120px] rounded object-cover mb-3 border border-zinc-800" />
                            <div className="flex items-center gap-2">
                              {imageFile && (
                                <span className="text-[10px] font-mono text-zinc-500 max-w-[150px] truncate">{imageFile.name}</span>
                              )}
                              <button 
                                type="button" 
                                onClick={clearImage} 
                                className="text-[10px] font-mono bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2 py-1 rounded transition-colors"
                              >
                                Hapus Gambar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-4">
                            <svg className="mx-auto h-10 w-10 text-zinc-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p className="text-zinc-600 text-xs font-mono">Belum ada gambar</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Right: File Upload Button */}
                      <div className="flex flex-col justify-center space-y-3">
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Pilih Gambar dari Komputer</label>
                          <label className="w-full h-12 border-2 border-dashed border-zinc-700 hover:border-lime-400 hover:text-lime-400 text-zinc-400 transition-colors rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer bg-zinc-950/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {imagePreview ? 'Ganti File Gambar' : 'Pilih File Gambar'}
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept="image/jpeg,image/png,image/webp,image/gif" 
                              className="hidden" 
                              onChange={handleFileSelect}
                            />
                          </label>
                          <p className="text-[9px] font-mono text-zinc-600">Format: JPG, PNG, WebP, GIF • Maks: 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="bg-lime-400 hover:bg-lime-300 text-zinc-950 px-4 py-2 font-bold uppercase tracking-wider text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving && (
                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {saving ? 'Menyimpan...' : 'Simpan Menu'}
                    </button>
                    <button type="button" onClick={resetForm} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 font-bold uppercase tracking-wider text-xs rounded transition-colors">
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-display font-medium text-white mb-6">Bukti Pembayaran</h3>
            <div className="flex justify-center">
              <img 
                src={selectedImage} 
                alt="Bukti Transfer" 
                className="max-h-[60vh] rounded-lg border border-zinc-800 object-contain" 
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setSelectedImage(null)} className="w-full sm:w-auto h-12 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold uppercase tracking-wider transition-colors rounded-lg px-8">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
