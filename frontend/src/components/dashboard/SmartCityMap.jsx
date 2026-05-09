import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, Car, Route, Clock, Calendar, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix for custom icons using divIcon to avoid default leaflet image path issues
const createCustomIcon = (severity) => {
  const colors = {
    High: { border: 'border-red-500', bg: 'bg-red-500', shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.8)]' },
    Medium: { border: 'border-amber-500', bg: 'bg-amber-500', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.8)]' },
    Low: { border: 'border-emerald-500', bg: 'bg-emerald-500', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.8)]' }
  };
  const style = colors[severity] || colors.Low;

  const html = `
    <div class="relative w-8 h-8 group">
      <div class="absolute inset-0 rounded-full ${style.border} border-2 ${style.shadow} animate-pulse bg-slate-900/80"></div>
      <div class="absolute inset-2 rounded-full ${style.bg}"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

export default function SmartCityMap({ reports, selectedLocation }) {
  const [center, setCenter] = useState([40.7128, -74.0060]); // Default NYC

  useEffect(() => {
    if (selectedLocation) {
      setCenter([selectedLocation.latitude, selectedLocation.longitude]);
    } else if (reports.length > 0) {
      setCenter([reports[0].latitude, reports[0].longitude]);
    }
  }, [selectedLocation, reports]);

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full bg-slate-900"
      >
        {/* Dark Matter theme from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater center={center} />

        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.latitude, report.longitude]}
            icon={createCustomIcon(report.severity)}
          >
            <Popup className="custom-popup">
              <div className="p-1 w-64 text-slate-200">
                <div className="h-32 w-full rounded-lg overflow-hidden mb-3 relative">
                  <img src={report.imageUrl} alt="Garbage" className="w-full h-full object-cover" />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold border ${
                    report.severity === 'High' ? 'bg-red-500/80 border-red-400' :
                    report.severity === 'Medium' ? 'bg-amber-500/80 border-amber-400' :
                    'bg-emerald-500/80 border-emerald-400'
                  }`}>
                    {report.severity}
                  </div>
                </div>
                
                <h3 className="font-bold text-sm mb-1 line-clamp-1">{report.address}</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-800 p-2 rounded flex flex-col">
                    <span className="text-[10px] text-slate-400">Coverage</span>
                    <span className="text-xs font-bold">{report.coveragePercentage}%</span>
                  </div>
                  <div className="bg-slate-800 p-2 rounded flex flex-col">
                    <span className="text-[10px] text-slate-400">Objects</span>
                    <span className="text-xs font-bold">{report.totalObjects}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 border-t border-slate-700 pt-2">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(report.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <style>{`
        .leaflet-popup-content-wrapper {
          background-color: #0f172a; /* slate-950 */
          border: 1px solid #334155; /* slate-700 */
          border-radius: 0.75rem;
          color: #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .leaflet-popup-tip {
          background-color: #0f172a;
          border: 1px solid #334155;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
