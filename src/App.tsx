import { useState } from 'react';
import { Header } from './components/Header';
import { Grid } from './components/Grid';
import { Palette } from './components/Palette';
import { Controls } from './components/Controls';
import { ExportModal } from './components/ExportModal';
import { useSprite } from './hooks/useSprite';
import { usePalette } from './hooks/usePalette';

export default function App() {
  const { grid, paintPixel, clearGrid, activePixelsCount } = useSprite();
  const {
    palette,
    selectedColor,
    setSelectedColor,
    addColor,
    removeColor,
    resetPalette,
  } = usePalette();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start justify-items-center">
          {/* Coluna da Esquerda: Grade 8x8 de LEDs e Ações */}
          <div className="flex flex-col items-center gap-4 w-full">
            <Grid
              grid={grid}
              currentColor={selectedColor}
              onPaintPixel={paintPixel}
            />

            <Controls
              onClear={clearGrid}
              onOpenExport={() => setIsExportModalOpen(true)}
              activePixelsCount={activePixelsCount}
            />
          </div>

          {/* Coluna da Direita: Paleta de Cores e Instruções */}
          <div className="flex flex-col items-center gap-4 w-full">
            <Palette
              palette={palette}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              onAddColor={addColor}
              onRemoveColor={removeColor}
              onResetPalette={resetPalette}
            />

            {/* Cartão de Dicas Rápidas */}
            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/80 w-full max-w-[360px] sm:max-w-[420px] text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span>💡</span> Dicas de Desenho
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Clique ou arraste o mouse para pintar vários LEDs rapidamente.</li>
                <li>Use o ícone de vassoura <strong>OFF</strong> para apagar LEDs.</li>
                <li>Clique em <strong>Gerenciar</strong> para cadastrar novas cores hex.</li>
                <li>Ao terminar, clique em <strong>Exportar</strong> para copiar os bytes RGB.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Exportação */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        grid={grid}
      />
    </div>
  );
}
