/**
 * Tipo que representa a cor de um pixel.
 * String no formato "#RRGGBB" (ex: "#EF9F27") ou null para LED desligado/apagado.
 */
export type PixelColor = string | null;

/**
 * Grade contendo 64 pixels (8x8), indexados de 0 a 63 (linha por linha).
 */
export type Grid = PixelColor[];

/**
 * Uma tupla com os 3 canais de cor RGB [red, green, blue] com valores de 0 a 255.
 */
export type RGBTuple = [number, number, number];

/**
 * Formatos exportados pela aplicação
 */
export interface ExportPayload {
  hexArrayFormatted: string;
  rgbBytesFormatted: string;
  rawHexArray: (string | null)[];
  rawRgbBytes: number[];
}
