import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, MapPin, TrendingUp } from 'lucide-react';

export default function MunicipalStatsPanel({ reports }) {
  const total = reports.length;
  const highSeverity = reports.filter(r => r.severity === 'High').length;
  const pending = reports.filter(r => r.status === 'Pending').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;

  const stats = [
    { title: "Total Reports", value: total, icon: MapPin, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { title: "Critical Alerts", value: highSeverity, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { title: "Pending Action", value: pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { title: "Resolved", value: resolved, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`glass-card p-6 border ${stat.border}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
