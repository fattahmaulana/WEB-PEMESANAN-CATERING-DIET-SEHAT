import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Leaf, Flame } from 'lucide-react';

interface MenuCardProps {
  namaPaket: string;
  deskripsi: string;
  totalKalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  harga: number;
  kategori: string;
  fotoMakanan: string;
}

export default function MenuCard({ namaPaket, deskripsi, totalKalori, protein, karbohidrat, lemak, harga, kategori, fotoMakanan }: MenuCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group cursor-pointer h-full flex"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden relative shadow-lg">
        {/* Glow effect on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-transparent pointer-events-none transition-opacity duration-500 z-10"
        />

        {/* Image Section */}
        <div className="relative h-48 w-full bg-zinc-950 overflow-hidden">
          <motion.img 
            src={fotoMakanan} 
            alt={namaPaket} 
            className="w-full h-full object-cover opacity-80"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute top-4 left-4 z-20">
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 text-[10px] font-bold text-lime-400 border border-lime-400/20 backdrop-blur-md uppercase tracking-wider shadow-sm">
              {kategori.includes('Vegetarian') ? <Leaf className="w-3 h-3" /> : <Flame className="w-3 h-3"/>}
              {kategori}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-900 to-transparent" />
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow relative z-20">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-display font-bold text-zinc-50 group-hover:text-lime-300 transition-colors duration-300 line-clamp-2">
              {namaPaket}
            </h3>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2">
            {deskripsi}
          </p>

          <div className="grid grid-cols-4 gap-2 mb-6 mt-auto">
             <div className="flex flex-col items-center p-2 bg-zinc-950 rounded-lg border border-zinc-800">
               <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Kalori</span>
               <span className="text-sm font-mono font-medium text-white">{totalKalori}</span>
             </div>
             <div className="flex flex-col items-center p-2 bg-zinc-950 rounded-lg border border-zinc-800">
               <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Pro</span>
               <span className="text-sm font-mono font-medium text-zinc-300">{protein}g</span>
             </div>
             <div className="flex flex-col items-center p-2 bg-zinc-950 rounded-lg border border-zinc-800">
               <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Karb</span>
               <span className="text-sm font-mono font-medium text-zinc-300">{karbohidrat}g</span>
             </div>
             <div className="flex flex-col items-center p-2 bg-zinc-950 rounded-lg border border-zinc-800">
               <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Lemak</span>
               <span className="text-sm font-mono font-medium text-zinc-300">{lemak}g</span>
             </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Harga</span>
              <span className="text-lg font-mono font-medium text-lime-400">
                Rp {harga.toLocaleString('id-ID')}
              </span>
            </div>
            <motion.button
              className="w-10 h-10 rounded-full bg-lime-400 text-zinc-950 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.1, rotate: -45 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
