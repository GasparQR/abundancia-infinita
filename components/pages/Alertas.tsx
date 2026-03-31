'use client';

import { useState, useMemo } from 'react';
import { Poliza } from '@/types';
import { daysDiff } from '@/lib/utils';
import { Bell, AlertCircle } from 'lucide-react';

export function Alertas({ policies }: { policies: Poliza[] }) {
  const [tab, setTab] = useState<'proximas' | 'vencidas'>('proximas');

  const proximas = useMemo(() => {
    return policies
      .filter((p) => {
        if (!p.vence || p.estado === 'Anulada') return false;
        const d = daysDiff(p.vence);
        return d >= 0 && d <= 90;
      })
      .sort((a, b) => new Date(a.vence!).getTime() - new Date(b.vence!).getTime());
  }, [policies]);

  const vencidas = useMemo(() => {
    return policies
      .filter((p) => {
        if (!p.vence) return false;
        return daysDiff(p.vence) < 0;
      })
      .sort((a, b) => new Date(b.vence!).getTime() - new Date(a.vence!).getTime())
      .slice(0, 50);
  }, [policies]);

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light tracking-tight mb-1">Alertas</h1>
        <p className="text-ink-2 text-sm">
          {proximas.length} próximas · {vencidas.length} vencidas
        </p>
      </div>

      <div className="flex gap-1 mb-6 bg-surface-2 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('proximas')}
          className={`px-4 py-2 rounded text-sm font-medium transition ${tab === 'proximas' ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'}`}
        >
          Próximas (90d)
        </button>
        <button
          onClick={() => setTab('vencidas')}
          className={`px-4 py-2 rounded text-sm font-medium transition ${tab === 'vencidas' ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'}`}
        >
          Vencidas
        </button>
      </div>

      <div className="space-y-3">
        {tab === 'proximas' && (
          <>
            {proximas.length === 0 ? (
              <div className="text-center py-16 text-ink-3">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay vencimientos en los próximos 90 días</p>
              </div>
            ) : (
              proximas.map((p) => <AlertCard key={p.id} poliza={p} />)
            )}
          </>
        )}

        {tab === 'vencidas' && (
          <>
            {vencidas.length === 0 ? (
              <div className="text-center py-16 text-ink-3">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay pólizas vencidas</p>
              </div>
            ) : (
              vencidas.map((p) => <AlertCard key={p.id} poliza={p} isExpired={true} />)
            )}
          </>
        )}
      </div>
    </main>
  );
}

function AlertCard({ poliza, isExpired = false }: { poliza: Poliza; isExpired?: boolean }) {
  const diff = Math.abs(daysDiff(poliza.vence!));
  const label = isExpired ? `Hace ${diff} ${diff === 1 ? 'día' : 'días'}` : diff === 0 ? 'HOY' : `En ${diff} ${diff === 1 ? 'día' : 'días'}`;
  
  const urgency = isExpired ? 'accent' : diff <= 7 ? 'accent' : diff <= 30 ? 'amber' : 'green';
  const bgColor = isExpired ? 'red-bg' : diff <= 7 ? 'red-bg' : diff <= 30 ? 'amber-bg' : 'green-bg';
  const textColor = isExpired ? 'accent' : diff <= 7 ? 'accent' : diff <= 30 ? 'amber' : 'green';

  return (
    <div className={`border border-stone-200 rounded-lg p-4 flex items-start gap-4 bg-surface hover:shadow-sm transition`}>
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-${bgColor}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`text-${textColor}`}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.8" fill="currentColor" />
        </svg>
      </div>

      <div className="flex-1">
        <strong className="text-sm block">{poliza.cliente}</strong>
        <span className="text-sm text-ink-2">
          {poliza.detalle} · <span className="text-xs bg-surface-2 text-ink-2 px-1.5 py-0.5 rounded inline-block ml-1">{poliza.compania}</span>
        </span>
      </div>

      <div className={`text-right flex-shrink-0 text-${textColor}`}>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-ink-3">{poliza.vence}</div>
      </div>
    </div>
  );
}
