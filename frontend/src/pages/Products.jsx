// Combining Products.jsx and Subscriptions.jsx into one refined flow or separate files.
// For the POC, I'll provide them as requested.

// 1. Products.jsx - The catalog
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, 
  Calendar, 
  Info, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  Target
} from 'lucide-react';

const Products = ({ user, onNavigate }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="pb-12 space-y-12">
      <div className="max-w-3xl">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Core Systematic Offerings</h2>
        <p className="text-slate-500 font-medium text-lg leading-relaxed">
          G-255 offers institutional-grade systematic research products across credit and equity markets. 
          Our models analyze 255 large issuers daily to generate actionable trade indicators and fundamental insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.map((p) => (
          <div key={p.product_code} className="bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group">
            <div>
              <div className="flex justify-between items-start mb-10">
                <div className="p-5 bg-amber-50 text-amber-600 rounded-3xl transition-transform group-hover:rotate-12">
                   <Target size={28} strokeWidth={2.5} />
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                    p.frequency === 'daily' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    p.frequency === 'weekly' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-slate-50 text-slate-700 border-slate-100'
                }`}>
                    {p.frequency}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">{p.product_name}</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">{p.description}</p>
            </div>
            
            {!user?.isAdmin && (
              <button onClick={() => onNavigate('subscriptions')} className="w-full flex items-center justify-between p-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-amber-500 group-hover:text-slate-900 transition-all">
                  Learn More
                  <ArrowRight size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Feature Section */}
      <div className="bg-slate-900 rounded-[3rem] p-16 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
         <div className="relative z-10 max-w-xl">
            <h3 className="text-3xl font-black tracking-tight mb-4">Institutional Distribution</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
                Connect your G-255 account to your daily briefing terminal or receive automated digests via our systematic delivery engine.
            </p>
         </div>
         <div className="flex items-center gap-12 relative z-10">
            <div className="text-center">
                <p className="text-5xl font-black text-amber-500 mb-2">10k+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Daily Reports</p>
            </div>
            <div className="text-center">
                <p className="text-5xl font-black text-white mb-2">2.6k</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subscribers</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Products;
