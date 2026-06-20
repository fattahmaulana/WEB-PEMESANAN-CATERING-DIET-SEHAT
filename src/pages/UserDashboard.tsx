import React, { useEffect } from 'react';
import { useStore } from '../lib/store';
import { Navigate, Link } from 'react-router-dom';

export default function UserDashboard() {
  const { penggunaAktif, pesanan, menuDiet, fetchPesanan } = useStore();

  useEffect(() => {
    if (penggunaAktif) {
      fetchPesanan();
    }
  }, [penggunaAktif]);

  if (!penggunaAktif || penggunaAktif.role !== 'PELANGGAN') {
    return <Navigate to="/login" replace />;
  }

  const pesananUser = pesanan;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50 pt-28 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-white mb-2">Selamat datang kembali, {penggunaAktif.nama}</h1>
        <p className="text-zinc-400 mb-12 font-mono text-sm uppercase tracking-widest">Portal Pelanggan</p>

        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-8">
            <h2 className="text-2xl font-display font-bold text-white">Riwayat Pesanan Anda</h2>
            {pesananUser.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
                <p className="text-zinc-500 mb-4 font-mono">Anda belum pernah melakukan pemesanan.</p>
                <Link to="/" className="inline-block px-6 py-3 bg-lime-400 text-zinc-950 font-bold uppercase tracking-wider rounded-lg hover:bg-lime-300 transition-colors">
                  Mulai Analisis Diet
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {pesananUser.map(order => {
                  const menu = menuDiet.find(m => m.id === order.idMenu);
                  return (
                    <div key={order.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className={`inline-block px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded ${
                            order.statusPesanan === 'MENUNGGU' ? 'bg-amber-500/10 text-amber-500' :
                            order.statusPesanan === 'DIPROSES' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-lime-500/10 text-lime-400'
                          }`}>
                            {order.statusPesanan}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">{new Date(order.tanggalPengiriman).toLocaleDateString('id-ID')}</span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-white mb-2">{menu?.namaPaket || 'Menu Tidak Diketahui'}</h3>
                      </div>
                      <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                        <img src={menu?.fotoMakanan} className="h-10 w-10 object-cover rounded shadow ring-1 ring-zinc-700" alt="Thumbnail" />
                        <span className="text-lime-400 font-mono font-medium">Rp {menu?.harga.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="md:col-span-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-28">
              <h3 className="text-lg font-display font-bold text-white mb-4">Informasi Akun</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Nama Lengkap</p>
                  <p className="text-white">{penggunaAktif.nama}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Email</p>
                  <p className="text-white">{penggunaAktif.email}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Akses</p>
                  <p className="text-white">{penggunaAktif.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
