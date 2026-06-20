import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export default function HeroPlate() {
  const { scrollY } = useScroll();
  
  // Rotate the plate slightly as the user scrolls
  const rotate = useTransform(scrollY, [0, 1000], [0, 90]);
  const yPos = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      {/* Visual background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-lime-900/30 to-transparent rounded-full blur-[100px] -z-10 opacity-70" />
      
      {/* Decorative rings */}
      <div className="absolute w-[80%] pt-[80%] rounded-full border border-zinc-800/50 hidden md:block" />
      <div className="absolute w-[60%] pt-[60%] rounded-full border border-lime-900/30 border-dashed hidden md:block" />
      
      {/* Rotating Plate Image */}
      <motion.div 
        style={{ rotate, y: yPos }}
        className="w-[85%] max-w-[500px] aspect-square rounded-full overflow-hidden shadow-2xl ring-4 ring-zinc-900/50 relative"
      >
        <img 
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800" 
          alt="Diet Meal Top View" 
          className="w-full h-full object-cover rounded-full"
        />
        {/* Inner shadow for depth */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />
      </motion.div>
    </div>
  );
}
