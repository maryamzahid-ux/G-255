import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  Shield, 
  Globe, 
  Zap, 
  Activity,
  Layers,
  ChevronRight,
  Database,
  BarChart3
} from 'lucide-react';
import Login from './Login';

const Landing = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return (
      <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <button 
          onClick={() => setShowLogin(false)}
          className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors"
        >
          <ArrowRight size={16} className="rotate-180" />
          Back to Terminal
        </button>
        <Login onLogin={onLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-12 py-8 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
            <TrendingUp size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-widest uppercase">G–255 INSIGHT</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-48 px-12 overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #475569 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-bottom-4">
             <Activity size={12} /> Live Systematic Engine v4.2
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            QUANTITATIVE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-white to-slate-500">PRECISION.</span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-2xl font-medium max-w-2xl leading-relaxed mb-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            G–255 Insight Portal synthesizes multi-factor credit and equity signals across 255 institutional issuers to deliver alpha-driven systematic research.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <button 
              onClick={() => setShowLogin(true)}
              className="w-full sm:w-auto bg-amber-500 text-slate-900 px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-amber-500/30 hover:bg-white hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Enter Global Analyst Portal
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-12 pb-48">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: "Universal Coverage", desc: "Cross-asset synthesis of the top 255 global issuers.", icon: Globe },
             { title: "Systematic Bias", desc: "Zero-latency model processing for unbiased execution indicators.", icon: Zap },
             { title: "Institutional Tier", desc: "Enterprise-grade reporting with full methodology disclosure.", icon: Shield },
           ].map((feat, i) => (
             <div key={i} className="bg-slate-900/40 p-12 rounded-[2.5rem] border border-white/5 hover:border-amber-500/30 transition-all group">
                <feat.icon className="text-amber-500 mb-8 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-xl font-black mb-4 uppercase tracking-wide">{feat.title}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{feat.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Footer Snapshot */}
      <footer className="px-12 py-24 border-t border-white/5 bg-slate-950/50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
           <div className="flex items-center gap-20">
              <div className="space-y-2">
                 <p className="text-4xl font-black text-amber-500 leading-none">255+</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Models</p>
              </div>
              <div className="space-y-2">
                 <p className="text-4xl font-black text-white leading-none">1.2ms</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Processing Latency</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4">Secured by Curve AM Architecture</p>
              <p className="text-xs font-bold text-slate-400">© 2026 G–255 Insight Portal. All Rights Reserved.</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
