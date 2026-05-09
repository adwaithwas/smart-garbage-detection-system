import { motion } from 'framer-motion';
import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import AnimatedProgressRing from './AnimatedProgressRing';

export default function SeverityCard({ severity, coveragePercentage }) {
  const config = {
    Low: { color: "text-emerald-400", ringColor: "text-emerald-500", icon: ShieldCheck, label: "Low Impact", bg: "bg-emerald-500/10" },
    Medium: { color: "text-amber-400", ringColor: "text-amber-500", icon: Info, label: "Medium Impact", bg: "bg-amber-500/10" },
    High: { color: "text-red-400", ringColor: "text-red-500", icon: AlertTriangle, label: "High Severity", bg: "bg-red-500/10" },
  };

  const current = config[severity] || config.Low;
  const Icon = current.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden"
    >
      <div className={`absolute top-0 w-full h-1 ${current.bg} ${current.color} shadow-[0_0_10px_currentColor]`}></div>
      
      <h3 className="text-lg font-bold mb-6 w-full text-left">Severity Analysis</h3>
      
      <AnimatedProgressRing 
        percentage={coveragePercentage} 
        colorClass={current.ringColor} 
      />
      
      <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full ${current.bg} border border-${current.color}/20`}>
        <Icon className={`w-5 h-5 ${current.color}`} />
        <span className={`font-semibold ${current.color}`}>{current.label}</span>
      </div>
    </motion.div>
  );
}
