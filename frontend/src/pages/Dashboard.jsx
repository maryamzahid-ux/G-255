import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Layers, 
  FileSearch, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Calendar,
  TrendingUp 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const Dashboard = ({ user, onNavigate }) => {
  const [reports, setReports] = useState([]);
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Derived chart data
  const chartData = reports.slice(0, 7).reverse().map(r => ({
    name: r.report_date.split('-').slice(1).join('/'),
    deliveries: Math.floor(Math.random() * 20) + 10,
    sentiment: Math.floor(Math.random() * 50) + 25
  }));

  const sectorData = [
    { name: 'FIN', val: 78, fill: '#10b981' },
    { name: 'TMT', val: 62, fill: '#10b981' },
    { name: 'ENY', val: 34, fill: '#f43f5e' },
    { name: 'HCR', val: 45, fill: '#f59e0b' },
    { name: 'IND', val: 56, fill: '#10b981' },
  ];

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (!user.isAdmin) {
         const [reportsRes, productsRes, subsRes] = await Promise.all([
             axios.get('/api/reports'),
             axios.get('/api/products'),
             axios.get(`/api/subscriptions/${user.id}`)
         ]);
         setReports(reportsRes.data);
         setProducts(productsRes.data);
         setSubscriptions(subsRes.data);
      } else {
         const [reportsRes, productsRes] = await Promise.all([
             axios.get('/api/reports'),
             axios.get('/api/products')
         ]);
         setReports(reportsRes.data);
         setProducts(productsRes.data);
         setSubscriptions(productsRes.data.map(p => ({ product_code: p.product_code }))); // admins see all
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (productCode) => {
    try {
      await axios.post('/api/subscriptions', {
        user_id: user.id,
        product_code: productCode,
        frequency: 'Default'
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin text-amber-500"><Layers size={48} /></div>
    </div>
  );

  const activeSubCodes = subscriptions.map(s => s.product_code);
  const todaysReports = reports.filter(r => r.report_date === selectedDate && activeSubCodes.includes(r.product_code));

  return (
    <div className="space-y-12 pb-12">
      {/* Visual Analytics section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Systematic Pulse</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Daily Synthesis Confidence Score</p>
               </div>
               <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:rotate-6 transition-transform">
                  <TrendingUp size={24} strokeWidth={2.5} />
               </div>
            </div>
            <div className="h-[240px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} 
                        dy={10}
                     />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                     />
                     <Area 
                        type="monotone" 
                        dataKey="sentiment" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSent)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl opacity-50" />
            <div>
               <h3 className="text-lg font-black tracking-tight mb-2">Market Heatmap</h3>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Bullish vs Bearish Indicators</p>
            </div>
            
            <div className="h-[200px] w-full mt-6">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData}>
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 8, fontWeight: 900, fill: '#64748b'}} 
                     />
                     <Bar dataKey="val" radius={[8, 8, 8, 8]} barSize={24} />
                  </BarChart>
               </ResponsiveContainer>
            </div>

            <button onClick={() => onNavigate('reports')} className="mt-8 w-full py-4 bg-white/10 hover:bg-amber-500 text-white hover:text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
               System Insight Explorer
            </button>
         </div>
      </section>

      {/* Today's Reports Section */}
      <section>
        <div className="flex items-end justify-between mb-8">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Calendar className="text-amber-500" /> Today's Reports
                </h2>
                <p className="text-slate-500 font-medium mt-1">G–255 Insight Deliverables</p>
            </div>
            <div>
                <input 
                   type="date" 
                   value={selectedDate} 
                   onChange={(e) => setSelectedDate(e.target.value)}
                   className="bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
            </div>
        </div>

        {subscriptions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
                    <FileSearch size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No active subscriptions</h3>
                <p className="text-slate-500 max-w-sm mx-auto">No reports yet. Visit "My Subscriptions" to set up your G–255 Insight flow.</p>
            </div>
        ) : todaysReports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                 <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
                    <Layers size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No reports matched</h3>
                <p className="text-slate-500">There are no reports for {selectedDate} that match your subscriptions.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todaysReports.map(report => (
                    <div key={report.id} className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full mb-4 border border-amber-100">
                            {report.product_code}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{report.product_name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Calendar size={12} /> {report.report_date}
                        </p>
                        
                        {/* Mini Chart */}
                        <div className="h-16 w-full mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[
                                    {v: 10 + (report.id % 5)}, 
                                    {v: 15 + (report.id % 3)}, 
                                    {v: 12 + (report.id % 7)}, 
                                    {v: 20 + (report.id % 2)}, 
                                    {v: 18 + (report.id % 4)}
                                ]}>
                                    <Line 
                                        type="monotone" 
                                        dataKey="v" 
                                        stroke={report.id % 2 === 0 ? '#f59e0b' : '#3b82f6'} 
                                        strokeWidth={3} 
                                        dot={false} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <button onClick={() => onNavigate('reports', { reportId: report.id })} className="w-full text-left inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 group-hover:text-amber-600 transition-colors">
                            View Report <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
