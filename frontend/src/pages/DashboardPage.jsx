import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SmartCityMap from '../components/dashboard/SmartCityMap';
import MunicipalStatsPanel from '../components/dashboard/MunicipalStatsPanel';
import ReportHistoryPanel from '../components/dashboard/ReportHistoryPanel';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import ReportDetailsModal from '../components/dashboard/ReportDetailsModal';
import { getReports, initializeMockData } from '../utils/reportStorage';

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadReports = async () => {
    const loadedReports = await getReports();
    setReports(loadedReports);
    
    if (selectedReport) {
      const updated = loadedReports.find(r => r.id === selectedReport.id);
      if (updated) setSelectedReport(updated);
    }
  };

  useEffect(() => {
    loadReports();
    
    // Simple polling for real-time dashboard updates (every 10s)
    const intervalId = setInterval(loadReports, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  const handleOpenModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">City Overview</h1>
          <p className="text-slate-400">Live garbage detection and severity monitoring.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 glass px-4 py-2 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Updates Active
        </div>
      </div>

      <MunicipalStatsPanel reports={reports} />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Map Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 relative z-0"
        >
          <SmartCityMap 
            reports={reports} 
            selectedLocation={selectedReport} 
          />
        </motion.div>

        {/* History Sidebar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <ReportHistoryPanel 
            reports={reports} 
            onSelectReport={handleOpenModal}
            selectedReportId={selectedReport?.id}
          />
        </motion.div>
      </div>

      <DashboardCharts reports={reports} />

      {/* Report Modal */}
      {isModalOpen && selectedReport && (
        <ReportDetailsModal 
          report={selectedReport} 
          onClose={handleCloseModal}
          onUpdate={loadReports}
        />
      )}
    </div>
  );
}
