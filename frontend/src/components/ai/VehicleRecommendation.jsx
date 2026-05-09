import { motion } from 'framer-motion';
import { Truck, Car, Route } from 'lucide-react'; // Using Route as a fallback for 'van' since lucide might not have 'van'

export default function VehicleRecommendation({ recommendation }) {
  if (!recommendation) return null;

  const IconMap = {
    truck: Truck,
    van: Route, // Fallback icon
    car: Car
  };

  const Icon = IconMap[recommendation.icon] || Truck;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-6 border-l-4 border-l-blue-500"
    >
      <h3 className="text-sm font-medium text-slate-400 mb-4">Recommended Cleanup Response</h3>
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-xl ${recommendation.bg} border border-${recommendation.color.replace('text-', '')}/20`}>
          <Icon className={`w-8 h-8 ${recommendation.color}`} />
        </div>
        <div>
          <h4 className="text-xl font-bold">{recommendation.type}</h4>
          <p className="text-sm text-slate-400 mt-1">Dispatch optimized for estimated volume</p>
        </div>
      </div>
    </motion.div>
  );
}
