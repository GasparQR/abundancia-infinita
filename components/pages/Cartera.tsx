'use client';

import { useState, useMemo } from 'react';
import { CartteraItem } from '@/types';
import { fmt, fmtN } from '@/lib/utils';

export function Cartera({ data, onClear }: { data: CartteraItem[]; onClear: () => void }) {
  const [search, setSearch] = useState('');
  const [filterSeccion, setFilterSeccion] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const secciones = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.seccion))).filter(Boolean).sort();
  }, [data]);

  const totalPremio = data.reduce((a, r) => a + r.premio, 0);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search && !(r.tomador + r.poliza + r.ramo).toLowerCase().includes(search.toLowerCase())) return false;
      if (filterSeccion && r.seccion !== filterSeccion) return false;
      return true;
    });
  }, [data, search, filterSeccion]);

  const paginatedData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  if (data.length === 0) {
    return (
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <p className="text-ink-3 text-lg mb-2">No hay cartera importada aún</p>
        <p className="text-ink-2 text-sm">Andá a <strong>Importar datos</strong> y subí el archivo</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="font-display text-4xl font-light tracking-tight mb-1">Cartera vigente</h1>
          <p className="text-ink-2 text-sm">{data.length} pólizas · {secciones.length} secciones</p>
        </div>
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
        >
          Borrar datos
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card label="Pólizas vigentes" value={data.length} sub="al corte" dark />
        <Card label="Premio total" value={fmt(totalPremio)} sub="suma cartera" />
        <Card label="Secciones" value={secciones.length} sub={secciones.slice(0, 2).join(', ')} />
        <Card label="PAS Sancor" value="12635" sub="código productor" highlight />
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <input
            type="text"
            placeholder="Buscar tomador, póliza..."
            className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-ink"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-4 py-2 border border-stone-200 rounded-lg text-sm cursor-pointer"
          value={filterSeccion}
          onChange={(e) => { setFilterSeccion(e.target.value); setPage(1); }}
        >
          <option value="">Todas las secciones</option>
          {secciones.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-2 border-b border-stone-200">
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Tomador</th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Sección / Ramo</th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Póliza</th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Tipo fact.</th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Fecha vig.</th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Premio</th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Forma cobro</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((r) => (
              <tr key={r.id} className="border-b border-stone-100 hover:bg-bg transition">
                <td className="px-4 py-3 font-medium text-sm">{r.tomador}</td>
                <td className="px-4 py-3 text-sm"><span className="text-xs bg-surface-2 text-ink-2 px-2 py-1 rounded">{r.seccion}</span> <span className="text-ink-3 text-xs">{r.ramo}</span></td>
                <td className="px-4 py-3 text-xs font-mono text-ink-2">{r.poliza}</td>
                <td className="px-4 py-3 text-xs text-ink-3">{r.tipo || '—'}</td>
                <td className="px-4 py-3 text-xs font-mono text-ink-2">{r.fechaVig || '—'}</td>
                <td className="px-4 py-3 text-xs font-mono text-green font-medium">{r.premio ? '$' + fmtN(r.premio) : '—'}</td>
                <td className="px-4 py-3 text-xs text-ink-2">{r.formaCobro || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-ink-3">
            <p className="text-sm">No hay pólizas que coincidan</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-stone-200 p-4 flex items-center justify-end gap-2 text-sm text-ink-3">
            <span>{filtered.length} resultados</span>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 border border-stone-200 rounded hover:bg-surface-2 disabled:opacity-50">←</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded ${page === p ? 'bg-ink text-white' : 'border border-stone-200 hover:bg-surface-2'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 border border-stone-200 rounded hover:bg-surface-2 disabled:opacity-50">→</button>
          </div>
        )}
      </div>
    </main>
  );
}

function Card({ label, value, sub, dark = false, highlight = false }: any) {
  return (
    <div className={`rounded-lg p-4 border ${dark ? 'bg-ink border-ink' : highlight ? 'bg-green-bg border-green/20' : 'bg-surface border-stone-200'}`}>
      <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${dark ? 'text-white/35' : highlight ? 'text-green' : 'text-ink-3'}`}>{label}</div>
      <div className={`font-display text-2xl font-light ${dark ? 'text-white' : highlight ? 'text-green' : ''}`}>{value}</div>
      <div className={`text-xs mt-1 ${dark ? 'text-white/35' : 'text-ink-3'}`}>{sub}</div>
    </div>
  );
}
