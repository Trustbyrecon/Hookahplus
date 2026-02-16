'use client';

import { useEffect, useRef } from 'react';

export default function Heatmap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 40 + 20;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, 'rgba(211,89,48,0.8)'); // ember
      gradient.addColorStop(1, 'rgba(232,215,177,0)'); // goldLumen
      ctx.fillStyle = gradient;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }, []);

  return <canvas ref={canvasRef} width={300} height={200} className="w-full h-48 rounded" />;
}
