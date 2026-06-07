import React, { useState } from 'react';
import { useStore } from '../store';
import { Lock } from 'lucide-react';

export function AuthScreen({ onAuth }: { onAuth: () => void }) {
  const { data } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === data.settings.masterPassword) {
      onAuth();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center border border-white/10">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400 shadow-lg shadow-blue-500/10">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Acceso Seguro</h2>
        <p className="text-slate-400 mb-8">Esta aplicación está protegida con contraseña maestra.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Contraseña Maestra"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg placeholder:text-slate-500 text-white"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              autoFocus
            />
            {error && <p className="text-rose-400 text-sm mt-2">Contraseña incorrecta</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 border border-blue-500/50 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
          >
            Desbloquear
          </button>
        </form>
      </div>
    </div>
  );
}
