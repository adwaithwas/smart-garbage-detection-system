import { motion } from 'framer-motion';
import { CheckCircle2, Crosshair } from 'lucide-react';

export default function DetectionSummary({ detections, totalObjects }) {
  // Group detections by category
  const grouped = detections.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const highestConfidence = Math.max(...detections.map(d => d.confidence));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Detection Summary</h3>
        <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          <Crosshair className="w-4 h-4" />
          <span>Max Conf: {(highestConfidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1">Total Objects</p>
          <p className="text-2xl font-bold text-white">{totalObjects}</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1">Status</p>
          <p className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Analyzed
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-3">Identified Categories</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {Object.entries(grouped).map(([category, count], idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-800">
              <span className="text-sm font-medium text-slate-300">{category}</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md">{count} items</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
