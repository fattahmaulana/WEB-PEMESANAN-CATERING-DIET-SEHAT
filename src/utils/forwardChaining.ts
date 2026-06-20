import { MenuDiet } from '../lib/store';

export type TingkatAktivitas = 'Ringan' | 'Sedang' | 'Berat';
export type TujuanDiet = 'T01' | 'T02' | 'T03';
export type JenisKelamin = 'L' | 'P';

export interface DataFisik {
  usia: number;
  gender: JenisKelamin;
  beratBadan: number; // kg
  tinggiBadan: number; // cm
  levelAktivitas: TingkatAktivitas;
  tujuanDiet: TujuanDiet;
}

export interface HasilInferensi {
  bmr: number;
  tdee: number;
  targetKalori: number;
  kategoriPaket: string;
  rekomendasiMenu: MenuDiet[];
}

export function jalankanSistemPakar(
  data: DataFisik,
  semuaMenu: MenuDiet[]
): HasilInferensi {
  // TAHAP 1: (Variabel ditangkap dari parameter)

  // TAHAP 2: Hitung BMR (Basal Metabolic Rate) - Formula Mifflin-St Jeor
  let bmr = 0;
  if (data.gender === 'L') {
    bmr = (10 * data.beratBadan) + (6.25 * data.tinggiBadan) - (5 * data.usia) + 5;
  } else {
    bmr = (10 * data.beratBadan) + (6.25 * data.tinggiBadan) - (5 * data.usia) - 161;
  }

  // TAHAP 3: Hitung TDEE (Total Daily Energy Expenditure)
  let multiplier = 1.2;
  if (data.levelAktivitas === 'Ringan') multiplier = 1.2;
  else if (data.levelAktivitas === 'Sedang') multiplier = 1.55;
  else if (data.levelAktivitas === 'Berat') multiplier = 1.725;
  const tdee = bmr * multiplier;

  // TAHAP 4: Eksekusi Rule Level 1 (Penentuan Target Kalori / TK)
  let tk = 0;
  if (data.tujuanDiet === 'T01') {
    tk = tdee - 500;
  } else if (data.tujuanDiet === 'T02') {
    tk = tdee;
  } else if (data.tujuanDiet === 'T03') {
    tk = tdee + 500;
  }

  // TAHAP 5: Eksekusi Rule Level 2 (Pemilihan Paket Menu via DB/Array)
  let kodeKategori = '';
  if (tk <= 1400) kodeKategori = 'P01'; 
  else if (tk > 1400 && tk <= 1700) kodeKategori = 'P02'; 
  else if (tk > 1700 && tk <= 2100) kodeKategori = 'P03'; 
  else if (tk > 2100 && tk <= 2500) kodeKategori = 'P04'; 
  else if (tk > 2500) kodeKategori = 'P05'; 

  const namaKategoriMap: Record<string, string> = {
    'P01': 'Paket Super Defisit',
    'P02': 'Paket Defisit Standar',
    'P03': 'Paket Healthy Maintain',
    'P04': 'Paket Active Surplus',
    'P05': 'Paket High Power'
  };

  // Pencarian (Consequent) dari database/array menu
  const menuTerkait = semuaMenu.filter(m => m.kategoriKodel === kodeKategori);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetKalori: Math.round(tk),
    kategoriPaket: namaKategoriMap[kodeKategori] || 'Kategori Umum',
    rekomendasiMenu: menuTerkait
  };
}
