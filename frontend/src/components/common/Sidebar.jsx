import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Map, ImageUp, Activity, Settings, LogOut, Leaf } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Map, label: 'Live Map', path: '/dashboard/map' },
    { icon: ImageUp, label: 'Upload Report', path: '/upload' },
    { icon: Activity, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="w-64 h-screen fixed top-0 left-0 glass border-r border-slate-800 z-40 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            CleanSight
          </span>
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? 'bg-primary/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
