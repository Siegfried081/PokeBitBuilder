import React, { useState, useEffect, useCallback } from 'react';
import { Grid as GridType, PixelColor } from '../types';
import { Pixel } from './Pixel';

interface GridProps {
  grid: GridType;
  currentColor: PixelColor;
  onPaintPixel: (index: number, color: PixelColor) => void;
}

export const Grid: React.FC<GridProps> = ({ grid, currentColor, onPaintPixel }) => {
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handlePaint = useCallback(
    (index: number) => {
      onPaintPixel(index, currentColor);
    },
    [currentColor, onPaintPixel]
  );

  return (
    <div
      className="relative p-4 md:p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col items-center"
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onMouseLeave={() => setIsMouseDown(false)}
    >
      {/* Moldura do Display LED 8x8 */}
      <div className="w-full max-w-[360px] sm:max-w-[420px] aspect-square p-3 bg-slate-950 rounded-xl border border-slate-800/80 shadow-inner grid grid-cols-8 gap-1.5 sm:gap-2">
        {grid.map((color, index) => (
          <Pixel
            key={index}
            index={index}
            color={color}
            onPaint={handlePaint}
            isMouseDown={isMouseDown}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between w-full max-w-[360px] sm:max-w-[420px] text-xs text-slate-400 px-1">
        <span>Matriz 8x8 (64 LEDs WS2812)</span>
        <span>Índices 0 → 63</span>
      </div>
    </div>
  );
};
