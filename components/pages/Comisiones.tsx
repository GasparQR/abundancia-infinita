'use client';

import { useState, useMemo } from 'react';
import { ComisionItem } from '@/types';
import { fmt, fmtN } from '@/lib/utils';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RAMO_NAMES: Record<string, string> = {
  '200': 'Automotores',
  '600': 'Acc. Personales',
  '1800': 'Vida',
  '3100': 'Combinado',
  '1000': 'Incendio',
  '400': 'Transporte',
  '800': 'Robo',
  '1200': 'Resp. Civil',
  '1600': 'Caución',
  '2200': 'Integral Comercio',
};

function ramoLabel(code: string): string {
  return RAMO_NAMES[code] || code;
}

export function Comisiones({ data, onClear }: { data: ComisionItem[]; onClear: () => void }) {
  const [search, setSearch] = useState('');
  const [filterRamo, setFilterRamo] = useState('');
  const [filterProvincia, setFilterProvincia] = useState('');
  const [filterFormaPago, setFilterFormaPago] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const PER_PAGE = 15;

  const ramos = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.ramo).filter(Boolean))).sort();
  }, [data]);

  const provincias = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.provincia).filter(Boolean))).sort();
  }, [data]);

  const formasPago = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.formaPago).filter(Boolean))).sort();
  }, [data]);

  const totalComm = data.reduce((a, r) => a + r.comision, 0);
  const totalAdicCob = data.reduce((a, r) => a + r.adicCobranza, 0);
  const totalNeto = data.reduce((a, r) => a + r.total, 0);
  const totalPremio = data.reduce((a, r) => a + r.premio, 0);
  const uniqueClients = new Set(data.map((r) => r.cuitCuil || r.cliente)).size;

  const periodo = data[0]?.periodo || '';
  const periodoStr = periodo ? String(periodo).replace(/(\d{4})(\d{2})/, '$2/$1') : '';

  // Chart: Total (not just comision) by ramo
  const ramoChart = useMemo(() => {
    const rc: Record<string, number> = {};
    data.forEach((r) => {
      if (r.ramo) rc[r.ramo] = (rc[r.ramo] || 0) + r.total;
    });
    const rs = Object.entries(rc).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { labels: rs.map((r) => ramoLabel(r[0])), data: rs.map((r) => Math.round(r[1])) };
  }, [data]);

  // Chart: forma pago distribution
  const formaPagoChart = useMemo(() => {
    const fp: Record<string, number> = {};
    data.forEach((r) => {
      const key = r.formaPago || 'Sin dato';
      fp[key] = (fp[key] || 0) + 1;
    });
    return Object.entries(fp).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [data]);

  // Top clients by total (not comision)
  const topClientes = useMemo(() => {
    const cc: Record<string, { total: number; cuit: string }> = {};
    data.forEach((r) => {
      if (!r.cliente) return;
      if (!cc[r.cliente]) cc[r.cliente] = { total: 0, cuit: r.cuitCuil };
      cc[r.cliente].total += r.total;
    });
    return Object.entries(cc)
      .map(([name, v]) => ({ name, total: v.total, cuit: v.cuit }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (!(r.cliente + r.poliza + r.nroOficialPoliza + r.cuitCuil).toLowerCase().includes(q)) return false;
      }
      if (filterRamo && r.ramo !== filterRamo) return false;
      if (filterProvincia && r.provincia !== filterProvincia) return false;
      if (filterFormaPago && r.formaPago !== filterFormaPago) return false;
      return true;
    });
  }, [data, search, filterRamo, filterProvincia, filterFormaPago]);

  const paginatedData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  if (data.length === 0) {
    return (
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <p className="text-ink-3 text-lg mb-2">No hay comisiones importadas</p>
        <p className="text-ink-2 text-sm">Andá a <strong>Importar datos</strong> y subí el archivo</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="font-display text-4xl font-light tracking-tight mb-1">Comisiones</h1>
          <p className="text-ink-2 text-sm">{data.length} registros · {uniqueClients} clientes · período {periodoStr}</p>
        </div>
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
        >
          Borrar datos
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <Card label="Total neto" value={fmt(totalNeto)} sub={`período ${periodoStr}`} dark />
        <Card label="Comisión base" value={fmt(totalComm)} sub="sin adicionales" />
        <Card label="Adic. cobranza" value={fmt(totalAdicCob)} sub="adicional cobro" />
        <Card label="Premio total" value={fmt(totalPremio)} sub="cartera período" highlight />
        <Card label="Clientes" value={uniqueClients} sub={`${ramos.length} ramos`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Total by ramo */}
        <div className="bg-surface border border-stone-200 rounded-lg p-5">
          <h3 className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-4">Total neto por ramo</h3>
          <div style={{ height: '220px' }}>
            <Bar
              data={{
                labels: ramoChart.labels,
                datasets: [{ data: ramoChart.data, backgroundColor: '#1A1714', borderRadius: 4 }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#A09A93', font: { size: 10 } }, grid: { display: false } },
                  y: { ticks: { color: '#A09A93', font: { size: 10 } }, grid: { color: 'rgba(26,23,20,0.05)' } },
                },
              } as any}
            />
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-surface border border-stone-200 rounded-lg p-5">
          <h3 className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-4">Top clientes (total neto)</h3>
          <div className="space-y-3">
            {topClientes.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-ink-2 truncate mr-2">{c.name}</span>
                  <span className="text-xs font-mono text-ink-2 flex-shrink-0">{fmt(c.total)}</span>
                </div>
                <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-green" style={{ width: `${(c.total / topClientes[0].total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forma pago */}
        <div className="bg-surface border border-stone-200 rounded-lg p-5">
          <h3 className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-4">Forma de pago</h3>
          <div className="space-y-3">
            {formaPagoChart.map(([name, count]) => (
              <div key={name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-ink-2 truncate mr-2">{name || 'Sin dato'}</span>
                  <span className="text-xs font-mono text-ink-2 flex-shrink-0">{count} ({Math.round((count / data.length) * 100)}%)</span>
                </div>
                <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-blue" style={{ width: `${(count / formaPagoChart[0][1]) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <input
            type="text"
            placeholder="Buscar cliente, CUIT, póliza..."
            className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-ink"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-4 py-2 border border-stone-200 rounded-lg text-sm cursor-pointer"
          value={filterRamo}
          onChange={(e) => { setFilterRamo(e.target.value); setPage(1); }}
        >
          <option value="">Todos los ramos</option>
          {ramos.map((r) => (
            <option key={r} value={r}>{ramoLabel(r)} ({r})</option>
          ))}
        </select>
        <select
          className="px-4 py-2 border border-stone-200 rounded-lg text-sm cursor-pointer"
          value={filterProvincia}
          onChange={(e) => { setFilterProvincia(e.target.value); setPage(1); }}
        >
          <option value="">Todas las provincias</option>
          {provincias.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          className="px-4 py-2 border border-stone-200 rounded-lg text-sm cursor-pointer"
          value={filterFormaPago}
          onChange={(e) => { setFilterFormaPago(e.target.value); setPage(1); }}
        >
          <option value="">Todas las formas pago</option>
          {formasPago.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface border border-stone-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-2 border-b border-stone-200">
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Ramo</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Póliza</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Fecha op.</th>
                <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-widest text-ink-3">Comisión</th>
                <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-widest text-ink-3">Adic. cob.</th>
                <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-widest text-ink-3 font-bold">Total</th>
                <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-widest text-ink-3">Premio</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">%</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3">Pago</th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-ink-3 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((r) => (
                <>
                  <tr key={r.id} className="border-b border-stone-100 hover:bg-bg transition cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                    <td className="px-4 py-3 font-medium text-sm">{r.cliente}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-surface-2 text-ink-2 px-2 py-1 rounded">{ramoLabel(r.ramo)}</span></td>
                    <td className="px-4 py-3 text-xs font-mono text-ink-2">{r.poliza}</td>
                    <td className="px-4 py-3 text-xs font-mono text-ink-2">{r.foper}</td>
                    <td className="px-4 py-3 text-xs font-mono text-right" style={{ color: r.comision < 0 ? '#C84B2F' : '#6B6560' }}>
                      ${fmtN(r.comision)}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-right text-ink-3">
                      ${fmtN(r.adicCobranza)}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-bold text-right" style={{ color: r.total < 0 ? '#C84B2F' : '#2A6B4A' }}>
                      ${fmtN(r.total)}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-right text-ink-2">${fmtN(r.premio)}</td>
                    <td className="px-4 py-3 text-xs text-ink-3">{r.porcComision}%</td>
                    <td className="px-4 py-3 text-xs text-ink-3 max-w-24 truncate">{r.formaPago}</td>
                    <td className="px-4 py-3 text-xs text-ink-3">
                      <span className={`transition-transform inline-block ${expanded === r.id ? 'rotate-90' : ''}`}>›</span>
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr key={`${r.id}-detail`} className="bg-bg border-b border-stone-100">
                      <td colSpan={11} className="px-6 py-4">
                        <div className="grid grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="font-mono text-ink-3 uppercase tracking-widest block mb-1">CUIT/CUIL</span>
                            <span className="text-ink font-mono">{r.cuitCuil || '—'}</span>
                          </div>
                          <div>
                            <span className="font-mono text-ink-3 uppercase tracking-widest block mb-1">Nro. Oficial Póliza</span>
                            <span className="text-ink font-mono">{r.nroOficialPoliza || '—'}</span>
                          </div>
                          <div>
                            <span className="font-mono text-ink-3 uppercase tracking-widest block mb-1">Certificado</span>
                            <span className="text-ink font-mono">{r.certificado || '—'}</span>
                          </div>
                          <div>
                            <span className="font-mono text-ink-3 uppercase tracking-widest block mb-1">Endoso</span>
                            <span className="text-ink font-mono">{r.endoso || '—'}</span>
                          </div>
                          <div>
                            <span className="font-mono text-ink-3 uppercase tracking-widest block mb-1">Provincia</span>
                            <span className="text-ink">{r.provincia || '—'}</span>
                          </div>
                          <div>
                            <span className="font-mono text-ink-3 uppercase tracking-widest block mb-1">Producto</span>
                            <span className="text-ink font-mono">{r.producto || '—'}</span>
                          </div>
                          <div>
                            <span className="font-mono text-ink-3 uppercase tracking-widest block mb-1">Cuota</span>
                            <span className="text-ink font-mono">{r.cuota || '—'}</span>
                          </div>
                          <div>
                            <span className="font-mono text-ink-3 uppercase tracking-widest block mb-1">Premio Cap.</span>
                            <span className="text-ink font-mono">${fmtN(r.premioCap)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-ink-3">
            <p className="text-sm">No hay comisiones que coincidan</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-stone-200 p-4 flex items-center justify-between text-sm text-ink-3">
            <span>{filtered.length} resultados · Total filtrado: <strong className="text-green">${fmtN(filtered.reduce((a, r) => a + r.total, 0))}</strong></span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 border border-stone-200 rounded hover:bg-surface-2 disabled:opacity-50">←</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded ${page === p ? 'bg-ink text-white' : 'border border-stone-200 hover:bg-surface-2'}`}>{p}</button>
              ))}
              {totalPages > 5 && <span>...</span>}
              {totalPages > 5 && (
                <button onClick={() => setPage(totalPages)} className={`px-3 py-1 rounded ${page === totalPages ? 'bg-ink text-white' : 'border border-stone-200 hover:bg-surface-2'}`}>{totalPages}</button>
              )}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 border border-stone-200 rounded hover:bg-surface-2 disabled:opacity-50">→</button>
            </div>
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
