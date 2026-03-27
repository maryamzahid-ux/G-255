import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileSearch, 
  Search, 
  Filter, 
  ChevronDown, 
  ArrowRight,
  Database,
  Calendar,
  Layers,
  BarChart4,
  ExternalLink,
  Activity,
  AlertTriangle,
  Banknote,
  PieChart
} from 'lucide-react';

const Reports = ({ user, onNavigate, reportId }) => {
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSector, setFilterSector] = useState('All');
  const [filterRating, setFilterRating] = useState('All');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const url = user.isAdmin ? '/api/reports' : `/api/reports?userId=${user.id}`;
      const res = await axios.get(url);
      setReports(res.data);
      if (res.data.length > 0) {
        handleViewReport(reportId || res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (id) => {
    setSelectedReportId(id);
    setLoading(true);
    try {
      const res = await axios.get(`/api/reports/${id}`);
      setReportDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSnapshots = (reportDetail?.snapshots || []).filter(s => {
    const sSector = s.sector || 'Unknown';
    const sRating = s.rating_bucket || 'Unknown';
    return (filterSector === 'All' || sSector === filterSector) && 
           (filterRating === 'All' || sRating === filterRating);
  });

  const uniqueSectors = reportDetail?.snapshots ? ['All', ...new Set((reportDetail.snapshots || []).map(s => s.sector || 'Unknown'))] : ['All'];
  const uniqueRatings = reportDetail?.snapshots ? ['All', ...new Set((reportDetail.snapshots || []).map(s => s.rating_bucket || 'Unknown'))] : ['All'];

  if (reports.length === 0 && !loading) return (
    <div className="p-20 text-center bg-white rounded-[2rem] border border-slate-200">
      <FileSearch className="mx-auto text-slate-300 mb-6" size={64} />
      <h2 className="text-2xl font-black text-slate-900 mb-2">
        {user.isAdmin ? 'Archive Empty' : 'No Subscribed Reports'}
      </h2>
      <p className="text-slate-500 max-w-sm mx-auto">
        {user.isAdmin 
          ? 'No systematic research histories have been ingested yet. Please check the Admin Portal.' 
          : 'You currently have no active subscriptions or no reports have been delivered for your selections. Visit My Subscriptions to adjust your settings.'
        }
      </p>
      {!user.isAdmin && (
         <button onClick={() => onNavigate('subscriptions')} className="mt-8 bg-slate-900 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-all">
            Manage Subscriptions
         </button>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 pb-12">
      
      {/* Sidebar List */}
      <div className="xl:col-span-1 bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase mb-6 flex items-center gap-3">
            <Database size={18} className="text-amber-500" />
            Report History
        </h3>
        <div className="space-y-3 flex-1 overflow-auto pr-2 custom-scrollbar">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => handleViewReport(r.id)}
              className={`w-full text-left p-4 rounded-2xl transition-all border ${
                selectedReportId === r.id 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                  : 'bg-slate-50 border-slate-100 hover:border-amber-200 hover:bg-white text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedReportId === r.id ? 'text-amber-500' : 'text-slate-400'}`}>
                  {r.product_code.split('_')[0]}
                </span>
                <Calendar size={12} className={selectedReportId === r.id ? 'text-slate-500' : 'text-slate-300'} />
              </div>
              <p className="text-xs font-bold truncate mb-1">{r.product_name}</p>
              <p className={`text-[10px] font-black tracking-widest uppercase ${selectedReportId === r.id ? 'text-slate-400' : 'text-slate-500'}`}>{r.report_date}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail View */}
      <div className="xl:col-span-3 space-y-8">
        {!reportDetail ? (
          <div className="flex items-center justify-center min-h-[400px]">
             <Activity className="animate-spin text-amber-500" size={32} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Content Logic */}
            {reportDetail.product_code === 'TRADE_SUMMARY_DAILY' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Simplified summary cards for reports list view */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Trading Metrics</h4>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                            <span className="text-xs font-bold text-slate-600 uppercase">Long Indicators</span>
                            <span className="text-2xl font-black text-slate-900">{reportDetail.summary?.long_credit_indicators || 0}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                            <span className="text-xs font-bold text-slate-600 uppercase">Short Indicators</span>
                            <span className="text-2xl font-black text-slate-900">{reportDetail.summary?.short_credit_indicators || 0}</span>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <BarChart4 size={14} />
                        Benchmarked Spreads
                    </h4>
                    <table className="w-full text-left">
                        <thead className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="pb-4">Label</th>
                                <th className="pb-4">Today (BP)</th>
                                <th className="pb-4">1m Prior</th>
                                <th className="pb-4">1y Prior</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs font-bold">
                            {(reportDetail.spreads || []).map((s, i) => (
                                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="py-4 text-slate-900 uppercase">{s.label}</td>
                                    <td className="py-4 text-slate-900">{s.today_bp?.toFixed(1) || '0.0'}</td>
                                    <td className="py-4 text-slate-500">{s.one_m_ago_bp?.toFixed(1) || '0.0'}</td>
                                    <td className="py-4 text-slate-500">{s.one_y_ago_bp?.toFixed(1) || '0.0'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
            )}
            
            {['NEW_SUPPLY_DAILY', 'ISSUER_EARNINGS_QUARTERLY'].includes(reportDetail.product_code) && (
               <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-4 md:p-10 flex flex-col">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 mb-8">
                     {reportDetail.product_code === 'ISSUER_EARNINGS_QUARTERLY' ? (
                       <><TrendingUp className="text-emerald-500" /> Quarterly Earnings Synthesis</>
                     ) : (
                       <><Banknote className="text-amber-500" /> New Issues & Primary Market</>
                     )}
                  </h3>
                  <div className="overflow-auto max-h-[600px] custom-scrollbar rounded-2xl border border-slate-100">
                     <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-slate-900 text-white rounded-t-2xl">
                           <tr className="text-[10px] font-black uppercase tracking-widest">
                              <th className="p-6">{reportDetail.product_code === 'ISSUER_EARNINGS_QUARTERLY' ? 'Period' : 'Trade Date'}</th>
                              <th className="p-6">Issuer</th>
                              <th className="p-6">Sector</th>
                              <th className="p-6">Rating</th>
                              <th className="p-6 mt-1 flex gap-2">{reportDetail.product_code === 'ISSUER_EARNINGS_QUARTERLY' ? 'EPS Event • Change' : 'Instrument • Tenor'}</th>
                              <th className="p-6">{reportDetail.product_code === 'ISSUER_EARNINGS_QUARTERLY' ? 'Earnings Stats' : 'IPT / Model Level'}</th>
                              <th className="p-6 text-center">Alerts</th>
                           </tr>
                        </thead>
                        <tbody className="text-xs font-bold divide-y divide-slate-100">
                           {(reportDetail.issues || []).map((row, i) => (
                               <tr key={i} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-6 text-slate-900 border-l-4 border-slate-200 group-hover:border-amber-500 uppercase">{row.trade_date}</td>
                                  <td className="p-6 text-slate-900 uppercase">{row.issuer_name}</td>
                                  <td className="p-6 text-slate-500">{row.sector}</td>
                                  <td className="p-6 text-slate-500">{row.rating}</td>
                                  <td className="p-6"><span className="text-slate-900">{row.instrument_type}</span> <span className="text-amber-600 ml-2">{row.tenor}</span></td>
                                  <td className="p-6">
                                      <p className="text-slate-900">{row.ipt_level}</p>
                                      <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1">{row.trading_model_indicator_text}</p>
                                  </td>
                                  <td className="p-6 text-center">
                                      {row.relevering_flag === 1 && (
                                         <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-rose-100">
                                            <AlertTriangle size={10} /> Re-levering
                                         </span>
                                      )}
                                  </td>
                               </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {reportDetail.product_code === 'NEW_SUPPLY_WEEKLY' && (
               <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {(reportDetail.monthly || []).map((m, i) => (
                           <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 text-slate-100 group-hover:text-amber-50 transition-colors z-0"><PieChart size={120} /></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Month Period</p>
                                    <h4 className="text-2xl font-black text-slate-900 mb-6">{m.month.replace('_partial', '')} {m.month.includes('partial') && <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded ml-2 text-slate-500 align-middle">MTD</span>}</h4>
                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center"><span className="text-xs uppercase text-slate-500 font-bold">Total Issuers</span> <span className="text-lg font-black text-slate-900">{m.issuers_count}</span></div>
                                       <div className="flex justify-between items-center"><span className="text-xs uppercase text-slate-500 font-bold">Total Tranches</span> <span className="text-lg font-black text-slate-900">{m.bonds_issued}</span></div>
                                       <div className="flex justify-between items-center"><span className="text-xs uppercase text-slate-500 font-bold">Market Cap</span> <span className="text-lg font-black text-emerald-600">${m.market_cap_mm?.toLocaleString()}M</span></div>
                                    </div>
                                </div>
                           </div>
                       ))}
                   </div>
                   <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-4 md:p-10 flex flex-col">
                       <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Weekly Progression</h3>
                       <div className="overflow-auto custom-scrollbar border border-slate-100 rounded-2xl">
                           <table className="w-full text-left whitespace-nowrap">
                               <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                   <tr>
                                       <th className="p-6">Week Ending</th>
                                       <th className="p-6">Key Issuers</th>
                                       <th className="p-6 text-center">Bonds Issued</th>
                                       <th className="p-6 text-center">Hit Fair Value</th>
                                       <th className="p-6 text-right">Avg Tightening (bp)</th>
                                       <th className="p-6 text-right">Avg Miss (bp)</th>
                                   </tr>
                               </thead>
                               <tbody className="text-xs font-bold divide-y divide-slate-100">
                                   {(reportDetail.weekly || []).map((w, i) => (
                                       <tr key={i} className="hover:bg-slate-50">
                                           <td className="p-6 text-slate-900">{w.week_ending}</td>
                                           <td className="p-6 text-slate-500 truncate max-w-[200px]" title={w.key_issuers}>{w.key_issuers}</td>
                                           <td className="p-6 text-center text-slate-900">{w.bonds_issued}</td>
                                           <td className="p-6 text-center text-emerald-600">{w.bonds_reached_fair_value}</td>
                                           <td className="p-6 text-right text-emerald-600">{w.avg_tightening_reached_bp}</td>
                                           <td className="p-6 text-right text-rose-600">+{w.avg_change_outside_bp}</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   </div>
               </div>
            )}

            {!['TRADE_SUMMARY_DAILY', 'NEW_SUPPLY_DAILY', 'NEW_SUPPLY_WEEKLY', 'ISSUER_EARNINGS_QUARTERLY'].includes(reportDetail.product_code) && (
              <div className="space-y-8">

                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-4 md:p-10 flex flex-col">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                             <Database className="text-amber-500" /> Sector Analysis Explorer
                        </h3>
                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            <div className="min-w-[180px]">
                                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Sector Filter</label>
                                <div className="relative">
                                    <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-bold uppercase transition-all"
                                        value={filterSector}
                                        onChange={(e) => setFilterSector(e.target.value)}
                                    >
                                        {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-auto max-h-[600px] custom-scrollbar rounded-2xl border border-slate-100">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="bg-slate-900 text-white rounded-t-2xl">
                                <tr className="text-[10px] font-black uppercase tracking-widest">
                                    <th className="p-6">Sector / Asset Class</th>
                                    <th className="p-6">Sentiment Bucket</th>
                                    <th className="p-6 text-center">Long Indicators</th>
                                    <th className="p-6 text-center">Short Indicators</th>
                                    <th className="p-6 text-center">Attractive Opps</th>
                                    <th className="p-6 text-right">Mcap Long ($MM)</th>
                                    <th className="p-6 text-right">Mcap Short ($MM)</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-bold divide-y divide-slate-100">
                                {filteredSnapshots.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-6 text-slate-900 border-l-4 border-slate-200 group-hover:border-amber-500 transition-all uppercase tracking-tight font-black">{row.sector || 'Unknown'}</td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                                                (row.rating_bucket || '').includes('Bullish') || (row.rating_bucket || '').includes('AA') || (row.rating_bucket || '').includes('Overweight') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                (row.rating_bucket || '').includes('Bearish') || (row.rating_bucket || '').includes('Underweight') || (row.rating_bucket || '').includes('HY') ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {row.rating_bucket || 'Neutral / Benchmark'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center text-emerald-600 font-black">{row.long_indicators}</td>
                                        <td className="p-6 text-center text-rose-600 font-black">{row.short_indicators}</td>
                                        <td className="p-6 text-center">
                                            <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-lg text-xs font-black">{row.attractive_bonds_count}</span>
                                        </td>
                                        <td className="p-6 text-right text-slate-900">${row.long_mcap_mm?.toLocaleString() || '0'}M</td>
                                        <td className="p-6 text-right text-slate-400">${row.short_mcap_mm?.toLocaleString() || '0'}M</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
