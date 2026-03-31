'use client';

import { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Poliza } from '@/types';
import { daysDiff } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export function Dashboard({ policies }: { policies: Poliza[] }) {
  const metrics = useMemo(() => {
    const activas = policies.filter(
      (p) => p.estado !== 'Anulada' && (!p.vence || daysDiff(p.vence) >= 0)
    ).length;

    const prox90 = policies.filter((p) => {
      if (!p.vence || p.estado === 'Anulada') return false;
      const d = daysDiff(p.vence);
      return d >= 0 && d <= 90;
    }).length;

    const vencidas = policies.filter((p) => {
      if (!p.vence) return false;
      return daysDiff(p.vence) < 0;
    }).length;

    return { total: policies.length, activas, prox90, vencidas };
  }, [policies]);

  const chartData = useMemo(() => {
    const companies: { [key: string]: number } = {};
    policies.forEach((p) => {
      companies[p.compania] = (companies[p.compania] || 0) + 1;
    });
    const sorted = Object.entries(companies).sort((a, b) => b[1] - a[1]).slice(0, 7);
    return { labels: sorted.map((s) => s[0]), data: sorted.map((s) => s[1]) };
  }, [policies]);

  const yearData = {
    labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026*'],
    values: [392929, 1213924, 1141632, 1764695, 3859251, 8372640, 24620184, 35027247, 12265804],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#6B6560', font: { size: 11 } } },
    },
    scales: {
      x: { ticks: { color: '#A09A93', font: { size: 10 } }, grid: { display: false } },
      y: { ticks: { color: '#A09A93', font: { size: 10 } }, grid: { color: 'rgba(26,23,20,0.05)' } },
    },
  };

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light tracking-tight mb-1">Dashboard</h1>
        <p className="text-ink-2 text-sm">Resumen general de la cartera · datos al 2026</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card label="Pólizas" value={metrics.total} sub={`${metrics.activas} activas`} dark />
        <Card label="Activas" value={metrics.activas} sub="en cartera" />
        <Card label="Próximas 90d" value={metrics.prox90} sub="vencimientos" highlight />
        <Card label="Vencidas" value={metrics.vencidas} sub="atención" />
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="col-span-3 bg-surface border border-stone-200 rounded-lg p-5">
          <h3 className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-4">Facturación anual</h3>
          <div style={{ height: '240px' }}>
            <Bar
              data={{
                labels: yearData.labels,
                datasets: [{
                  data: yearData.values.map((v) => v / 1e6),
                  backgroundColor: yearData.labels.map((_, i) => i === 7 ? '#1A1714' : i === 8 ? '#A09A93' : '#C8B9A0'),
                  borderRadius: 4,
                }],
              }}
              options={chartOptions as any}
            />
          </div>
        </div>

        <div className="col-span-2 bg-surface border border-stone-200 rounded-lg p-5">
          <h3 className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-4">Top aseguradoras</h3>
          <div className="space-y-3">
            {chartData.labels.slice(0, 5).map((label, idx) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-ink-2">{label}</span>
                  <span className="text-xs font-mono">{chartData.data[idx]}</span>
                </div>
                <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-ink" style={{ width: `${(chartData.data[idx] / chartData.data[0]) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-stone-200 rounded-lg p-5">
          <h3 className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-4">Pólizas por compañía</h3>
          <div style={{ height: '200px' }}>
            <Doughnut
              data={{
                labels: chartData.labels,
                datasets: [{
                  data: chartData.data,
                  backgroundColor: ['#1A1714', '#C8B9A0', '#C84B2F', '#2A6B4A', '#B5730A', '#8B5A2B', '#A09A93'],
                  borderWidth: 2,
                  borderColor: '#FDFAF6',
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' as const, labels: { color: '#6B6560', font: { size: 10 }, boxWidth: 10, padding: 6 } } },
                cutout: '60%',
              } as any}
            />
          </div>
        </div>

        <div className="bg-surface border border-stone-200 rounded-lg p-5">
          <h3 className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-6">Resumen</h3>
          <div className="space-y-4">
            <Stat label="Total histórico" value="$88.7M" sub="2017–2026" />
            <Stat label="Facturación 2025" value="$35M" sub="+42% vs 2024" />
            <Stat label="Promedio mensual" value="$2.9M" sub="período 2025" />
            <Stat label="Crecimiento 2024" value="+194%" sub="vs 2023" />
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ label, value, sub, dark = false, highlight = false }: any) {
  return (
    <div className={`rounded-lg p-4 border ${dark ? 'bg-ink border-ink' : highlight ? 'bg-red-bg border-red-200' : 'bg-surface border-stone-200'}`}>
      <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${dark ? 'text-white/35' : highlight ? 'text-accent' : 'text-ink-3'}`}>{label}</div>
      <div className={`font-display text-2xl font-light ${dark || highlight ? 'text-white' : ''} ${highlight ? 'text-accent' : ''}`}>{value}</div>
      <div className={`text-xs mt-1 ${dark ? 'text-white/35' : 'text-ink-3'}`}>{sub}</div>
    </div>
  );
}

function Stat({ label, value, sub }: any) {
  return (
    <div className="border-t border-stone-200 pt-3">
      <div className="text-xs text-ink-3 font-mono uppercase tracking-widest mb-1">{label}</div>
      <div className="font-display text-xl font-light">{value}</div>
      <div className="text-xs text-ink-3">{sub}</div>
    </div>
  );
}
