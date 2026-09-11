import { Grid } from '../types';

export const GRID_DIMENSION = 8;
export const TOTAL_PIXELS = 64; // 8x8
export const TOTAL_RGB_BYTES = 192; // 64 LEDs x 3 canais (R, G, B)
export const SERPENTINE_LAYOUT = false;

/**
 * Paleta inicial com cores primárias e secundárias vibrantes para matrizes de LED.
 */
export const DEFAULT_PALETTE: string[] = [
  '#FF0000', // Vermelho
  '#FF7F00', // Laranja
  '#FFFF00', // Amarelo
  '#00FF00', // Verde
  '#00FFFF', // Ciano
  '#0000FF', // Azul
  '#8B00FF', // Violeta / Roxo
  '#FF00FF', // Magenta
  '#FFFFFF', // Branco
  '#EF9F27', // Âmbar / Ouro (exemplo do PROJECT.md)
  '#2C2C2A', // Cinza escuro (exemplo do PROJECT.md)
  '#5C3A21', // Marrom
];

/**
 * Cria uma grade vazia com 64 posições nulas.
 */
export const createEmptyGrid = (): Grid => {
  return Array<null>(TOTAL_PIXELS).fill(null);
};
