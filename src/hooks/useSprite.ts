import { useState, useCallback, useMemo } from 'react';
import { Grid, PixelColor } from '../types';
import { createEmptyGrid, TOTAL_PIXELS } from '../constants/defaults';

export interface UseSpriteReturn {
  grid: Grid;
  paintPixel: (index: number, color: PixelColor) => void;
  clearGrid: () => void;
  setGrid: (newGrid: Grid) => void;
  isGridEmpty: boolean;
  activePixelsCount: number;
}

/**
 * Hook para gerenciamento do estado da matriz de 64 pixels do sprite 8x8.
 */
export function useSprite(): UseSpriteReturn {
  const [grid, setGridState] = useState<Grid>(createEmptyGrid);

  const paintPixel = useCallback((index: number, color: PixelColor) => {
    if (index < 0 || index >= TOTAL_PIXELS) return;

    setGridState((prevGrid) => {
      // Se a cor já for a mesma, evita re-render desnecessário
      if (prevGrid[index] === color) {
        return prevGrid;
      }
      const nextGrid = [...prevGrid];
      nextGrid[index] = color;
      return nextGrid;
    });
  }, []);

  const clearGrid = useCallback(() => {
    setGridState(createEmptyGrid());
  }, []);

  const setGrid = useCallback((newGrid: Grid) => {
    if (newGrid.length === TOTAL_PIXELS) {
      setGridState([...newGrid]);
    }
  }, []);

  const activePixelsCount = useMemo(() => {
    return grid.filter((pixel) => pixel !== null).length;
  }, [grid]);

  const isGridEmpty = activePixelsCount === 0;

  return {
    grid,
    paintPixel,
    clearGrid,
    setGrid,
    isGridEmpty,
    activePixelsCount,
  };
}
