export interface Poliza {
  id: string;
  cliente: string;
  bien: string;
  compania: string;
  detalle: string;
  vence: string | null;
  estado: 'Activa' | 'Vencida' | 'Anulada';
  premio?: number;
}

export interface CartteraItem {
  id: string;
  tomador: string;
  seccion: string;
  ramo: string;
  poliza: string;
  tipo?: string;
  fechaVig?: string;
  premio: number;
  formaCobro?: string;
}

export interface ComisionItem {
  id: string;
  periodo: string;
  cliente: string;
  cuitCuil: string;
  ramo: string;
  producto: string;
  poliza: string;
  nroOficialPoliza: string;
  certificado: string;
  foper: string;
  endoso: string;
  provincia: string;
  comision: number;
  adicCobranza: number;
  subtotal: number;
  total: number;
  premio: number;
  premioCap: number;
  porcComision: string;
  formaPago: string;
  cuota: string;
  moneda: string;
}

export interface DashboardMetrics {
  totalPolicies: number;
  activePolicies: number;
  upcomingExpired: number;
  totalCommissions: number;
  totalPremium: number;
}
