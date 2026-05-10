import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import LiveMapPage from './pages/LiveMapPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Route>

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          {/* Main Operational Routes */}
          <Route path="map" element={<LiveMapPage />} />
          <Route path="analytics" element={<div className="p-8 text-slate-400">Analytics View Pending</div>} />
          <Route path="settings" element={<div className="p-8 text-slate-400">Settings View Pending</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
