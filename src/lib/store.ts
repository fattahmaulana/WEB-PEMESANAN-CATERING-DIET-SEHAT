import { create } from 'zustand';
import { supabase } from './supabase';

// ============================================================
// Types (backward-compatible with existing components)
// ============================================================
export type Role = 'ADMIN' | 'PELANGGAN';

export interface Pengguna {
  id: string;
  role: Role;
  nama: string;
  email: string;
}

export interface MenuDiet {
  id: string;
  namaPaket: string;
  deskripsi: string;
  totalKalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  harga: number;
  fotoMakanan: string;
  kategori: string; // E.g., 'Paket Super Defisit'
  kategoriKodel: string; // E.g., 'P01'
}

export interface Pesanan {
  id: string;
  idPengguna: string;
  idMenu: string;
  jumlah: number;
  alamat: string;
  totalHarga: number;
  tanggalPengiriman: string;
  statusPesanan: 'MENUNGGU' | 'DIPROSES' | 'DIKIRIM';
  buktiPembayaran?: string;
}

// ============================================================
// DB Row ↔ TypeScript Mappers
// ============================================================
function mapMenuFromDB(row: any): MenuDiet {
  return {
    id: row.id,
    namaPaket: row.nama_paket,
    deskripsi: row.deskripsi,
    totalKalori: row.total_kalori,
    protein: row.protein,
    karbohidrat: row.karbohidrat,
    lemak: row.lemak,
    harga: row.harga,
    fotoMakanan: row.foto_makanan || '',
    kategori: row.kategori,
    kategoriKodel: row.kategori_kode,
  };
}

function mapMenuToDB(menu: Partial<MenuDiet>): Record<string, any> {
  const mapped: Record<string, any> = {};
  if (menu.namaPaket !== undefined) mapped.nama_paket = menu.namaPaket;
  if (menu.deskripsi !== undefined) mapped.deskripsi = menu.deskripsi;
  if (menu.totalKalori !== undefined) mapped.total_kalori = menu.totalKalori;
  if (menu.protein !== undefined) mapped.protein = menu.protein;
  if (menu.karbohidrat !== undefined) mapped.karbohidrat = menu.karbohidrat;
  if (menu.lemak !== undefined) mapped.lemak = menu.lemak;
  if (menu.harga !== undefined) mapped.harga = menu.harga;
  if (menu.fotoMakanan !== undefined) mapped.foto_makanan = menu.fotoMakanan;
  if (menu.kategori !== undefined) mapped.kategori = menu.kategori;
  if (menu.kategoriKodel !== undefined) mapped.kategori_kode = menu.kategoriKodel;
  return mapped;
}

function mapPesananFromDB(row: any): Pesanan {
  return {
    id: row.id,
    idPengguna: row.id_pengguna,
    idMenu: row.id_menu,
    jumlah: row.jumlah,
    alamat: row.alamat,
    totalHarga: row.total_harga,
    tanggalPengiriman: row.tanggal_pengiriman,
    statusPesanan: row.status_pesanan,
    buktiPembayaran: row.bukti_pembayaran,
  };
}

// ============================================================
// Storage Upload Helper
// ============================================================
async function uploadBase64ToStorage(
  bucket: string,
  base64Data: string,
  filePrefix: string
): Promise<string> {
  const res = await fetch(base64Data);
  const blob = await res.blob();

  const ext = blob.type.split('/')[1] || 'jpg';
  const filePath = `${Date.now()}_${filePrefix}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, { contentType: blob.type, upsert: false });

  if (error) throw new Error(`Upload gagal: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// ============================================================
// Store Interface
// ============================================================
interface DBState {
  menuDiet: MenuDiet[];
  pesanan: Pesanan[];
  penggunaAktif: Pengguna | null;
  loading: boolean;
  authReady: boolean;

  // Auth
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  daftarAkun: (nama: string, email: string, password: string) => Promise<{ error?: string }>;

  // Menu
  fetchMenuDiet: () => Promise<void>;
  tambahMenu: (menu: Omit<MenuDiet, 'id'>) => Promise<void>;
  perbaruiMenu: (id: string, menu: Partial<MenuDiet>) => Promise<void>;
  hapusMenu: (id: string) => Promise<void>;

  // Pesanan
  fetchPesanan: () => Promise<void>;
  tambahPesanan: (info: Omit<Pesanan, 'id' | 'tanggalPengiriman' | 'statusPesanan'>) => Promise<void>;
  perbaruiStatusPesanan: (idPesanan: string, status: Pesanan['statusPesanan']) => Promise<void>;
}

// ============================================================
// Zustand Store (no persist — data lives in Supabase)
// ============================================================
export const useStore = create<DBState>()((set, get) => ({
  menuDiet: [],
  pesanan: [],
  penggunaAktif: null,
  loading: true,
  authReady: false,

  // ----------------------------------------------------------
  // AUTH
  // ----------------------------------------------------------
  initAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from('pengguna')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          set({
            penggunaAktif: {
              id: profile.id,
              nama: profile.nama,
              email: profile.email,
              role: profile.role as Role,
            },
          });
        }
      }
    } catch (e) {
      console.error('initAuth error:', e);
    }

    set({ authReady: true, loading: false });

    // Listen for future auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('pengguna')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          set({
            penggunaAktif: {
              id: profile.id,
              nama: profile.nama,
              email: profile.email,
              role: profile.role as Role,
            },
          });
        }
      } else if (event === 'SIGNED_OUT') {
        set({ penggunaAktif: null, pesanan: [] });
      }
    });
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Directly fetch profile so caller can navigate immediately
    if (data.user) {
      const { data: profile } = await supabase
        .from('pengguna')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        set({
          penggunaAktif: {
            id: profile.id,
            nama: profile.nama,
            email: profile.email,
            role: profile.role as Role,
          },
        });
      }
    }
    return {};
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ penggunaAktif: null, pesanan: [] });
  },

  daftarAkun: async (nama, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nama } },
    });
    if (error) return { error: error.message };

    // The DB trigger auto-creates the pengguna row.
    // Fetch the profile so the user is immediately logged in.
    if (data.user) {
      const { data: profile } = await supabase
        .from('pengguna')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        set({
          penggunaAktif: {
            id: profile.id,
            nama: profile.nama,
            email: profile.email,
            role: profile.role as Role,
          },
        });
      }
    }
    return {};
  },

  // ----------------------------------------------------------
  // MENU DIET
  // ----------------------------------------------------------
  fetchMenuDiet: async () => {
    const { data, error } = await supabase
      .from('menu_diet')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      set({ menuDiet: data.map(mapMenuFromDB) });
    }
  },

  tambahMenu: async (menuInfo) => {
    let fotoUrl = menuInfo.fotoMakanan;

    if (fotoUrl && fotoUrl.startsWith('data:')) {
      fotoUrl = await uploadBase64ToStorage('menu-images', fotoUrl, 'menu');
    }

    const dbData = mapMenuToDB({ ...menuInfo, fotoMakanan: fotoUrl });
    const { data, error } = await supabase
      .from('menu_diet')
      .insert(dbData)
      .select()
      .single();

    if (error) throw new Error(`Gagal menambahkan menu: ${error.message}`);
    if (data) {
      set((s) => ({ menuDiet: [...s.menuDiet, mapMenuFromDB(data)] }));
    }
  },

  perbaruiMenu: async (id, update) => {
    const processed = { ...update };

    if (processed.fotoMakanan && processed.fotoMakanan.startsWith('data:')) {
      processed.fotoMakanan = await uploadBase64ToStorage('menu-images', processed.fotoMakanan, 'menu');
    }

    const dbData = mapMenuToDB(processed);
    const { data, error } = await supabase
      .from('menu_diet')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Gagal memperbarui menu: ${error.message}`);
    if (data) {
      const updated = mapMenuFromDB(data);
      set((s) => ({ menuDiet: s.menuDiet.map((m) => (m.id === id ? updated : m)) }));
    }
  },

  hapusMenu: async (id) => {
    const { error } = await supabase.from('menu_diet').delete().eq('id', id);
    if (error) throw new Error(`Gagal menghapus menu: ${error.message}`);
    set((s) => ({ menuDiet: s.menuDiet.filter((m) => m.id !== id) }));
  },

  // ----------------------------------------------------------
  // PESANAN
  // ----------------------------------------------------------
  fetchPesanan: async () => {
    const user = get().penggunaAktif;
    if (!user) return;

    let query = supabase
      .from('pesanan')
      .select('*')
      .order('created_at', { ascending: false });

    if (user.role !== 'ADMIN') {
      query = query.eq('id_pengguna', user.id);
    }

    const { data, error } = await query;
    if (!error && data) {
      set({ pesanan: data.map(mapPesananFromDB) });
    }
  },

  tambahPesanan: async (info) => {
    let buktiUrl = info.buktiPembayaran;

    if (buktiUrl && buktiUrl.startsWith('data:')) {
      buktiUrl = await uploadBase64ToStorage('bukti-pembayaran', buktiUrl, 'bukti');
    }

    const { data, error } = await supabase
      .from('pesanan')
      .insert({
        id_pengguna: info.idPengguna,
        id_menu: info.idMenu,
        jumlah: info.jumlah,
        alamat: info.alamat,
        total_harga: info.totalHarga,
        bukti_pembayaran: buktiUrl,
        tanggal_pengiriman: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Gagal membuat pesanan: ${error.message}`);
    if (data) {
      set((s) => ({ pesanan: [mapPesananFromDB(data), ...s.pesanan] }));
    }
  },

  perbaruiStatusPesanan: async (idPesanan, status) => {
    const { error } = await supabase
      .from('pesanan')
      .update({ status_pesanan: status })
      .eq('id', idPesanan);

    if (error) throw new Error(`Gagal mengubah status: ${error.message}`);
    set((s) => ({
      pesanan: s.pesanan.map((o) => (o.id === idPesanan ? { ...o, statusPesanan: status } : o)),
    }));
  },
}));
