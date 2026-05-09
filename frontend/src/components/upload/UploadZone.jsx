import { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UploadZone({ onImageSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      onImageSelect(file, url);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px] glow-border
        ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-blue-500/50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*"
      />
      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
        <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-blue-400' : 'text-slate-400'}`} />
      </div>
      <h3 className="text-xl font-semibold mb-2">Drag & Drop Image Here</h3>
      <p className="text-slate-400 mb-6">or click to browse from your device</p>
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> PNG, JPG, JPEG</span>
        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> GPS enabled</span>
      </div>
    </motion.div>
  );
}
