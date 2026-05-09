import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex relative">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern z-[-1] opacity-10"></div>
      
      <Sidebar />
      
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all">
        {/* Top Header for Mobile could go here */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
