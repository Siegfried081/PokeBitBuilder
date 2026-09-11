import { useState, useCallback } from 'react';
import { PixelColor } from '../types';
import { DEFAULT_PALETTE } from '../constants/defaults';

export interface UsePaletteReturn {
  palette: string[];
  selectedColor: PixelColor;
  setSelectedColor: (color: PixelColor) => void;
  addColor: (hex: string) => boolean;
  removeColor: (hex: string) => void;
  resetPalette: () => void;
}

/**
 * Hook para gerenciamento da paleta limitada de cores e cor atualmente selecionada.
 */
export function usePalette(initialPalette: string[] = DEFAULT_PALETTE): UsePaletteReturn {
  const [palette, setPalette] = useState<string[]>(initialPalette);
  const [selectedColor, setSelectedColor] = useState<PixelColor>(initialPalette[0] ?? '#FF0000');

  const addColor = useCallback((hex: string): boolean => {
    let cleanHex = hex.trim();
    if (!cleanHex.startsWith('#')) {
      cleanHex = `#${cleanHex}`;
    }
    cleanHex = cleanHex.toUpperCase();

    // Valida formato #RRGGBB
    if (!/^#[0-9A-F]{6}$/.test(cleanHex)) {
      return false;
    }

    setPalette((prev) => {
      if (prev.includes(cleanHex)) {
        return prev;
      }
      return [...prev, cleanHex];
    });
    setSelectedColor(cleanHex);
    return true;
  }, []);

  const removeColor = useCallback((hexToRemove: string) => {
    setPalette((prev) => {
      const updated = prev.filter((color) => color.toUpperCase() !== hexToRemove.toUpperCase());
      return updated.length > 0 ? updated : prev; // Mantém ao menos 1 cor
    });

    // Se a cor removida era a ativa, seleciona a primeira restante ou null
    setSelectedColor((current) => {
      if (current && current.toUpperCase() === hexToRemove.toUpperCase()) {
        return null;
      }
      return current;
    });
  }, []);

  const resetPalette = useCallback(() => {
    setPalette(DEFAULT_PALETTE);
    setSelectedColor(DEFAULT_PALETTE[0] ?? null);
  }, []);

  return {
    palette,
    selectedColor,
    setSelectedColor,
    addColor,
    removeColor,
    resetPalette,
  };
}
