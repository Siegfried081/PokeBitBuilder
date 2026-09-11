import React from 'react';

interface ControlsProps {
  onClear: () => void;
  onOpenExport?: () => void;
  activePixelsCount: number;
}

export const Controls: React.FC<ControlsProps> = ({
  onClear,
  onOpenExport,
  activePixelsCount,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-[360px] sm:max-w-[420px] p-3 bg-slate-900/60 rounded-xl border border-slate-800">
      <div className="text-xs text-slate-300 font-mono">
        <span className="font-semibold text-white">{activePixelsCount}</span>/64 LEDs ligados
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          disabled={activePixelsCount === 0}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-red-500/20 hover:border-red-500/40 border border-slate-700/80 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          Limpar tudo
        </button>

        {onOpenExport && (
          <button
            type="button"
            onClick={onOpenExport}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-lg shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            Exportar
          </button>
        )}
      </div>
    </div>
  );
};
