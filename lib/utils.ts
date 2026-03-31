import { Poliza } from '@/types';

export function fmt(n: number): string {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
  return '$' + Math.round(n);
}

export function fmtN(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function daysDiff(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function getEstadoBadgeColor(poliza: Poliza): string {
  if (poliza.estado === 'Anulada') return 'gray';
  if (!poliza.vence) return 'green';
  const d = daysDiff(poliza.vence);
  if (d < 0) return 'red';
  if (d <= 30) return 'amber';
  return 'green';
}
