import React, { useState } from 'react';
import { PixelColor } from '../types';

interface PaletteProps {
  palette: string[];
  selectedColor: PixelColor;
  onSelectColor: (color: PixelColor) => void;
  onAddColor: (hex: string) => boolean;
  onRemoveColor: (hex: string) => void;
  onResetPalette: () => void;
}

export const Palette: React.FC<PaletteProps> = ({
  palette,
  selectedColor,
  onSelectColor,
  onAddColor,
  onRemoveColor,
  onResetPalette,
}) => {
  const [newColorHex, setNewColorHex] = useState('#00E5FF');
  const [isEditingPalette, setIsEditingPalette] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddColorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAddColor(newColorHex);
    if (!success) {
      setErrorMsg('Formato inválido. Use #RRGGBB');
      setTimeout(() => setErrorMsg(null), 3000);
    } else {
      setErrorMsg(null);
    }
  };

  return (
    <div className="p-4 md:p-5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col gap-4 w-full max-w-[360px] sm:max-w-[420px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Paleta Limitada</h2>
          <p className="text-xs text-slate-400">Cores disponíveis para o LED</p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditingPalette(!isEditingPalette)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all ${
            isEditingPalette
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          {isEditingPalette ? 'Concluir' : 'Gerenciar'}
        </button>
      </div>

      {/* Amostras da paleta */}
      <div className="grid grid-cols-6 gap-2">
        {/* Ferramenta Borracha / Desligar LED */}
        <button
          type="button"
          onClick={() => onSelectColor(null)}
          title="Borracha / LED Desligado"
          className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${
            selectedColor === null
              ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 border-cyan-400 bg-slate-800'
              : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
          }`}
        >
          <span className="text-sm">🧹</span>
          <span className="text-[9px] text-slate-400 font-mono mt-0.5">OFF</span>
        </button>

        {palette.map((color) => {
          const isSelected = selectedColor?.toUpperCase() === color.toUpperCase();

          return (
            <div key={color} className="relative group aspect-square">
              <button
                type="button"
                onClick={() => onSelectColor(color)}
                title={color}
                aria-label={`Cor ${color}`}
                className={`w-full h-full rounded-xl transition-all shadow-sm ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105'
                    : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow: isSelected ? `0 0 10px ${color}88` : undefined,
                }}
              />

              {/* Botão de remover cor no modo gerenciar */}
              {isEditingPalette && palette.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveColor(color)}
                  title={`Remover ${color}`}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow hover:bg-red-500"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Adicionar nova cor à paleta */}
      {isEditingPalette && (
        <form onSubmit={handleAddColorSubmit} className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer p-0.5"
              title="Seletor de cor"
            />
            <input
              type="text"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              placeholder="#RRGGBB"
              maxLength={7}
              className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
            >
              Adicionar
            </button>
          </div>

          <div className="flex items-center justify-between">
            {errorMsg && <span className="text-[11px] text-red-400 font-medium">{errorMsg}</span>}
            <button
              type="button"
              onClick={onResetPalette}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors ml-auto"
            >
              Restaurar padrão
            </button>
          </div>
        </form>
      )}

      {/* Indicador de cor ativa */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
        <span className="text-slate-400">Pincel ativo:</span>
        <div className="flex items-center gap-2 font-mono">
          <span
            className="w-3.5 h-3.5 rounded-full border border-white/20"
            style={{
              backgroundColor: selectedColor ?? '#000000',
              boxShadow: selectedColor ? `0 0 6px ${selectedColor}66` : undefined,
            }}
          />
          <span className="text-slate-200 font-medium">
            {selectedColor ?? 'Desligado (null)'}
          </span>
        </div>
      </div>
    </div>
  );
};
