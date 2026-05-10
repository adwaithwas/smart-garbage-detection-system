import { motion } from 'framer-motion';
import { AlertTriangle, Info, ShieldCheck, Recycle, Trash2, Biohazard } from 'lucide-react';
import AnimatedProgressRing from './AnimatedProgressRing';

const SEVERITY_CONFIG = {
  Low:    { colour: 'text-emerald-400', ringColor: 'text-emerald-500', icon: ShieldCheck, label: 'Low Impact',      bg: 'bg-emerald-500/10',  border: 'border-emerald-500/25', bar: 'from-emerald-500 to-emerald-400' },
  Medium: { colour: 'text-amber-400',   ringColor: 'text-amber-500',   icon: Info,        label: 'Medium Severity', bg: 'bg-amber-500/10',    border: 'border-amber-500/25',   bar: 'from-amber-500  to-amber-400'   },
  High:   { colour: 'text-red-400',     ringColor: 'text-red-500',     icon: AlertTriangle, label: 'High Severity', bg: 'bg-red-500/10',      border: 'border-red-500/25',     bar: 'from-red-500    to-red-400'     },
};

const CLASS_CHIPS = [
  { key: 'garbageCount',    label: 'Garbage',    icon: Trash2,   colour: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
  { key: 'recyclableCount', label: 'Recyclable', icon: Recycle,  colour: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { key: 'hazardousCount',  label: 'Hazardous',  icon: AlertTriangle, colour: 'text-red-400', bg: 'bg-red-500/10',    border: 'border-red-500/20'     },
];

export default function SeverityCard({ severity, coveragePercentage, hazardousCount = 0, recyclableCount = 0, garbageCount = 0 }) {
  const cfg  = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Low;
  const Icon = cfg.icon;

  const counts = { garbageCount, recyclableCount, hazardousCount };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${cfg.bar}`} />

      <h3 className="text-base font-bold mb-5 tracking-tight">Severity Analysis</h3>

      {/* Severity badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 ${cfg.bg} border ${cfg.border}`}>
        <Icon className={`w-4 h-4 ${cfg.colour}`} />
        <span className={`text-sm font-semibold ${cfg.colour}`}>{cfg.label}</span>
      </div>

      {/* Coverage ring */}
      <div className="flex justify-center mb-5">
        <AnimatedProgressRing percentage={coveragePercentage} colorClass={cfg.ringColor} />
      </div>

      {/* Class breakdown chips */}
      <div className="grid grid-cols-3 gap-2">
        {CLASS_CHIPS.map(({ key, label, icon: ChipIcon, colour, bg, border }) => (
          <div key={key} className={`flex flex-col items-center justify-center p-2 rounded-xl ${bg} border ${border}`}>
            <ChipIcon className={`w-3.5 h-3.5 ${colour} mb-1`} />
            <span className={`text-lg font-bold ${colour}`}>{counts[key]}</span>
            <span className="text-[10px] text-slate-400 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
