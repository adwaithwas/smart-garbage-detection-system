import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function DashboardCharts({ reports }) {
  const severityData = [
    { name: 'High', value: reports.filter(r => r.severity === 'High').length, color: '#ef4444' }, // red-500
    { name: 'Medium', value: reports.filter(r => r.severity === 'Medium').length, color: '#f59e0b' }, // amber-500
    { name: 'Low', value: reports.filter(r => r.severity === 'Low').length, color: '#10b981' } // emerald-500
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Pending', value: reports.filter(r => r.status === 'Pending').length, color: '#f87171' },
    { name: 'Assigned', value: reports.filter(r => r.status === 'Assigned').length, color: '#fbbf24' },
    { name: 'In Progress', value: reports.filter(r => r.status === 'Cleaning In Progress').length, color: '#60a5fa' },
    { name: 'Resolved', value: reports.filter(r => r.status === 'Resolved').length, color: '#34d399' }
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 h-80"
      >
        <h3 className="text-lg font-bold mb-4">Severity Distribution</h3>
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 h-80"
      >
        <h3 className="text-lg font-bold mb-4">Operational Status</h3>
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
