'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function Facturacion() {
  const yearData = {
    labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026*'],
    values: [392929, 1213924, 1141632, 1764695, 3859251, 8372640, 24620184, 35027247, 12265804],
  };

  const companyData = [
    { name: 'SANCOR', val: 23861190 },
    { name: 'RUS', val: 18282702 },
    { name: 'SAN CRISTOBAL', val: 14756575 },
    { name: 'HOLANDO', val: 11468950 },
    { name: 'TRIUNFO', val: 6142110 },
    { name: 'RIVADAVIA', val: 3443295 },
    { name: 'MEDICAR', val: 1296759 },
  ];

  const growthData = yearData.values.slice(1).map((v, i) => ({
    year: yearData.labels[i + 1],
    pct: Math.min(((v - yearData.values[i]) / yearData.values[i]) * 100, 300),
  }));

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#6B6560', font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: '#A09A93', font: { size: 10 } }, grid: { display: false } },
      y: { ticks: { color: '#A09A93', font: { size: 10 } }, grid: { color: 'rgba(26,23,20,0.05)' } },
    },
  };

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light tracking-tight mb-1">Facturación</h1>
        <p className="text-ink-2 text-sm">Histórico 2017–2026 · 666 comprobantes</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card label="Total histórico" value="$88.7M" sub="2017 – 2026" dark />
        <Card label="Mejor año (2025)" value="$35M" sub="+42% vs 2024" />
        <Card label="2024" value="$24.6M" sub="+194% vs 2023" />
        <Card label="Promedio mensual" value="$2.9M" sub="período 2025" />
      </div>

      <div className="bg-surface border border-stone-200 rounded-lg p-5 mb-6">
        <h3 className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-4">Evolución anual</h3>
        <div style={{ height: '260px' }}>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-stone-200 rounded-lg p-5">
          <h3 className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-4">Por compañía</h3>
          <div className="space-y-3">
            {companyData.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-ink-2">{c.name}</span>
                  <span className="text-xs font-mono text-ink-2">${(c.val / 1e6).toFixed(1)}M</span>
                </div>
                <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ink"
                    style={{ width: `${(c.val / companyData[0].val) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-stone-200 rounded-lg p-5">
          <h3 className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-4">Crecimiento anual</h3>
          <div className="space-y-3">
            {growthData.map((g) => (
              <div key={g.year}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-ink-2">{g.year}</span>
                  <span className={`text-xs font-mono ${g.pct > 50 ? 'text-green' : 'text-ink-2'}`}>
                    {g.pct >= 100 ? '+' : ''}{Math.round(g.pct)}%
                  </span>
                </div>
                <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${g.pct > 50 ? 'bg-green' : 'bg-ink'}`}
                    style={{
                      width: `${(g.pct / Math.max(...growthData.map((x) => x.pct))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ label, value, sub, dark = false }: any) {
  return (
    <div className={`rounded-lg p-4 border ${dark ? 'bg-ink border-ink' : 'bg-surface border-stone-200'}`}>
      <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${dark ? 'text-white/35' : 'text-ink-3'}`}>{label}</div>
      <div className={`font-display text-2xl font-light ${dark ? 'text-white' : ''}`}>{value}</div>
      <div className={`text-xs mt-1 ${dark ? 'text-white/35' : 'text-ink-3'}`}>{sub}</div>
    </div>
  );
}
