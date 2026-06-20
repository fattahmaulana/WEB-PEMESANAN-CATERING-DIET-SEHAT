import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Leaf } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        // penggunaAktif is set by the login action — read role for navigation
        const user = useStore.getState().penggunaAktif;
        if (user?.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-lime-400 mb-6">
          <Leaf className="w-12 h-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-white">
          Akses Masuk
        </h2>
        <p className="text-center font-mono text-zinc-500 mt-2 text-sm uppercase tracking-widest">Otentikasi Diperlukan</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 py-8 px-4 border border-zinc-800 shadow sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-mono mb-2">
                Alamat Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-lime-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-mono mb-2">
                Kata Sandi
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-lime-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold uppercase tracking-wider transition-colors rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Memproses...' : 'Autentikasi Sekarang'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-sm text-zinc-400">
            Belum memiliki akun? <Link to="/register" className="text-lime-400 hover:underline">Daftar sekarang</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
