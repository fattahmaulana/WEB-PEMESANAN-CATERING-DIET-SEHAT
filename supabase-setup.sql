-- ============================================================
-- KIAN CINTA KUDUS CATERING — Supabase Setup Script
-- ============================================================
-- Jalankan script ini di Supabase Dashboard > SQL Editor
-- 
-- SEBELUM menjalankan script ini, pastikan:
-- 1. Buat Storage Bucket "menu-images" (Public) di Dashboard > Storage
-- 2. Buat Storage Bucket "bukti-pembayaran" (Public) di Dashboard > Storage
-- 3. Matikan "Enable email confirmations" di Dashboard > Authentication > Providers > Email
--    (agar user langsung login setelah register tanpa verifikasi email)
-- ============================================================

-- ============================================================
-- 1. TABEL: pengguna (sync dengan auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pengguna (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama        TEXT NOT NULL,
    email       TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'PELANGGAN' CHECK (role IN ('ADMIN', 'PELANGGAN')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. TABEL: menu_diet
-- ============================================================
CREATE TABLE IF NOT EXISTS public.menu_diet (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_paket      TEXT NOT NULL,
    deskripsi       TEXT NOT NULL,
    total_kalori    INT NOT NULL,
    protein         FLOAT NOT NULL,
    karbohidrat     FLOAT NOT NULL,
    lemak           FLOAT NOT NULL,
    harga           FLOAT NOT NULL,
    foto_makanan    TEXT,
    kategori        TEXT NOT NULL,
    kategori_kode   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. TABEL: pesanan
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pesanan (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengguna         UUID REFERENCES public.pengguna(id) ON DELETE SET NULL,
    id_menu             UUID REFERENCES public.menu_diet(id) ON DELETE SET NULL,
    jumlah              INT NOT NULL DEFAULT 1,
    alamat              TEXT NOT NULL,
    total_harga         FLOAT NOT NULL,
    bukti_pembayaran    TEXT,
    status_pesanan      TEXT NOT NULL DEFAULT 'MENUNGGU' CHECK (status_pesanan IN ('MENUNGGU', 'DIPROSES', 'DIKIRIM')),
    tanggal_pengiriman  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pesanan_pengguna ON public.pesanan(id_pengguna);
CREATE INDEX IF NOT EXISTS idx_pesanan_status ON public.pesanan(status_pesanan);
CREATE INDEX IF NOT EXISTS idx_menu_kategori_kode ON public.menu_diet(kategori_kode);

-- ============================================================
-- 5. TRIGGER: Auto-create pengguna saat user sign up via Auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.pengguna (id, nama, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
        NEW.email,
        'PELANGGAN'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 6. HELPER FUNCTION: Cek apakah user adalah Admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.pengguna
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS pada semua tabel
ALTER TABLE public.pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_diet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesanan ENABLE ROW LEVEL SECURITY;

-- --- PENGGUNA ---
CREATE POLICY "User baca profil sendiri" ON public.pengguna
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin baca semua profil" ON public.pengguna
    FOR SELECT USING (public.is_admin());

-- --- MENU DIET ---
CREATE POLICY "Siapapun bisa lihat menu" ON public.menu_diet
    FOR SELECT USING (true);

CREATE POLICY "Admin tambah menu" ON public.menu_diet
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin update menu" ON public.menu_diet
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin hapus menu" ON public.menu_diet
    FOR DELETE USING (public.is_admin());

-- --- PESANAN ---
CREATE POLICY "User lihat pesanan sendiri" ON public.pesanan
    FOR SELECT USING (auth.uid() = id_pengguna);

CREATE POLICY "Admin lihat semua pesanan" ON public.pesanan
    FOR SELECT USING (public.is_admin());

CREATE POLICY "User buat pesanan sendiri" ON public.pesanan
    FOR INSERT WITH CHECK (auth.uid() = id_pengguna);

CREATE POLICY "Admin update pesanan" ON public.pesanan
    FOR UPDATE USING (public.is_admin());

-- ============================================================
-- 8. STORAGE POLICIES (untuk bucket yang sudah dibuat)
-- ============================================================
-- Pastikan bucket sudah dibuat terlebih dahulu di Dashboard > Storage

-- Menu images: siapapun bisa baca, authenticated bisa upload
CREATE POLICY "Public read menu images" ON storage.objects
    FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Authenticated upload menu images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'menu-images'
        AND auth.role() = 'authenticated'
    );

-- Bukti pembayaran: siapapun bisa baca (URL tidak discoverable), authenticated bisa upload
CREATE POLICY "Public read bukti" ON storage.objects
    FOR SELECT USING (bucket_id = 'bukti-pembayaran');

CREATE POLICY "Authenticated upload bukti" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'bukti-pembayaran'
        AND auth.role() = 'authenticated'
    );

-- ============================================================
-- 9. SEED DATA: 9 Menu Diet Awal
-- ============================================================
INSERT INTO public.menu_diet (nama_paket, deskripsi, total_kalori, protein, karbohidrat, lemak, harga, foto_makanan, kategori, kategori_kode) VALUES
('Nasi Shirataki Ayam Suwir Sereh', 'Ayam suwir bumbu sereh khas Bali dengan nasi shirataki rendah kalori.', 280, 25, 15, 10, 35000, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800', 'Paket Super Defisit', 'P01'),
('Dada Ayam Pepes Kemangi & Tumis Kangkung', 'Dada ayam kukus bebas minyak dengan bumbu pepes khas Sunda.', 350, 35, 12, 8, 38000, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800', 'Paket Super Defisit', 'P01'),
('Nasi Merah Ikan Dori Sambal Matah', 'Ikan dori panggang dipadukan dengan sambal matah otentik dan nasi merah.', 450, 32, 50, 15, 42000, 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=800', 'Paket Defisit Standar', 'P02'),
('Nasi Merah Sate Lilit Ayam & Sayur Padeh', 'Sate lilit dada ayam kukus dengan sayuran kuah asam padeh.', 480, 34, 55, 14, 40000, 'https://images.unsplash.com/photo-1615486171448-4fd1fb14578b?auto=format&fit=crop&q=80&w=800', 'Paket Defisit Standar', 'P02'),
('Nasi Pandan Wangi Bandeng Bakar Kecap', 'Karbohidrat normal dengan protein seimbang dari bandeng tanpa tulang bakar madu.', 600, 35, 65, 20, 45000, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800', 'Paket Healthy Maintain', 'P03'),
('Nasi Uduk Merah Ayam Bakar Taliwang', 'Nasi uduk bersantan hebal, dada ayam Taliwang dan sayur singkong rebus.', 650, 38, 70, 22, 48000, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800', 'Paket Healthy Maintain', 'P03'),
('Nasi Liwet Ekstra Sapi Lada Hitam', 'Porsi karbohidrat dan protein ekstra untuk mendukung perbaikan otot aktif.', 750, 48, 85, 25, 55000, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', 'Paket Active Surplus', 'P04'),
('Nasi Kuning Dendeng Batokok Bakar', 'Kombinasi energi makro dari daging sapi batokok no-fat bakar khas Padang.', 800, 50, 90, 28, 58000, 'https://images.unsplash.com/photo-1627344983058-9a74aa9f7433?auto=format&fit=crop&q=80&w=800', 'Paket Active Surplus', 'P04'),
('Ultimate Padang Combo (Nasi + Sapi + Telur Dadar)', 'Cocok untuk bulking drastis. Daging rendang dry, telur dadar barendo oven, dan sayur nangka.', 950, 65, 110, 35, 65000, 'https://images.unsplash.com/photo-1634824240755-6b3a3cbf6d31?auto=format&fit=crop&q=80&w=800', 'Paket High Power', 'P05');

-- ============================================================
-- 10. CARA MEMBUAT AKUN ADMIN
-- ============================================================
-- Langkah:
-- 1. Buka app di browser → Register dengan email misal: admin@kiancinta.com
-- 2. Setelah berhasil register, buka Supabase Dashboard > Table Editor > pengguna
-- 3. Cari baris dengan email admin@kiancinta.com
-- 4. Ubah kolom "role" dari "PELANGGAN" menjadi "ADMIN"
-- 5. Klik Save. Sekarang akun tersebut memiliki akses admin.
--
-- Alternatif cepat (setelah register admin via app):
-- UPDATE public.pengguna SET role = 'ADMIN' WHERE email = 'admin@kiancinta.com';
