import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SmartCityMap from '../components/dashboard/SmartCityMap';
import ReportDetailsModal from '../components/dashboard/ReportDetailsModal';
import { getReports } from '../utils/reportStorage';
import { Layers, List } from 'lucide-react';

export default function LiveMapPage() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = async () => {
    const loadedReports = await getReports();
    setReports(loadedReports);
    
    if (selectedReport) {
      const updated = loadedReports.find(r => r.id === selectedReport.id);
      if (updated) setSelectedReport(updated);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadReports();
    const intervalId = setInterval(loadReports, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleOpenModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Live Operational Map</h1>
          <p className="text-slate-400">Full-scale spatial monitoring and management.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-400 glass px-4 py-2 rounded-lg">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Interactive Layers</span>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 relative glass-card p-2 overflow-hidden border-slate-700/50 shadow-2xl"
      >
        <SmartCityMap 
          reports={reports} 
          selectedLocation={selectedReport} 
        />
        
        {/* Floating Controls Overlay */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl w-48">
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Map Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                <span className="text-xs text-slate-300">High Severity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                <span className="text-xs text-slate-300">Medium Severity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-xs text-slate-300">Low Severity</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800 mt-1">
                <div className="w-3 h-3 rounded-full bg-slate-500 opacity-40 border border-white/20"></div>
                <span className="text-xs text-slate-400 italic">Resolved Report</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Report Modal Integration */}
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
