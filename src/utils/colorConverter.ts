import { Grid, PixelColor, RGBTuple, ExportPayload } from '../types';
import {
  TOTAL_PIXELS,
  TOTAL_RGB_BYTES,
  GRID_DIMENSION,
  SERPENTINE_LAYOUT,
} from '../constants/defaults';

/**
 * Converte uma cor em formato Hexadecimal ("#RRGGBB" ou "#RGB") para uma tupla RGB [r, g, b].
 * Se a cor for null ou inválida, retorna [0, 0, 0] (LED desligado).
 *
 * @param hex Cor em formato hexadecimal (#RRGGBB) ou null.
 * @returns [red, green, blue] com valores entre 0 e 255.
 */
export function hexToRgb(hex: PixelColor): RGBTuple {
  if (!hex) {
    return [0, 0, 0];
  }

  // Remove o '#' inicial se presente e remove espaços
  let cleanHex = hex.trim().replace(/^#/, '');

  // Trata formato curto #RGB -> #RRGGBB
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // Valida se possui exatamente 6 dígitos hexadecimais válidos
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return [0, 0, 0];
  }

  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return [r, g, b];
}

/**
 * Converte a grade de 64 pixels em um array plano de 192 bytes RGB para firmware.
 * Cada pixel gera 3 números inteiros consecutivos [R, G, B].
 *
 * @param grid Grade de 64 pixels.
 * @returns Array com exatamente 192 números inteiros (0-255).
 */
export function gridToRgbBytes(grid: Grid): number[] {
  const result: number[] = new Array(TOTAL_RGB_BYTES);

  for (let i = 0; i < TOTAL_PIXELS; i++) {
    const pixel = grid[i] ?? null;
    const [r, g, b] = hexToRgb(pixel);
    const offset = i * 3;
    result[offset] = r;
    result[offset + 1] = g;
    result[offset + 2] = b;
  }

  return result;
}

/**
 * Retorna os 64 índices de pixel na ordem física serpentina (zig-zag).
 * Linhas pares (0, 2, 4, 6) são invertidas (direita para esquerda),
 * enquanto linhas ímpares (1, 3, 5, 7) mantêm a ordem linear (esquerda para direita).
 *
 * @returns Array com 64 números representando os índices de origem para cada posição física.
 */
export function getSerpentinePixelOrder(): number[] {
  const order = new Array<number>(TOTAL_PIXELS);
  for (let row = 0; row < GRID_DIMENSION; row++) {
    const isEvenRow = row % 2 === 0;
    for (let col = 0; col < GRID_DIMENSION; col++) {
      const sourceCol = isEvenRow ? GRID_DIMENSION - 1 - col : col;
      const targetIndex = row * GRID_DIMENSION + col;
      const sourceIndex = row * GRID_DIMENSION + sourceCol;
      order[targetIndex] = sourceIndex;
    }
  }
  return order;
}

/**
 * Reordena os LEDs de linhas pares (0-indexed: 0, 2, 4, 6) de trás para frente,
 * simulando o roteamento físico serpentino comum em matrizes de LED WS2812 8x8.
 *
 * @param rgbBytes Array plano de 192 bytes RGB (8x8 x 3 canais).
 * @returns Novo array de 192 bytes RGB com o layout serpentino aplicado.
 */
export function remapForSerpentine(rgbBytes: number[]): number[] {
  const order = getSerpentinePixelOrder();
  const result = new Array<number>(TOTAL_RGB_BYTES);

  for (let targetIndex = 0; targetIndex < TOTAL_PIXELS; targetIndex++) {
    const sourceIndex = order[targetIndex];
    const targetOffset = targetIndex * 3;
    const sourceOffset = sourceIndex * 3;

    result[targetOffset] = rgbBytes[sourceOffset] ?? 0;
    result[targetOffset + 1] = rgbBytes[sourceOffset + 1] ?? 0;
    result[targetOffset + 2] = rgbBytes[sourceOffset + 2] ?? 0;
  }

  return result;
}

/**
 * Reordena o array Hex de 64 posições para layout físico serpentino.
 *
 * @param hexArray Array de 64 posições contendo strings hex ou null.
 * @returns Novo array de 64 posições reordenado na fiação serpentina.
 */
export function remapHexForSerpentine(hexArray: (string | null)[]): (string | null)[] {
  const order = getSerpentinePixelOrder();
  const result = new Array<string | null>(TOTAL_PIXELS);

  for (let targetIndex = 0; targetIndex < TOTAL_PIXELS; targetIndex++) {
    const sourceIndex = order[targetIndex];
    result[targetIndex] = hexArray[sourceIndex] ?? null;
  }

  return result;
}

/**
 * Converte a grade no formato de array Hex de 64 posições para salvar ou inspecionar.
 *
 * @param grid Grade de 64 pixels.
 * @returns Array com 64 posições contendo strings hex ou null.
 */
export function gridToHexArray(grid: Grid): (string | null)[] {
  const result: (string | null)[] = new Array(TOTAL_PIXELS);
  for (let i = 0; i < TOTAL_PIXELS; i++) {
    result[i] = grid[i] ?? null;
  }
  return result;
}

/**
 * Gera o payload de exportação formatado contendo os dois formatos do PROJECT.md.
 *
 * @param grid Grade atual de 64 pixels.
 * @param serpentineLayout Define se a conversão aplicará a fiação serpentina nos dois formatos.
 * @returns Payload estruturado com representações textuais prontas para cópia e arrays brutos.
 */
export function generateExportPayload(
  grid: Grid,
  serpentineLayout: boolean = SERPENTINE_LAYOUT
): ExportPayload {
  let rawHexArray = gridToHexArray(grid);
  let rawRgbBytes = gridToRgbBytes(grid);

  if (serpentineLayout) {
    rawHexArray = remapHexForSerpentine(rawHexArray);
    rawRgbBytes = remapForSerpentine(rawRgbBytes);
  }

  return {
    rawHexArray,
    rawRgbBytes,
    hexArrayFormatted: JSON.stringify(rawHexArray),
    rgbBytesFormatted: JSON.stringify(rawRgbBytes),
  };
}

