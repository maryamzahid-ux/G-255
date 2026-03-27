import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, 
  Send, 
  FileSpreadsheet, 
  Users, 
  Calendar, 
  Activity,
  Package,
  CheckCircle2,
  Inbox,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const Admin = ({ onNavigate }) => {
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  
  const [file, setFile] = useState(null);
  const [productCode, setProductCode] = useState('TRADE_SUMMARY_DAILY');
  const [reportDate, setReportDate] = useState('2026-03-18');
  
  const [uploading, setUploading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, rRes, lRes, subRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/reports'),
        axios.get('/api/admin/delivery-logs'),
        axios.get('/api/admin/subscribers')
      ]);
      setProducts(pRes.data);
      setReports(rRes.data);
      setDeliveryLogs(lRes.data);
      setSubscribers(subRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('product_code', productCode);
    formData.append('report_date', reportDate);

    try {
      await axios.post('/api/upload', formData);
      setMessage('Report uploaded and parsed successfully.');
      setFile(null);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const generateDeliveries = async (reportId) => {
    setSimulating(true);
    try {
      const res = await axios.post('/api/admin/generate-deliveries', { report_id: reportId });
      setMessage(`Generated deliveries to ${res.data.count} subscribers.`);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleDeactivateSub = async (subId) => {
    try {
      await axios.delete(`/api/admin/subscriptions/${subId}`);
      fetchData();
    } catch(err) { console.error(err); }
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-6 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Col: Upload & Stats */}
        <div className="lg:col-span-1 space-y-10">
          
          {/* Stats Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform" />
            <div className="flex items-center gap-6 mb-10">
               <div className="p-4 bg-slate-800 rounded-3xl text-amber-500 shadow-xl shadow-amber-500/10">
                  <Activity size={24} strokeWidth={2.5} />
               </div>
               <div>
                  <h3 className="text-xl font-black tracking-tight">System Status</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">G-255 Internal Engine v1.02</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-8 relative z-10">
               <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all cursor-default group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Reports</p>
                  <p className="text-3xl font-black text-amber-500">{reports.length}</p>
               </div>
               <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all cursor-default">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Deliveries</p>
                  <p className="text-3xl font-black text-white">{deliveryLogs.length}</p>
               </div>
            </div>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm border-dashed hover:border-amber-200 transition-all">
             <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase mb-8 flex items-center gap-3">
                <Upload size={18} className="text-slate-400" />
                Ingestion Gateway
             </h3>
             <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select
                      className="w-full bg-slate-50 border border-slate-100 text-slate-900 pl-12 pr-4 py-4 rounded-xl accent-amber-500/20 text-xs font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                      value={productCode}
                      onChange={(e) => setProductCode(e.target.value)}
                    >
                      {products.map(p => <option key={p.product_code} value={p.product_code}>{p.product_name}</option>)}
                    </select>
                  </div>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-100 text-slate-900 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm font-bold"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <FileSpreadsheet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="file"
                      id="upload-file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label 
                      htmlFor="upload-file" 
                      className={`w-full block pl-12 pr-4 py-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-sm font-bold ${
                        file ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-amber-200 hover:bg-white'
                      }`}
                    >
                      {file ? file.name : 'Select G-255 Excel Output'}
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full bg-slate-900 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {uploading ? 'Processing Output...' : 'Initiate Parsing'}
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
             </form>
             {message && <p className="mt-6 text-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">{message}</p>}
          </div>

        </div>

        {/* Right Col: Reports & Simulation */}
        <div className="lg:col-span-2 space-y-10">
            
            {/* Delivery Engine Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm overflow-hidden flex flex-col">
              <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase mb-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users size={18} className="text-slate-400" />
                    Delivery Engine Control
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase border border-slate-100 px-3 py-1 rounded-full">System Active</span>
              </h3>
              
              <div className="overflow-auto max-h-[400px] custom-scrollbar rounded-2xl border border-slate-50">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="p-6">Report Title</th>
                      <th className="p-6">System Date</th>
                      <th className="p-6 text-center">Lifecycle</th>
                      <th className="p-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold divide-y divide-slate-50">
                    {reports.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6">
                            <p className="text-slate-900 uppercase tracking-tight">{r.product_name}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{r.product_code}</p>
                        </td>
                        <td className="p-6 text-slate-600 font-black uppercase">{r.report_date}</td>
                        <td className="p-6 text-center">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest">
                                {r.status}
                            </span>
                        </td>
                        <td className="p-6 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => onNavigate('reports')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase text-[10px] tracking-widest px-4 py-3 rounded-xl transition-all"
                          >
                            View
                          </button>
                          <button
                            onClick={() => generateDeliveries(r.id)}
                            disabled={simulating}
                            className="bg-slate-900 hover:bg-amber-500 hover:text-slate-900 text-white font-black uppercase text-[10px] tracking-widest px-5 py-3 rounded-xl transition-all disabled:opacity-50"
                          >
                            Execute Delivery
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivery Log */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase mb-10 flex items-center gap-3">
                    <Inbox size={18} className="text-slate-400" />
                    Global Distribution Log
                </h3>
                <div className="overflow-auto max-h-[400px] custom-scrollbar">
                    <div className="space-y-3">
                        {deliveryLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-amber-200 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="p-3 bg-white rounded-xl text-emerald-500 shadow-sm">
                                        <CheckCircle2 size={18} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{log.report_date}</p>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Simulated Delivery</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 uppercase">{log.product_name}</p>
                                        <p className="text-xs text-slate-500 font-medium">To: {log.email.split('@')[0]}@**</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Delivered At</p>
                                    <p className="text-xs font-bold text-slate-900 uppercase">
                                        {new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
        </div>

        {/* Subscriptions Management */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm overflow-hidden flex flex-col">
            <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase mb-10 flex items-center gap-3">
                <Users size={18} className="text-slate-400" />
                Subscriptions Management
            </h3>
            <div className="overflow-auto max-h-[400px] custom-scrollbar rounded-2xl border border-slate-50">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <tr>
                            <th className="p-6">Subscriber</th>
                            <th className="p-6">Product</th>
                            <th className="p-6 text-center">Active</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-bold divide-y divide-slate-50">
                        {subscribers.flatMap(sub => 
                            (sub.subscriptions || []).map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-6">
                                        <p className="text-slate-900">{sub.email}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-slate-900 uppercase tracking-tight">{s.product_name}</p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{s.product_code}</p>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            Yes
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => handleDeactivateSub(s.id)}
                                            className="bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-500 font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-xl transition-all"
                                        >
                                            Deactivate
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {subscribers.flatMap(s => s.subscriptions || []).length === 0 && (
                            <tr><td colSpan="4" className="p-6 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No active subscriptions found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

    </div>

      </div>
    </div>
  );
};

export default Admin;
