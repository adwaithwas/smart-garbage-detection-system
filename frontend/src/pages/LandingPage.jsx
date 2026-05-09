import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, MapPin, Zap, ArrowRight, UploadCloud } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-blue-400 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          AI-Powered Smart City Solution
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          Keep Your City Clean with <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
            CleanSight AI
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10"
        >
          Report garbage in public spaces instantly. Our AI engine analyzes severity, 
          detects object types, and alerts municipal cleanup teams automatically.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/upload" className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
            <UploadCloud className="w-5 h-5" />
            Report Garbage
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/dashboard" className="flex items-center justify-center gap-2 glass hover:bg-slate-800/80 text-white px-8 py-4 rounded-xl font-semibold transition-all">
            View Live Dashboard
          </Link>
        </motion.div>
      </section>

      {/* Stats/Features Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "AI Detection", desc: "Instantly identifies garbage types and calculates severity score." },
            { icon: MapPin, title: "Precision Mapping", desc: "Live mapping of polluted hotspots across the city." },
            { icon: ShieldAlert, title: "Smart Routing", desc: "Optimizes cleanup vehicle dispatch based on AI urgency." }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + (idx * 0.1) }}
              className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-700/50 group-hover:border-blue-500/50 transition-colors">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
