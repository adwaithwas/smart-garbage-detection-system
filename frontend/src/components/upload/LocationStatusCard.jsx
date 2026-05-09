import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { getCurrentLocation, reverseGeocode } from '../../utils/geolocation';

export default function LocationStatusCard({ onLocationFound }) {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const coords = await getCurrentLocation();
        setLocation(coords);
        
        // Use timeout to prevent API rate limiting issues in dev
        const addr = await reverseGeocode(coords.latitude, coords.longitude);
        setAddress(addr);
        
        onLocationFound({ ...coords, address: addr });
        setIsLoading(false);
      } catch (err) {
        console.warn("Using mock location due to error:", err);
        // Mock location (NYC) for MVP if permission denied
        const mockCoords = { latitude: 40.7128, longitude: -74.0060, timestamp: Date.now() };
        setLocation(mockCoords);
        setAddress("Demo Location (New York City)");
        onLocationFound({ ...mockCoords, address: "Demo Location (New York City)" });
        setError("Using demo location (Permission denied or unavailable)");
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" /> GPS Tracking
        </h3>
        {isLoading ? (
          <span className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Locating...
          </span>
        ) : error ? (
          <span className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
            <AlertCircle className="w-4 h-4" /> Demo Mode
          </span>
        ) : (
          <span className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            GPS Locked
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Estimated Address</p>
          <p className="text-sm font-medium text-slate-200 line-clamp-2">
            {isLoading ? "Fetching coordinates..." : address}
          </p>
        </div>

        {!isLoading && location && (
          <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div>
              <p className="text-xs text-slate-400">Coordinates</p>
              <p className="text-sm font-mono text-slate-300">
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </p>
            </div>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
