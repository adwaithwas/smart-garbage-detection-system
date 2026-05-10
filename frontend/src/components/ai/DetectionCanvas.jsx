import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Per-class colour palette (mirrors backend annotation_service.py) ──────────
const CLASS_COLOURS = {
  garbage:    { stroke: '#F59E0B', glow: 'rgba(245,158,11,0.45)',  badge: '#F59E0B', label: '#1C1209' },
  recyclable: { stroke: '#10B981', glow: 'rgba(16,185,129,0.45)', badge: '#10B981', label: '#071A12' },
  hazardous:  { stroke: '#EF4444', glow: 'rgba(239,68,68,0.45)',  badge: '#EF4444', label: '#190707' },
  default:    { stroke: '#94A3B8', glow: 'rgba(148,163,184,0.3)', badge: '#94A3B8', label: '#0F172A' },
};

function getColours(category) {
  return CLASS_COLOURS[category?.toLowerCase()] || CLASS_COLOURS.default;
}

function drawCornerBox(ctx, x, y, w, h, colour, glow, cornerLen = 16) {
  // Dim full box
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.25;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();

  // Glow shadow
  ctx.shadowColor = glow;
  ctx.shadowBlur  = 14;
  ctx.strokeStyle = colour;
  ctx.lineWidth   = 2.5;

  const corners = [
    [[x, y + cornerLen], [x, y], [x + cornerLen, y]],               // TL
    [[x + w - cornerLen, y], [x + w, y], [x + w, y + cornerLen]],  // TR
    [[x, y + h - cornerLen], [x, y + h], [x + cornerLen, y + h]],  // BL
    [[x + w - cornerLen, y + h], [x + w, y + h], [x + w, y + h - cornerLen]], // BR
  ];

  corners.forEach(([p1, mid, p2]) => {
    ctx.beginPath();
    ctx.moveTo(...p1);
    ctx.lineTo(...mid);
    ctx.lineTo(...p2);
    ctx.stroke();
  });

  ctx.shadowBlur = 0;
}

function drawLabel(ctx, x, y, label, colours) {
  ctx.font = 'bold 12px "Inter", "Segoe UI", sans-serif';
  const metrics   = ctx.measureText(label);
  const tw        = metrics.width;
  const th        = 13;
  const padX      = 8;
  const padY      = 5;
  const bw        = tw + padX * 2;
  const bh        = th + padY * 2;
  const bx        = x;
  const by        = Math.max(y - bh, 0);

  // Background
  ctx.fillStyle = 'rgba(10,12,20,0.82)';
  ctx.fillRect(bx, by, bw, bh);

  // Coloured top border
  ctx.fillStyle = colours.badge;
  ctx.fillRect(bx, by, bw, 2);

  // Text
  ctx.fillStyle = '#F1F5F9';
  ctx.fillText(label, bx + padX, by + bh - padY - 1);
}

export default function DetectionCanvas({ imageUrl, isScanning, detections, onImageLoad }) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);

  const redraw = useCallback(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const container = containerRef.current;
      const canvas    = canvasRef.current;
      if (!container || !canvas) return;

      onImageLoad?.(img.naturalWidth, img.naturalHeight);

      const scale = Math.min(
        container.clientWidth  / img.naturalWidth,
        container.clientHeight / img.naturalHeight,
        1
      );

      canvas.width  = img.naturalWidth  * scale;
      canvas.height = img.naturalHeight * scale;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (!isScanning && detections?.length > 0) {
        detections.forEach(det => {
          const { x, y, width, height } = det.box;
          const sx = x      * scale;
          const sy = y      * scale;
          const sw = width  * scale;
          const sh = height * scale;

          const colours = getColours(det.category);
          drawCornerBox(ctx, sx, sy, sw, sh, colours.stroke, colours.glow);

          const label = `${det.category.toUpperCase()}  ${Math.round(det.confidence * 100)}%`;
          drawLabel(ctx, sx, sy, label, colours);
        });
      }
    };
  }, [imageUrl, isScanning, detections, onImageLoad]);

  useEffect(() => { redraw(); }, [redraw]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[420px] flex items-center justify-center bg-slate-950/60 rounded-xl overflow-hidden border border-slate-700/50"
    >
      {imageUrl && (
        <>
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full rounded shadow-2xl"
          />

          {/* Scanning Overlay */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 pointer-events-none"
              >
                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-[2px] bg-blue-400/90 shadow-[0_0_24px_6px_rgba(96,165,250,0.5)]"
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                />

                {/* Corner accent marks on scanning overlay */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-blue-400/70 rounded-tl" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-blue-400/70 rounded-tr" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-blue-400/70 rounded-bl" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-blue-400/70 rounded-br" />

                {/* Status pill */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/30">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-blue-300 text-xs font-semibold tracking-widest uppercase">
                    AI Scanning...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Empty state */}
      {!imageUrl && (
        <div className="text-center text-slate-500 select-none">
          <div className="text-5xl mb-3">🗂️</div>
          <p className="text-sm font-medium">Upload an image to begin analysis</p>
        </div>
      )}
    </div>
  );
}
