import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, User, Lock, Shield } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      const res = await api.post('/token', formData);
      login(res.data.access_token);
    } catch (err) {
      setError('Credenciais inválidas.');
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#121212] overflow-hidden">
      <div className="hidden lg:flex w-2/3 bg-black relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2070')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/80"></div>
        <div className="relative z-10 text-white p-12 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/50">
                    <Shield size={40} className="text-white" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">SIVI Monitor</h1>
            </div>
            <h2 className="text-5xl font-extrabold leading-tight mb-6">Segurança e Inteligência.</h2>
            <p className="text-xl text-gray-300">Acesse gravações, monitore câmeras e gerencie sua segurança com a tecnologia BeckerCorp.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bem-vindo</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Entre na sua conta BeckerCorp</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">{error}</div>}
                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="text" required placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white outline-none" />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="password" required placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white outline-none" />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-8">© 2026 BeckerCorp System</p>
        </div>
      </div>
    </div>
  );
}
