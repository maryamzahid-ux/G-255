import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Products from './pages/Products';
import Subscriptions from './pages/Subscriptions';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Landing from './pages/Landing';
import { AlertCircle, Bell, CheckCircle2 } from 'lucide-react';

const API_BASE = '/api';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('g255_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && !user.isAdmin) {
      axios.get(`/api/notifications/${user.id}`)
        .then(res => setNotifications(res.data))
        .catch(console.error);
    }
  }, [user]);

  const markNotifRead = async (id) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch(err) { console.error(err); }
  };

  const handleLogin = (u) => {
    localStorage.setItem('g255_user', JSON.stringify(u));
    setUser(u);
  };

  const navigate = (page, params = null) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  const handleLogout = () => {
    localStorage.removeItem('g255_user');
    setUser(null);
    setCurrentPage('dashboard');
    setPageParams(null);
  };

  const isAdminPath = window.location.pathname === '/admin';

  if (loading) return null;
  
  if (!user) {
    if (isAdminPath) {
      return <Login onLogin={handleLogin} title="G–255 Insight Systems Administration" />;
    }
    return <Landing onLogin={handleLogin} />;
  }

  // If user is logged in but on /admin path and is not admin, or vice versa, we can handle it
  // But standard is:
  const renderPage = () => {
    // Force admin page if on /admin path and is admin
    if (user.isAdmin && (isAdminPath || currentPage === 'admin')) {
      return <Admin user={user} onNavigate={navigate} />;
    }
    switch(currentPage) {
      case 'dashboard': return <Dashboard user={user} onNavigate={navigate} />;
      case 'reports': return <Reports user={user} onNavigate={navigate} reportId={pageParams?.reportId} />;
      case 'products': return <Products user={user} onNavigate={navigate} />;
      case 'subscriptions': return <Subscriptions user={user} onNavigate={navigate} />;
      case 'admin': return <Admin user={user} onNavigate={navigate} />;
      default: return <Dashboard user={user} onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        user={user} 
        activePage={currentPage} 
        onNavigate={navigate} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 overflow-auto p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{currentPage.replace('-', ' ')}</h1>
                <p className="text-slate-500 font-medium mt-1">G–255 Insight Deliverables</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[9px] font-black tracking-widest uppercase">
               G–255 INSIGHT 
            </div>
            
            {user && !user.isAdmin && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotif(!showNotif)}
                  className="p-2 relative bg-white border border-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.read_at).length > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {notifications.filter(n => !n.read_at).length}
                    </span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                         <div className="p-6 text-center text-xs font-bold text-slate-400">No recent activity.</div>
                      ) : notifications.map(n => (
                        <div                           key={n.id} 
                           onClick={() => { if(!n.read_at) markNotifRead(n.id); navigate('reports', { reportId: n.report_id }); setShowNotif(false); }}
                          className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read_at ? 'bg-amber-50/30' : ''}`}
                        >
                           <p className={`text-xs ${!n.read_at ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{n.message}</p>
                           <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide font-bold">{new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {renderPage()}
      </main>
    </div>
  );
}

export default App;
