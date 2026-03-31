'use client';

import { useRef, useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseCartera, parseComisiones } from '@/lib/parsers';
import { CartteraItem, ComisionItem } from '@/types';

interface ImportarProps {
  onImportCartera: (data: CartteraItem[]) => void;
  onImportComisiones: (data: ComisionItem[]) => void;
  onShowToast: (msg: string) => void;
}

export function Importar({ onImportCartera, onImportComisiones, onShowToast }: ImportarProps) {
  const carteraRef = useRef<HTMLInputElement>(null);
  const comisionesRef = useRef<HTMLInputElement>(null);

  const [carteraLoaded, setCarteraLoaded] = useState(false);
  const [comisionesLoaded, setComisionesLoaded] = useState(false);
  const [carteraFile, setCarteraFile] = useState('');
  const [comisionesFile, setComisionesFile] = useState('');

  const handleFileCartera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target?.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = parseCartera(ws);
          onImportCartera(data);
          setCarteraFile(file.name);
          setCarteraLoaded(true);
          onShowToast(`✓ Cartera importada: ${data.length} pólizas`);
        } catch (err) {
          onShowToast(`Error: ${err instanceof Error ? err.message : 'No se pudo leer el archivo'}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      onShowToast('Error al cargar el archivo');
    }
  };

  const handleFileComisiones = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target?.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = parseComisiones(ws);
          onImportComisiones(data);
          setComisionesFile(file.name);
          setComisionesLoaded(true);
          onShowToast(`✓ Comisiones importadas: ${data.length} registros`);
        } catch (err) {
          onShowToast(`Error: ${err instanceof Error ? err.message : 'No se pudo leer el archivo'}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      onShowToast('Error al cargar el archivo');
    }
  };

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light tracking-tight mb-1">Importar datos</h1>
        <p className="text-ink-2 text-sm">Subí los archivos exportados desde el portal de cada compañía</p>
      </div>

      <div className="bg-surface border border-stone-200 rounded-lg p-6 mb-8">
        <h3 className="text-sm font-medium mb-4">¿Cómo exportar desde Sancor?</h3>
        <div className="space-y-3 text-sm text-ink-2">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
            <p>Ingresá al portal PAS de Sancor → <strong className="text-ink">Portal del Productor</strong></p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
            <p>Para <strong className="text-ink">cartera vigente</strong>: Consultas → Cartera Vigente → Exportar Excel</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
            <p>Para <strong className="text-ink">comisiones</strong>: Liquidaciones → Detalle de Comisiones → Exportar XLS</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
            <p>Subí el archivo acá abajo. La app lo procesa automáticamente.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <ImportCard
          title="Cartera vigente"
          subtitle="cartera_vigente_al_DD_MM_AAAA.xlsx"
          loaded={carteraLoaded}
          filename={carteraFile}
          onClick={() => carteraRef.current?.click()}
          onClear={() => {
            setCarteraLoaded(false);
            setCarteraFile('');
            if (carteraRef.current) carteraRef.current.value = '';
          }}
        />
        <ImportCard
          title="Comisiones del mes"
          subtitle="Detalle_de_Comisiones_…_AAAA-MM.xls"
          loaded={comisionesLoaded}
          filename={comisionesFile}
          onClick={() => comisionesRef.current?.click()}
          onClear={() => {
            setComisionesLoaded(false);
            setComisionesFile('');
            if (comisionesRef.current) comisionesRef.current.value = '';
          }}
        />
        <input
          ref={carteraRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileCartera}
          className="hidden"
        />
        <input
          ref={comisionesRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileComisiones}
          className="hidden"
        />
      </div>

      <div className="bg-surface border border-stone-200 rounded-lg p-6">
        <h3 className="text-sm font-medium mb-4">Otras compañías</h3>
        <div className="space-y-3 text-sm text-ink-2">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">RUS</div>
            <p><strong className="text-ink">RUS Digital</strong> → Mis Liquidaciones → Detalle → Exportar</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-stone-400 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">SCC</div>
            <p><strong className="text-ink">San Cristóbal</strong> → Portal Productores → Comisiones → Exportar CSV/Excel</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-amber text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">VP</div>
            <p><strong className="text-ink">MAPFRE, Rivadavia, etc.</strong> → Exportar desde sus portales. El parser lo detecta automáticamente.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function ImportCard({
  title,
  subtitle,
  loaded,
  filename,
  onClick,
  onClear,
}: {
  title: string;
  subtitle: string;
  loaded: boolean;
  filename: string;
  onClick: () => void;
  onClear: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`border-2 rounded-lg p-8 text-center cursor-pointer transition ${
        loaded
          ? 'border-green bg-green-bg'
          : 'border-dashed border-stone-300 hover:border-stone-400 bg-surface hover:bg-bg'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg mx-auto mb-4 flex items-center justify-center ${loaded ? 'bg-green/15' : 'bg-surface-2'}`}>
        {loaded ? (
          <CheckCircle2 className="w-6 h-6 text-green" />
        ) : (
          <Upload className="w-6 h-6 text-ink-2" />
        )}
      </div>

      <h3 className="font-medium text-sm mb-1">{title}</h3>
      <p className={`text-xs ${loaded ? 'text-green' : 'text-ink-3'}`}>
        {loaded ? filename : subtitle}
      </p>

      {loaded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="mt-3 px-3 py-1 text-xs border border-green/30 text-green rounded hover:bg-green/5"
        >
          Borrar
        </button>
      )}
    </div>
  );
}
