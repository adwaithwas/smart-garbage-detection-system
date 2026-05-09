import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, AlertTriangle, Truck, Clock, Crosshair, CheckCircle2 } from 'lucide-react';
import { updateReportStatus } from '../../utils/reportStorage';
import { useState } from 'react';

export default function ReportDetailsModal({ report, onClose, onUpdate }) {
  if (!report) return null;

  const [status, setStatus] = useState(report.status);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    await updateReportStatus(report.id, newStatus);
    if (onUpdate) onUpdate();
  };

  const getStatusColor = (s) => {
    switch(s) {
      case 'Resolved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Cleaning In Progress': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Assigned': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] glass-card overflow-hidden flex flex-col shadow-2xl shadow-blue-900/20"
        >
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-slate-700/50 flex justify-between items-start bg-slate-900/50">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl md:text-2xl font-bold">Report Details</h2>
                <span className={`text-xs px-2 py-1 rounded border font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
              <p className="text-slate-400 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" /> {report.address}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Image & Map info */}
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-700 relative group aspect-video">
                  <img src={report.imageUrl} alt="Reported Garbage" className="w-full h-full object-cover" />
                  
                  {/* Overlay detections on image for cinematic feel if available */}
                  {report.detections && report.detections.length > 0 && (
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                       <span className="text-white font-medium flex items-center gap-2">
                         <Crosshair className="w-5 h-5 text-blue-400" /> AI Bounding Boxes Hidden in Modal
                       </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Timestamp</p>
                    <p className="text-sm font-medium">{new Date(report.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Coordinates</p>
                    <p className="text-sm font-medium font-mono">{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              {/* Analysis Info */}
              <div className="space-y-6">
                
                {/* Severity Row */}
                <div className={`p-4 rounded-xl border ${
                  report.severity === 'High' ? 'bg-red-500/10 border-red-500/30' :
                  report.severity === 'Medium' ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-emerald-500/10 border-emerald-500/30'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">Severity</span>
                    <span className={`text-lg font-bold ${
                      report.severity === 'High' ? 'text-red-400' :
                      report.severity === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>{report.severity}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                    <div className={`h-2 rounded-full ${
                      report.severity === 'High' ? 'bg-red-500' :
                      report.severity === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} style={{ width: `${report.coveragePercentage}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-right">{report.coveragePercentage}% Coverage</p>
                </div>

                {/* Recommendation */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Recommended Vehicle</p>
                    <p className="text-sm font-bold text-slate-200">{report.vehicleRecommended}</p>
                  </div>
                </div>

                {/* Detections List */}
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-2">AI Detections ({report.totalObjects})</p>
                  <div className="flex flex-wrap gap-2">
                    {report.detections?.map((det, idx) => (
                      <span key={idx} className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-2 py-1 rounded-md">
                        {det.category} ({(det.confidence * 100).toFixed(0)}%)
                      </span>
                    )) || <span className="text-sm text-slate-500">No specific detection data available.</span>}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 md:p-6 border-t border-slate-700/50 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm text-slate-400 font-medium whitespace-nowrap">Update Status:</label>
              <select 
                value={status}
                onChange={handleStatusChange}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="Cleaning In Progress">Cleaning In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
