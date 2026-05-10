import { motion } from 'framer-motion';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';

export default function ReportHistoryPanel({ reports, onSelectReport, selectedReportId }) {
  
  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="glass-card flex flex-col h-[500px] lg:h-[600px] overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Recent Reports
        </h3>
        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-500/30">
          {reports.filter(r => r.status !== 'Resolved').length} Active
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
        {reports.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <MapPin className="w-8 h-8 mb-2 opacity-50" />
            <p>No recent reports found in the area.</p>
          </div>
        ) : (
          reports.map((report, idx) => (
            <motion.div 
              key={report.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectReport(report)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedReportId === report.id 
                  ? 'bg-slate-800 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                  : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
              } ${report.status === 'Resolved' ? 'opacity-50 grayscale-[0.3]' : 'opacity-100'}`}
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-700 relative">
                  <img src={report.imageUrl} alt="Garbage thumbnail" className="w-full h-full object-cover" />
                  {report.status === 'Resolved' && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <div className="bg-emerald-500 text-white rounded-full p-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex gap-1.5 items-center">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        report.severity === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        report.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {report.severity}
                      </span>
                      {report.status === 'Resolved' && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{timeAgo(report.timestamp)}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 truncate">{report.address}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Coverage: {report.coveragePercentage}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
