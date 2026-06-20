# Kian Cinta Kudus Catering

Sistem Informasi Pemesanan Catering Diet Sehat Berbasis Web dengan Implementasi Sistem Pakar Forward Chaining untuk Rekomendasi Menu Berdasarkan Kebutuhan Kalori Pengguna.

## Deskripsi Proyek

Kian Cinta Kudus Catering merupakan aplikasi web yang dirancang untuk membantu pengguna memperoleh rekomendasi paket catering diet sehat sesuai dengan kondisi fisik, tingkat aktivitas, dan tujuan diet yang dimiliki. Sistem menerapkan metode Forward Chaining untuk melakukan inferensi berdasarkan data pengguna sehingga dapat menghasilkan rekomendasi menu yang lebih sesuai dengan kebutuhan nutrisi.

Aplikasi menyediakan fasilitas konsultasi kebutuhan kalori, pemesanan paket catering, manajemen pesanan, serta pengelolaan katalog menu oleh administrator.

## Latar Belakang

Pemilihan program diet yang tepat memerlukan perhitungan kebutuhan kalori dan pemahaman mengenai kondisi tubuh setiap individu. Banyak pengguna mengalami kesulitan dalam menentukan jenis paket makanan yang sesuai dengan tujuan dietnya.

Melalui penerapan sistem pakar berbasis Forward Chaining, aplikasi ini mampu membantu proses pengambilan keputusan dengan memberikan rekomendasi menu diet secara otomatis berdasarkan aturan yang telah ditentukan.

## Tujuan

- Membantu pengguna menentukan paket catering diet yang sesuai.
- Mengotomatisasi proses rekomendasi menu berdasarkan kebutuhan kalori.
- Mempermudah proses pemesanan catering diet secara online.
- Menyediakan media pengelolaan menu dan pesanan bagi administrator.
- Mengimplementasikan metode Forward Chaining dalam sistem rekomendasi diet.

---

## Fitur Sistem

### Fitur Pelanggan

- Registrasi akun pengguna
- Login dan autentikasi pengguna
- Konsultasi kebutuhan kalori
- Rekomendasi menu diet otomatis
- Pemesanan paket catering
- Upload bukti pembayaran
- Riwayat pemesanan
- Monitoring status pesanan

### Fitur Administrator

- Manajemen data menu diet
- Tambah, ubah, dan hapus menu
- Manajemen data pesanan
- Verifikasi bukti pembayaran
- Pembaruan status pesanan
- Monitoring aktivitas pemesanan

### Fitur Sistem Pakar

- Perhitungan Basal Metabolic Rate (BMR)
- Perhitungan Total Daily Energy Expenditure (TDEE)
- Penentuan target kalori
- Klasifikasi kategori diet
- Rekomendasi menu berdasarkan aturan Forward Chaining

---

## Metode Forward Chaining

Sistem menggunakan pendekatan Forward Chaining untuk menghasilkan rekomendasi menu diet berdasarkan fakta yang dimasukkan oleh pengguna.

### Data Masukan

- Usia
- Jenis Kelamin
- Berat Badan
- Tinggi Badan
- Tingkat Aktivitas
- Tujuan Diet

### Proses Inferensi

1. Menghitung BMR menggunakan rumus Mifflin-St Jeor.
2. Menghitung TDEE berdasarkan tingkat aktivitas.
3. Menentukan target kalori sesuai tujuan diet.
4. Mengklasifikasikan pengguna ke kategori paket diet.
5. Menampilkan rekomendasi menu yang sesuai.

### Kategori Paket Diet

| Kode | Kategori |
|--------|-----------|
| P01 | Super Defisit |
| P02 | Defisit Standar |
| P03 | Healthy Maintain |
| P04 | Active Surplus |
| P05 | High Power |

---

## Teknologi yang Digunakan

| Komponen | Teknologi |
|-----------|------------|
| Frontend | React 19 |
| Bahasa Pemrograman | TypeScript |
| Build Tool | Vite |
| Routing | React Router DOM |
| State Management | Zustand |
| Styling | Tailwind CSS |
| Animasi | Framer Motion |
| Icon Library | Lucide React |
| 3D Visual | Three.js |
| Database (Target) | PostgreSQL |
| Backend as a Service | Supabase |
| Deployment | Vercel |

---

## Arsitektur Sistem

### Arsitektur Saat Ini

```text
Client Browser
      │
      ▼
 React Application
      │
      ▼
 Zustand Store
      │
      ▼
 Local Storage
      │
      ▼
 Forward Chaining Engine
```

### Arsitektur Pengembangan

```text
Client Browser
      │
      ▼
 React Application
      │
      ▼
 Supabase Client SDK
      │
      ▼
 Supabase Services
 ├── Authentication
 ├── PostgreSQL Database
 └── Storage
```

---

## Struktur Direktori

```text
src
├── components
│   ├── HeroPlate.tsx
│   ├── MenuCard.tsx
│   └── Navbar.tsx
│
├── pages
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── AdminDashboard.tsx
│   └── UserDashboard.tsx
│
├── lib
│   └── store.ts
│
├── utils
│   └── forwardChaining.ts
│
├── App.tsx
└── main.tsx
```

---

## Skema Basis Data

Sistem dirancang menggunakan lima entitas utama:

### Pengguna

Menyimpan data akun pengguna dan administrator.

### Profil Kesehatan

Menyimpan informasi kesehatan pengguna yang digunakan dalam proses konsultasi diet.

### Menu Diet

Menyimpan data paket menu catering beserta informasi nutrisi.

### Aturan Pakar

Menyimpan aturan inferensi yang digunakan dalam proses rekomendasi menu.

### Pesanan

Menyimpan seluruh transaksi pemesanan yang dilakukan pengguna.

---

## Instalasi dan Menjalankan Proyek

### Clone Repository

```bash
git clone https://github.com/username/kian-cinta-kudus-catering.git
```

### Masuk ke Direktori Proyek

```bash
cd kian-cinta-kudus-catering
```

### Install Dependency

```bash
npm install
```

### Menjalankan Aplikasi

```bash
npm run dev
```

Aplikasi dapat diakses melalui:

```text
http://localhost:5173
```

### Build Production

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

---

## Pengembangan Selanjutnya

Beberapa pengembangan yang direncanakan antara lain:

- Integrasi Supabase Authentication
- Migrasi data ke PostgreSQL
- Implementasi Row Level Security (RLS)
- Integrasi Supabase Storage
- Dashboard analitik dan pelaporan
- Integrasi notifikasi WhatsApp
- Integrasi payment gateway
- Sistem monitoring pengiriman
- Rekomendasi diet berbasis kecerdasan buatan

---

## Keamanan Sistem

Untuk implementasi produksi, sistem direkomendasikan menggunakan:

- Supabase Authentication
- Password Hashing
- JSON Web Token (JWT)
- Role Based Access Control (RBAC)
- Row Level Security (RLS)
- Validasi Data Server Side
- Secure File Storage

---

## Kontributor

**Maulana Abdul Fattah**  
Program Studi Teknik Informatika

---

## Lisensi

Proyek ini dikembangkan sebagai bagian dari penelitian dan pengembangan Sistem Informasi Pemesanan Catering Diet Sehat dengan Metode Forward Chaining. Penggunaan dan pengembangan lebih lanjut dapat disesuaikan dengan kebutuhan institusi atau organisasi yang mengimplementasikannya.
