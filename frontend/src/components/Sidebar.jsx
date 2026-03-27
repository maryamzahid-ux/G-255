import React from 'react';
import { 
  BarChart3, 
  FileText, 
  ShoppingBag, 
  UserCircle, 
  Settings, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';

const Sidebar = ({ user, activePage, onNavigate, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Detailed Reports', icon: FileText },
  ];

  if (user.isAdmin) {
    menuItems.push({ id: 'products', label: 'Product Catalog', icon: ShoppingBag });
    menuItems.push({ id: 'admin', label: 'Report Ops Center ✨', icon: Settings });
  } else {
    menuItems.push({ id: 'subscriptions', label: 'My Subscriptions', icon: UserCircle });
  }

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-all text-slate-300">
      {/* Brand */}
      <div className="p-8 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
          <TrendingUp size={24} strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-black text-white tracking-widest uppercase whitespace-nowrap">G–255 INSIGHT</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-10 px-6 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${
              activePage === item.id 
                ? 'bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/10' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <item.icon size={20} strokeWidth={2.5} />
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </div>
            {activePage === item.id && <ChevronRight size={18} />}
          </button>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-bold text-lg">
            {user.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.email}</p>
            {user.isAdmin && (
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">
                Administrator
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 p-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
