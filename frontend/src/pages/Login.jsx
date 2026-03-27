import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, TrendingUp } from 'lucide-react';

const Login = ({ onLogin, title = "Institutional Credit & Equity Intelligence" }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { email, password });
      onLogin(res.data);
    } catch (err) {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900/50 p-12 rounded-[2rem] border border-slate-800 shadow-2xl backdrop-blur-3xl">
        <div className="mb-12 text-center">
          <div className="mx-auto w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20 mb-6">
            <TrendingUp size={36} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2 whitespace-nowrap">G–255 INSIGHT</h1>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-amber-500 transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-amber-500 transition-all font-medium placeholder:text-slate-500"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-amber-500 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-amber-500 transition-all font-medium placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-bold leading-5 bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black tracking-widest uppercase py-5 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-3"
          >
            <LogIn size={20} strokeWidth={2.5} />
            Sign In
          </button>
        </form>

        <div className="mt-12 pt-10 border-t border-slate-800 grid grid-cols-2 gap-8">
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Analyst Portal</p>
              <p className="text-xs font-bold text-white">analyst@example.com</p>
              <p className="text-xs font-medium text-slate-400">analyst123</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Admin Portal</p>
              <p className="text-xs font-bold text-white">admin@g255.com</p>
              <p className="text-xs font-medium text-slate-400">admin123</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
