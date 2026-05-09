import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background elements */}
      <div className="fixed inset-0 bg-grid-pattern z-[-1] opacity-20"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-[-2]"></div>
      
      {/* Glowing orbs */}
      <div className="fixed top-[20%] left-[10%] w-96 h-96 bg-primary/20 rounded-full blur-[128px] z-[-1] pointer-events-none var(--animate-pulse-slow)"></div>
      <div className="fixed bottom-[20%] right-[10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] z-[-1] pointer-events-none var(--animate-pulse-slow)" style={{ animationDelay: '1s' }}></div>

      <Navbar />
      
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
}
