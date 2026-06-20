import React from 'react';
import { Leaf, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';

export default function Navbar() {
  const { penggunaAktif, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/50">
      <Link to="/" className="flex items-center gap-2">
        <Leaf className="w-6 h-6 text-lime-400" />
        <span className="font-display font-bold text-xl tracking-wide uppercase text-zinc-100">Kian Cinta</span>
      </Link>
      <div className="flex gap-6 md:gap-8 text-sm font-medium tracking-widest uppercase items-center text-zinc-400">
        <Link to="/" className="hover:text-lime-400 transition-colors">Beranda</Link>
        
        {penggunaAktif ? (
          <>
            <Link 
              to={penggunaAktif.role === 'ADMIN' ? '/admin' : '/user'} 
              className="text-lime-400 flex items-center gap-2 border border-lime-400/20 px-3 py-1.5 rounded-full hover:bg-lime-400/10 transition-colors"
            >
              <User className="w-4 h-4" /> 
              {penggunaAktif.nama}
            </Link>
            <button onClick={handleLogout} className="hover:text-white transition-colors">Keluar</button>
          </>
        ) : (
          <Link to="/login" className="hover:text-lime-400 transition-colors">Masuk</Link>
        )}
      </div>
    </nav>
  );
}
