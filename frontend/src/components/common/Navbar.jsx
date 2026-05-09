import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed w-full z-50 glass border-b border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              CleanSight AI
            </span>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              <Link to="/upload" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Report Garbage</Link>
              <Link to="/dashboard" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Live Dashboard</Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <Link to="/upload" className="bg-primary/10 hover:bg-primary/20 text-blue-400 border border-blue-500/50 px-4 py-2 rounded-lg text-sm font-medium transition-all glow-border">
              Launch App
            </Link>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none">
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
