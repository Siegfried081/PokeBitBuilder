import React, { useState, useMemo } from 'react';
import { Grid } from '../types';
import { generateExportPayload } from '../utils/colorConverter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  grid: Grid;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, grid }) => {
  const [copiedFormat, setCopiedFormat] = useState<'hex' | 'rgb' | null>(null);
  const [activeTab, setActiveTab] = useState<'rgb' | 'hex'>('rgb');
  const [isSerpentine, setIsSerpentine] = useState<boolean>(false);

  const payload = useMemo(() => {
    return generateExportPayload(grid, isSerpentine);
  }, [grid, isSerpentine]);

  if (!isOpen) return null;

  const handleCopy = (text: string, format: 'hex' | 'rgb') => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => {
      setCopiedFormat(null);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Exportar Sprite 8x8
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                64 Pixels
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Formatos prontos para o firmware do chaveiro de LED e salvamento
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Toggle Serpentina (Zig-Zag) */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
          <label htmlFor="serpentine-toggle" className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="serpentine-toggle"
              checked={isSerpentine}
              onChange={(e) => setIsSerpentine(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900 cursor-pointer"
            />
            <div>
              <span className="text-xs font-semibold text-white block">
                Meu painel é serpentina (zig-zag)?
              </span>
              <span className="text-[11px] text-slate-400 block">
                Ative se as linhas pares (0, 2, 4, 6) da matriz física forem fiadas da direita para a esquerda.
              </span>
            </div>
          </label>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('rgb')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'rgb'
                ? 'border-amber-400 text-amber-400 bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>RGB Bytes (Firmware)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-300">
              192 bytes
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hex')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'hex'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/90'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Hex Array (App/Debug)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-300">
              64 itens
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'rgb' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Array de 192 bytes (FastLED / Adafruit NeoPixel / C++):
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(payload.rgbBytesFormatted, 'rgb')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedFormat === 'rgb' ? (
                    <>
                      <span>✓</span> Copiado!
                    </>
                  ) : (
                    <>
                      <span>📋</span> Copiar RGB Bytes
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-amber-300/90 overflow-x-auto max-h-56 leading-relaxed select-all">
                {payload.rgbBytesFormatted}
              </pre>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Array de 64 posições com strings #RRGGBB ou null:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(payload.hexArrayFormatted, 'hex')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedFormat === 'hex' ? (
                    <>
                      <span>✓</span> Copiado!
                    </>
                  ) : (
                    <>
                      <span>📋</span> Copiar Hex Array
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-cyan-300/90 overflow-x-auto max-h-56 leading-relaxed select-all">
                {payload.hexArrayFormatted}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
