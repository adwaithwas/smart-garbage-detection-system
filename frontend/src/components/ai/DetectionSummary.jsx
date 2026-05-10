import { motion } from 'framer-motion';
import { CheckCircle2, Crosshair, Recycle, Trash2, AlertTriangle } from 'lucide-react';

// ─── Per-class config ──────────────────────────────────────────────────────────
const CLASS_CONFIG = {
  // Recyclables
  plastic_bottle:  { icon: Recycle,       colour: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  plastic:         { icon: Recycle,       colour: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  metal:           { icon: Recycle,       colour: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  paper_cardboard: { icon: Recycle,       colour: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  
  // Hazardous / Risk
  glass:           { icon: AlertTriangle, colour: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-400'     },
  
  // General Garbage
  garbage_bag:     { icon: Trash2,        colour: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400'   },
  cigarette:       { icon: Trash2,        colour: 'text-slate-400',   bg: 'bg-slate-700/30',   border: 'border-slate-600/30',   dot: 'bg-slate-400'   },
  mixed_trash:     { icon: Trash2,        colour: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400'   },
  
  default:         { icon: Trash2,        colour: 'text-slate-400',   bg: 'bg-slate-700/30',   border: 'border-slate-600/30',   dot: 'bg-slate-400'   },
};

function getConfig(category) {
  return CLASS_CONFIG[category?.toLowerCase()] || CLASS_CONFIG.default;
}

export default function DetectionSummary({ detections = [], totalObjects = 0 }) {
  // Group by category
  const grouped = detections.reduce((acc, d) => {
    const cat = d.category?.toLowerCase() || 'unknown';
    if (!acc[cat]) acc[cat] = { count: 0, maxConf: 0 };
    acc[cat].count++;
    if (d.confidence > acc[cat].maxConf) acc[cat].maxConf = d.confidence;
    return acc;
  }, {});

  const hasDetections = totalObjects > 0;
  const highestConf   = hasDetections
    ? Math.max(...detections.map(d => d.confidence))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold tracking-tight">Detection Summary</h3>
        {hasDetections && (
          <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Best: {Math.round(highestConf * 100)}%</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
          <p className="text-slate-400 text-xs mb-1">Total Detected</p>
          <p className="text-2xl font-bold text-white">{totalObjects}</p>
        </div>
        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
          <p className="text-slate-400 text-xs mb-1">Status</p>
          <p className="flex items-center gap-1.5 font-semibold text-sm">
            {hasDetections ? (
              <><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400">Analyzed</span></>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-slate-400">No Waste</span></>
            )}
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Identified Categories
        </h4>

        {hasDetections ? (
          <div className="space-y-2.5">
            {Object.entries(grouped).map(([cat, { count, maxConf }]) => {
              const cfg  = getConfig(cat);
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between ${cfg.bg} rounded-xl px-3 py-2.5 border ${cfg.border}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <Icon className={`w-4 h-4 ${cfg.colour}`} />
                    <span className={`text-sm font-semibold capitalize ${cfg.colour}`}>{cat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{Math.round(maxConf * 100)}%</span>
                    <span className="text-xs bg-slate-800/70 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                      ×{count}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
            <p className="text-sm">No waste detected in this image</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
