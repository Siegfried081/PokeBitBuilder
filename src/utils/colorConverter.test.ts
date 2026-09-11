import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  gridToRgbBytes,
  getSerpentinePixelOrder,
  remapForSerpentine,
  remapHexForSerpentine,
  gridToHexArray,
  generateExportPayload,
} from './colorConverter';
import { TOTAL_PIXELS, TOTAL_RGB_BYTES, createEmptyGrid } from '../constants/defaults';
import { Grid } from '../types';

describe('colorConverter', () => {
  describe('hexToRgb', () => {
    it('deve converter null para [0, 0, 0] (LED desligado)', () => {
      expect(hexToRgb(null)).toEqual([0, 0, 0]);
    });

    it('deve converter cores válidas no formato 6 dígitos hex', () => {
      // Exemplo do PROJECT.md: #EF9F27 -> [239, 159, 39]
      expect(hexToRgb('#EF9F27')).toEqual([239, 159, 39]);
      // Exemplo do PROJECT.md: #2C2C2A -> [44, 44, 42]
      expect(hexToRgb('#2C2C2A')).toEqual([44, 44, 42]);
      expect(hexToRgb('#FF0000')).toEqual([255, 0, 0]);
      expect(hexToRgb('#00FF00')).toEqual([0, 255, 0]);
      expect(hexToRgb('#0000FF')).toEqual([0, 0, 255]);
      expect(hexToRgb('#FFFFFF')).toEqual([255, 255, 255]);
      expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    });

    it('deve aceitar hex em letras minúsculas e sem cerquilha', () => {
      expect(hexToRgb('#ef9f27')).toEqual([239, 159, 39]);
      expect(hexToRgb('ef9f27')).toEqual([239, 159, 39]);
    });

    it('deve converter formato curto #RGB de 3 caracteres', () => {
      expect(hexToRgb('#FFF')).toEqual([255, 255, 255]);
      expect(hexToRgb('#F00')).toEqual([255, 0, 0]);
    });

    it('deve retornar [0, 0, 0] para strings inválidas', () => {
      expect(hexToRgb('')).toEqual([0, 0, 0]);
      expect(hexToRgb('invalid')).toEqual([0, 0, 0]);
      expect(hexToRgb('#ZZZZZZ')).toEqual([0, 0, 0]);
      expect(hexToRgb('#12345')).toEqual([0, 0, 0]);
    });
  });

  describe('gridToRgbBytes', () => {
    it('deve gerar 192 zeros para uma grade 8x8 totalmente vazia', () => {
      const emptyGrid = createEmptyGrid();
      const bytes = gridToRgbBytes(emptyGrid);

      expect(bytes).toHaveLength(TOTAL_RGB_BYTES);
      expect(bytes.every((byte) => byte === 0)).toBe(true);
    });

    it('deve converter corretamente posições preenchidas e nulas na sequência exata', () => {
      const grid: Grid = createEmptyGrid();
      grid[0] = '#EF9F27'; // pixel 0 -> [239, 159, 39]
      grid[1] = null;      // pixel 1 -> [0, 0, 0]
      grid[2] = '#2C2C2A'; // pixel 2 -> [44, 44, 42]

      const bytes = gridToRgbBytes(grid);

      expect(bytes).toHaveLength(TOTAL_RGB_BYTES);
      // Primeiros 9 bytes correspondentes aos pixels 0, 1 e 2
      expect(bytes.slice(0, 9)).toEqual([239, 159, 39, 0, 0, 0, 44, 44, 42]);
      // O resto até o final deve ser zero
      expect(bytes.slice(9).every((b) => b === 0)).toBe(true);
    });

    it('deve posicionar os bytes do pixel de índice 32 nos offsets 96, 97 e 98', () => {
      const grid: Grid = createEmptyGrid();
      // Pixel 32 (linha 4, coluna 0) com a cor #EF9F27 -> RGB [239, 159, 39]
      grid[32] = '#EF9F27';

      const bytes = gridToRgbBytes(grid);

      expect(bytes).toHaveLength(TOTAL_RGB_BYTES);

      // Bytes 0 a 95 (pixels 0 a 31) devem ser todos 0 (desligados)
      expect(bytes.slice(0, 96).every((b) => b === 0)).toBe(true);

      // Bytes 96, 97 e 98 correspondem exatamente ao pixel 32 (32 * 3 = 96)
      expect(bytes[96]).toBe(239);
      expect(bytes[97]).toBe(159);
      expect(bytes[98]).toBe(39);
      expect(bytes.slice(96, 99)).toEqual([239, 159, 39]);

      // Bytes 99 em diante (pixels 33 a 63) devem ser todos 0 (desligados)
      expect(bytes.slice(99).every((b) => b === 0)).toBe(true);
    });
  });

  describe('getSerpentinePixelOrder', () => {
    it('deve retornar 64 índices na ordem correta para layout serpentino', () => {
      const order = getSerpentinePixelOrder();
      expect(order).toHaveLength(TOTAL_PIXELS);

      // Linha 0 (par, 0-indexed): invertida [7, 6, 5, 4, 3, 2, 1, 0]
      expect(order.slice(0, 8)).toEqual([7, 6, 5, 4, 3, 2, 1, 0]);

      // Linha 1 (ímpar): linear [8, 9, 10, 11, 12, 13, 14, 15]
      expect(order.slice(8, 16)).toEqual([8, 9, 10, 11, 12, 13, 14, 15]);

      // Linha 6 (par): invertida [55, 54, 53, 52, 51, 50, 49, 48]
      expect(order.slice(48, 56)).toEqual([55, 54, 53, 52, 51, 50, 49, 48]);

      // Linha 7 (ímpar): linear [56, 57, 58, 59, 60, 61, 62, 63]
      expect(order.slice(56, 64)).toEqual([56, 57, 58, 59, 60, 61, 62, 63]);
    });
  });

  describe('remapForSerpentine', () => {
    it('deve inverter os pixels de linhas pares (0, 2, 4, 6) e manter linhas ímpares (1, 3, 5, 7)', () => {
      const grid = createEmptyGrid();
      // Linha 0 (par): pixel 0 (col 0) = Vermelho (#FF0000 -> [255, 0, 0])
      grid[0] = '#FF0000';
      // Linha 0 (par): pixel 7 (col 7) = Verde (#00FF00 -> [0, 255, 0])
      grid[7] = '#00FF00';
      // Linha 1 (ímpar): pixel 8 (col 0) = Azul (#0000FF -> [0, 0, 255])
      grid[8] = '#0000FF';
      // Linha 1 (ímpar): pixel 15 (col 7) = Branco (#FFFFFF -> [255, 255, 255])
      grid[15] = '#FFFFFF';

      const linearBytes = gridToRgbBytes(grid);
      const serpentineBytes = remapForSerpentine(linearBytes);

      expect(serpentineBytes).toHaveLength(TOTAL_RGB_BYTES);

      // Na linha 0 (invertida):
      // O LED na posição 0 deve agora receber o que era o pixel 7 (Verde: [0, 255, 0])
      expect(serpentineBytes.slice(0, 3)).toEqual([0, 255, 0]);
      // O LED na posição 7 (offset 21) deve agora receber o que era o pixel 0 (Vermelho: [255, 0, 0])
      expect(serpentineBytes.slice(21, 24)).toEqual([255, 0, 0]);

      // Na linha 1 (não invertida, ordem normal):
      // O LED na posição 8 (offset 24) deve continuar sendo Azul: [0, 0, 255]
      expect(serpentineBytes.slice(24, 27)).toEqual([0, 0, 255]);
      // O LED na posição 15 (offset 45) deve continuar sendo Branco: [255, 255, 255]
      expect(serpentineBytes.slice(45, 48)).toEqual([255, 255, 255]);
    });
  });

  describe('remapHexForSerpentine', () => {
    it('deve inverter os pixels na linha 0 (par) e manter na linha 7 (ímpar)', () => {
      const hexArray = new Array<string | null>(TOTAL_PIXELS).fill(null);

      // Linha 0 (par, invertida)
      hexArray[0] = '#FF0000'; // col 0
      hexArray[7] = '#00FF00'; // col 7

      // Linha 7 (ímpar, mantida normal)
      hexArray[56] = '#112233'; // col 0 (linha 7)
      hexArray[63] = '#445566'; // col 7 (linha 7)

      const remapped = remapHexForSerpentine(hexArray);

      expect(remapped).toHaveLength(TOTAL_PIXELS);

      // Na linha 0: posição física 0 recebe índice 7, posição física 7 recebe índice 0
      expect(remapped[0]).toBe('#00FF00');
      expect(remapped[7]).toBe('#FF0000');
      expect(remapped[1]).toBeNull();

      // Na linha 7: ordem preservada
      expect(remapped[56]).toBe('#112233');
      expect(remapped[63]).toBe('#445566');
      expect(remapped[57]).toBeNull();
    });
  });

  describe('gridToHexArray', () => {
    it('deve retornar uma cópia com 64 posições', () => {
      const grid = createEmptyGrid();
      grid[0] = '#FF0000';
      grid[63] = '#00FF00';

      const hexArray = gridToHexArray(grid);
      expect(hexArray).toHaveLength(TOTAL_PIXELS);
      expect(hexArray[0]).toBe('#FF0000');
      expect(hexArray[63]).toBe('#00FF00');
      expect(hexArray[1]).toBeNull();
    });
  });

  describe('generateExportPayload', () => {
    it('deve gerar payload padrão com layout linear (serpentineLayout = false)', () => {
      const grid = createEmptyGrid();
      grid[0] = '#EF9F27'; // pixel 0 -> [239, 159, 39]

      const payload = generateExportPayload(grid, false);

      expect(payload.rawHexArray).toHaveLength(64);
      expect(payload.rawRgbBytes).toHaveLength(192);
      expect(payload.rawHexArray[0]).toBe('#EF9F27');
      expect(payload.rawHexArray[7]).toBeNull();
      expect(payload.rawRgbBytes.slice(0, 3)).toEqual([239, 159, 39]);
      expect(JSON.parse(payload.hexArrayFormatted)).toEqual(payload.rawHexArray);
      expect(JSON.parse(payload.rgbBytesFormatted)).toEqual(payload.rawRgbBytes);
    });

    it('deve gerar payload remapeado nos dois formatos quando serpentineLayout = true', () => {
      const grid = createEmptyGrid();
      grid[0] = '#EF9F27'; // pixel 0 (col 0, linha 0)

      const payload = generateExportPayload(grid, true);

      expect(payload.rawHexArray).toHaveLength(64);
      expect(payload.rawRgbBytes).toHaveLength(192);

      // Como a linha 0 é invertida no modo serpentino:
      // O pixel da col 0 vai para o final da linha 0 (col 7)
      expect(payload.rawRgbBytes.slice(0, 3)).toEqual([0, 0, 0]);
      expect(payload.rawRgbBytes.slice(21, 24)).toEqual([239, 159, 39]);

      // Hex array também remapeado para serpentina:
      expect(payload.rawHexArray[0]).toBeNull();
      expect(payload.rawHexArray[7]).toBe('#EF9F27');

      // Strings JSON formatadas devem refletir os arrays remapeados
      expect(JSON.parse(payload.hexArrayFormatted)).toEqual(payload.rawHexArray);
      expect(JSON.parse(payload.rgbBytesFormatted)).toEqual(payload.rawRgbBytes);
    });
  });
});
