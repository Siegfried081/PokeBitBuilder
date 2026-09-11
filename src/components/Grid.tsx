import React, { useEffect, useCallback, useRef } from 'react';
import { Grid as GridType, PixelColor } from '../types';
import { Pixel } from './Pixel';

interface GridProps {
  grid: GridType;
  currentColor: PixelColor;
  onPaintPixel: (index: number, color: PixelColor) => void;
}

type DrawMode = 'paint' | 'erase' | null;

export const Grid: React.FC<GridProps> = ({ grid, currentColor, onPaintPixel }) => {
  const isMouseDownRef = useRef(false);
  const drawModeRef = useRef<DrawMode>(null);
  const eraseTargetColorRef = useRef<PixelColor>(null);

  const gridRef = useRef(grid);
  gridRef.current = grid;

  const currentColorRef = useRef(currentColor);
  currentColorRef.current = currentColor;

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isMouseDownRef.current = false;
      drawModeRef.current = null;
      eraseTargetColorRef.current = null;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handlePixelMouseDown = useCallback(
    (index: number) => {
      isMouseDownRef.current = true;
      const pixelColor = gridRef.current[index];
      const activeColor = currentColorRef.current;

      // Se o usuário clicou num pixel que já tem a cor selecionada (e não é null)
      // Modo Apagar: apaga o LED imediatamente e define a cor a ser apagada no arraste
      if (activeColor !== null && pixelColor === activeColor) {
        drawModeRef.current = 'erase';
        eraseTargetColorRef.current = activeColor;
        onPaintPixel(index, null);
      } else {
        // Modo Pintar: pinta com a cor ativa (ou apaga se a cor ativa for a borracha/null)
        drawModeRef.current = 'paint';
        eraseTargetColorRef.current = null;
        onPaintPixel(index, activeColor);
      }
    },
    [onPaintPixel]
  );

  const handlePixelMouseEnter = useCallback(
    (index: number) => {
      if (!isMouseDownRef.current || !drawModeRef.current) return;

      if (drawModeRef.current === 'erase') {
        const pixelColor = gridRef.current[index];
        const targetColor = eraseTargetColorRef.current;
        // Apaga se o pixel visitado tiver a mesma cor que ativou o modo apagar
        if (pixelColor === targetColor) {
          onPaintPixel(index, null);
        }
      } else if (drawModeRef.current === 'paint') {
        onPaintPixel(index, currentColorRef.current);
      }
    },
    [onPaintPixel]
  );

  return (
    <div className="relative p-4 md:p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col items-center">
      {/* Moldura do Display LED 8x8 */}
      <div className="w-full max-w-[360px] sm:max-w-[420px] aspect-square p-3 bg-slate-950 rounded-xl border border-slate-800/80 shadow-inner grid grid-cols-8 gap-1.5 sm:gap-2">
        {grid.map((color, index) => (
          <Pixel
            key={index}
            index={index}
            color={color}
            onMouseDown={handlePixelMouseDown}
            onMouseEnter={handlePixelMouseEnter}
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
