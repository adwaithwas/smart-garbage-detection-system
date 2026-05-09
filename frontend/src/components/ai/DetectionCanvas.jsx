import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DetectionCanvas({ imageUrl, isScanning, detections, onImageLoad }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      onImageLoad(img.naturalWidth, img.naturalHeight);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      
      // Calculate scaled dimensions to fit container
      const container = containerRef.current;
      const scale = Math.min(
        container.clientWidth / img.naturalWidth,
        container.clientHeight / img.naturalHeight
      );
      
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      
      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw detections if any and not scanning
      if (!isScanning && detections && detections.length > 0) {
        detections.forEach(det => {
          const { x, y, width, height } = det.box;
          const sx = x * scale;
          const sy = y * scale;
          const sw = width * scale;
          const sh = height * scale;

          // Box styles
          ctx.strokeStyle = '#3b82f6'; // Blue-500
          ctx.lineWidth = 3;
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 10;
          ctx.strokeRect(sx, sy, sw, sh);

          // Reset shadow for text
          ctx.shadowBlur = 0;

          // Label background
          const label = `${det.category} ${(det.confidence * 100).toFixed(0)}%`;
          ctx.font = '14px Inter, sans-serif';
          const textWidth = ctx.measureText(label).width;
          
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; // slate-900
          ctx.fillRect(sx, sy - 25, textWidth + 10, 25);
          
          // Label text
          ctx.fillStyle = '#60a5fa'; // Blue-400
          ctx.fillText(label, sx + 5, sy - 7);
        });
      }
    };
  }, [imageUrl, isScanning, detections, onImageLoad]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-slate-950/50 rounded-xl overflow-hidden border border-slate-700/50">
      {imageUrl && (
        <>
          <canvas ref={canvasRef} className="max-w-full max-h-full rounded shadow-xl" />
          
          {/* Scanning Overlay Effect */}
          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 pointer-events-none"
              >
                {/* Scanning line moving down */}
                <motion.div 
                  className="absolute left-0 right-0 h-1 bg-blue-500/80 shadow-[0_0_20px_4px_rgba(59,130,246,0.5)]"
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-grid-pattern opacity-30 mix-blend-overlay"></div>
                
                {/* Scanning Text */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full border-blue-500/30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-blue-400 text-sm font-medium tracking-widest uppercase">AI Scanning...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
