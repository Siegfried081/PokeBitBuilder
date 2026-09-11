import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-cyan-400 p-[2px] shadow-lg shadow-orange-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center font-black text-xs text-amber-400">
              8×8
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              PokeBitBuilder
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                LED Editor
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Editor de pixel art para chaveiro de LED WS2812/SK6812
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Firmware Ready
          </span>
        </div>
      </div>
    </header>
  );
};
