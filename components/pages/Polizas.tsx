'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Poliza } from '@/types';
import { daysDiff } from '@/lib/utils';

export function Polizas({ policies }: { policies: Poliza[] }) {
  const [search, setSearch] = useState('');
  const [filterCompania, setFilterCompania] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const companies = useMemo(() => {
    return Array.from(new Set(policies.map((p) => p.compania))).sort();
  }, [policies]);

  const filtered = useMemo(() => {
    return policies.filter((p) => {
      if (search && !(p.cliente + p.detalle + p.bien).toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCompania && p.compania !== filterCompania) return false;
      if (filterEstado === 'activa' && (p.estado === 'Anulada' || (p.vence && daysDiff(p.vence) < 0))) return false;
      if (filterEstado === 'vencida' && (!p.vence || daysDiff(p.vence) >= 0)) return false;
      if (filterEstado === 'anulada' && p.estado !== 'Anulada') return false;
      return true;
    });
  }, [policies, search, filterCompania, filterEstado]);

  const paginatedData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="mb-6">
        <h1 className="font-display text-4xl font-light tracking-tight mb-1">Pólizas</h1>
        <p className="text-ink-2 text-sm">{filtered.length} pólizas de {policies.length} totales</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar cliente, vehículo..."
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-ink"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-4 py-2 border border-stone-200 rounded-lg text-sm cursor-pointer"
          value={filterCompania}
          onChange={(e) => { setFilterCompania(e.target.value); setPage(1); }}
        >
          <option value="">Todas las compañías</option>
          {companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="px-4 py-2 border border-stone-200 rounded-lg text-sm cursor-pointer"
          value={filterEstado}
          onChange={(e) => { setFilterEstado(e.target.value); setPage(1); }}
        >
          <option value="">Todos los estados</option>
          <option value="activa">Activas</option>
          <option value="vencida">Vencidas</option>
          <option value="anulada">Anuladas</option>
        </select>
      </div>

      <div className="bg-surface border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-2 border-b border-stone-200">
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Detalle</th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Compañía</th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Bien</th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Vencimiento</th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((p) => (
              <tr key={p.id} className="border-b border-stone-100 hover:bg-bg transition">
                <td className="px-4 py-3 font-medium text-sm">{p.cliente}</td>
                <td className="px-4 py-3 text-sm text-ink-2">{p.detalle || '—'}</td>
                <td className="px-4 py-3"><span className="text-xs bg-surface-2 text-ink-2 px-2 py-1 rounded">{p.compania}</span></td>
                <td className="px-4 py-3 text-sm text-ink-2">{p.bien}</td>
                <td className="px-4 py-3 text-xs font-mono text-ink-2">{p.vence || '—'}</td>
                <td className="px-4 py-3">{EstadoBadge(p)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-ink-3">
            <p className="text-sm">No hay pólizas que coincidan con los filtros</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-stone-200 p-4 flex items-center justify-end gap-2 text-sm text-ink-3">
            <span>{filtered.length} resultados</span>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 border border-stone-200 rounded hover:bg-surface-2 disabled:opacity-50">←</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1;
              if (totalPages > 7 && p > 2 && p < totalPages - 1 && Math.abs(p - page) > 1) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded ${page === p ? 'bg-ink text-white' : 'border border-stone-200 hover:bg-surface-2'}`}
                >
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 border border-stone-200 rounded hover:bg-surface-2 disabled:opacity-50">→</button>
          </div>
        )}
      </div>
    </main>
  );
}

function EstadoBadge(p: Poliza) {
  if (p.estado === 'Anulada') return <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">Anulada</span>;
  if (!p.vence) return <span className="text-xs bg-green-bg text-green px-2 py-1 rounded">Activa</span>;
  const d = daysDiff(p.vence);
  if (d < 0) return <span className="text-xs bg-red-bg text-accent px-2 py-1 rounded">Vencida</span>;
  if (d <= 30) return <span className="text-xs bg-amber-bg text-amber px-2 py-1 rounded">{d}d</span>;
  return <span className="text-xs bg-green-bg text-green px-2 py-1 rounded">Activa</span>;
}
