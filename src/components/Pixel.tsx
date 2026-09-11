import React from 'react';
import { PixelColor } from '../types';

interface PixelProps {
  index: number;
  color: PixelColor;
  onMouseDown: (index: number) => void;
  onMouseEnter: (index: number) => void;
}

export const Pixel: React.FC<PixelProps> = React.memo(({ index, color, onMouseDown, onMouseEnter }) => {
  const isLit = color !== null;

  const handleMouseEnter = () => {
    onMouseEnter(index);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onMouseDown(index);
  };

  return (
    <button
      type="button"
      id={`pixel-${index}`}
      title={`LED #${index} (${color ?? 'desligado'})`}
      aria-label={`Pixel ${index}, cor ${color ?? 'desligado'}`}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      className={`
        relative aspect-square w-full rounded-md md:rounded-lg transition-all duration-150 select-none
        flex items-center justify-center cursor-pointer border
        focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900
        ${
          isLit
            ? 'border-white/20 shadow-md hover:scale-105'
            : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-600 hover:bg-slate-800/60'
        }
      `}
      style={{
        backgroundColor: color ?? undefined,
        boxShadow: isLit ? `0 0 12px ${color}66, inset 0 1px 2px rgba(255,255,255,0.4)` : undefined,
      }}
    >
      {/* Ponto central do diodo LED */}
      <span
        className={`w-1.5 h-1.5 rounded-full pointer-events-none transition-opacity duration-150 ${
          isLit ? 'bg-white/40' : 'bg-slate-800'
        }`}
      />
    </button>
  );
});

Pixel.displayName = 'Pixel';
