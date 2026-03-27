import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, 
  Settings2, 
  Send, 
  Mail, 
  Inbox,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Activity,
  UserCheck
} from 'lucide-react';

const Subscriptions = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [mySubs, setMySubs] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    try {
      const [pRes, sRes, dRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get(`/api/subscriptions/${user.id}`),
        axios.get(`/api/delivery-logs/${user.id}`)
      ]);
      setProducts(pRes.data);
      setMySubs(sRes.data.map(s => s.product_code));
      setDeliveryLogs(dRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSub = (code) => {
    setMySubs(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In the refined API, we might want to send a full sync or individual ones.
      // Let's implement a 'sync' endpoint in backend if we want bulk update, or just loop.
      // For POC, I'll use a new bulk sync endpoint or restore functionality.
      await axios.post(`/api/subscriptions/sync`, { user_id: user.id, products: mySubs });
      setMessage('Preferences updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-500">
      
      {/* Header Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 mb-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Subscriber Management</p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">My Subscriptions</h2>
          <p className="text-slate-500 font-medium leading-relaxed max-w-lg">
            Manage your personalized systematic research flow. 
            Automated deliveries are generated based on your selections below.
          </p>
        </div>
        <div className="flex items-center gap-10 bg-slate-50 p-6 rounded-3xl border border-slate-100">
           <div className="text-center px-4 border-r border-slate-200">
                <p className="text-2xl font-black text-slate-900">{mySubs.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subscribed</p>
           </div>
           <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-1 shadow-lg shadow-emerald-500/20">
                    <UserCheck size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Account</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Selection Area */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase mb-6 flex items-center gap-3 ml-2">
            <Settings2 size={18} className="text-slate-400" />
            Research Distribution Settings
          </h3>
          
          <div className="space-y-4">
            {products.map((p) => (
              <div 
                key={p.product_code} 
                onClick={() => toggleSub(p.product_code)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all flex items-center gap-6 group relative overflow-hidden ${
                   mySubs.includes(p.product_code) 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.01]' 
                    : 'bg-white border-slate-100 hover:border-amber-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                  {/* Progress Glow */}
                  {mySubs.includes(p.product_code) && (
                      <div className="absolute top-0 right-0 w-32 h-full bg-amber-500/10 skew-x-[-30deg] translate-x-12" />
                  )}

                  <div className={`p-4 rounded-2xl transition-all ${
                       mySubs.includes(p.product_code) ? 'bg-amber-500 text-slate-900' : 'bg-slate-100 text-slate-400 group-hover:scale-110'
                  }`}>
                      <Mail size={24} strokeWidth={2.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                          <p className="text-xs font-black uppercase tracking-widest">{p.frequency}</p>
                          <span className={`w-1 h-1 rounded-full ${mySubs.includes(p.product_code) ? 'bg-amber-500' : 'bg-slate-300'}`} />
                          <p className={`text-[10px] font-bold uppercase ${mySubs.includes(p.product_code) ? 'text-slate-400' : 'text-slate-400'}`}>G-255 Internal Engine</p>
                      </div>
                      <h4 className={`text-xl font-bold tracking-tight truncate ${mySubs.includes(p.product_code) ? 'text-white' : 'text-slate-900'}`}>{p.product_name}</h4>
                  </div>

                  <div className="flex items-center gap-4">
                      {mySubs.includes(p.product_code) ? (
                          <div className="bg-amber-500 p-2 rounded-full text-slate-900">
                             <CheckCircle2 size={18} strokeWidth={3} />
                          </div>
                      ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-slate-200" />
                      )}
                  </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-dashed">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                    <Activity size={20} />
                </div>
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-900">Push Notifications</p>
                   <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Via G-255 Internal Gateway</p>
                </div>
            </div>
            <button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-widest px-10 py-5 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
            >
                {saving ? 'Syncing...' : 'Save Settings'}
                <Send size={16} strokeWidth={2.5} />
            </button>
          </div>
          {message && <p className="text-center text-emerald-500 text-xs font-black uppercase tracking-widest mt-4 animate-in fade-in slide-in-from-top-2">{message}</p>}
        </div>

        {/* Info Column */}
        <div className="space-y-8">
            <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase mb-6 flex items-center gap-3 ml-2">
                <Inbox size={18} className="text-slate-400" />
                Latest Deliveries
            </h3>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="space-y-4">
                    {deliveryLogs.length === 0 ? (
                        <p className="p-6 text-center text-xs font-bold text-slate-500">No deliveries yet.</p>
                    ) : deliveryLogs.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group cursor-default">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-800 rounded-xl text-amber-500">
                                    <Clock size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.report_date}</p>
                                    <p className="text-xs font-bold truncate pr-2">{item.product_name}</p>
                                </div>
                            </div>
                            <ChevronRight size={14} className="text-slate-700 group-hover:text-amber-500 transition-colors shrink-0" />
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                    <button onClick={() => fetchData()} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2 mx-auto">
                        <Activity size={14} />
                        Refresh Distribution Log
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Subscriptions;
