import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import { useStore } from './lib/store';

export default function App() {
  const { initAuth, fetchMenuDiet, authReady } = useStore();

  useEffect(() => {
    initAuth();
    fetchMenuDiet();
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Menginisialisasi Sistem...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="bg-zinc-950 min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
