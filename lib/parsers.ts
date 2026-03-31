import { ComisionItem, CartteraItem } from '@/types';
import * as XLSX from 'xlsx';

function toNum(val: any): number {
  if (val == null || val === '') return 0;
  const n = parseFloat(String(val).replace(/[$,]/g, ''));
  return isNaN(n) ? 0 : n;
}

function toStr(val: any): string {
  if (val == null) return '';
  return String(val).trim();
}

export function parseComisiones(ws: XLSX.WorkSheet): ComisionItem[] {
  const raw = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: false,
    defval: '',
  }) as any[][];

  let headerRow = -1;

  // Header row must have at least 3 distinct keyword matches in separate cells
  // and at least 10 non-empty cells (a real header row, not a title/metadata row)
  const KEYWORDS = ['DENOMI', 'CLIENTE', 'COMISION', 'RAMO', 'POLIZA', 'PREMIO', 'PERIODO', 'FOPER', 'REFERENCIA'];
  for (let i = 0; i < Math.min(raw.length, 30); i++) {
    const cells = raw[i].map((c: any) => String(c || '').trim().toUpperCase());
    const nonEmpty = cells.filter((c: string) => c.length > 0).length;
    if (nonEmpty < 5) continue; // skip metadata/title rows

    let matches = 0;
    for (const kw of KEYWORDS) {
      if (cells.some((c: string) => c.includes(kw))) matches++;
    }
    if (matches >= 3) {
      headerRow = i;
      break;
    }
  }

  if (headerRow < 0) {
    throw new Error(
      'No pude identificar el formato. ¿Es un archivo de Detalle de Comisiones?'
    );
  }

  const headers = raw[headerRow].map((c: any) => toStr(c).toUpperCase());

  // includes-based search
  const findCol = (names: string[]): number => {
    for (const name of names) {
      const idx = headers.findIndex((h: string) => h.includes(name));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  // exact match search (for ambiguous short names like TOTAL)
  const findColExact = (names: string[]): number => {
    for (const name of names) {
      const idx = headers.findIndex((h: string) => h === name);
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const cols = {
    periodo:     findCol(['PERIODO', 'PERIO']),
    cliente:     findCol(['DENOMINACION CLIENTE', 'DENOMINACION', 'DENOMI']),
    cuitCuil:    findCol(['CUITCUIL', 'CUIL']),
    ramo:        findColExact(['RAMO']),
    producto:    findColExact(['PRODUCTO']),
    referencia:  findColExact(['REFERENCIA']),
    nroOficial:  findCol(['NRO OFICIAL']),
    certificado: findCol(['CERTIFICADO']),
    foper:       findCol(['FOPER']),
    endoso:      findColExact(['ENDOSO']),
    provincia:   findCol(['PROVINCIA']),
    comision:    findColExact(['COMISION', 'COMISIÓN']),
    ajustes:     findCol(['AJUSTES DE COMISION']),
    adicCob:     findCol(['ADIC COBRANZA']),
    subtotal:    findColExact(['SUBTOTAL']),
    total:       findColExact(['TOTAL']),
    premio:      findColExact(['PREMIO']),
    premioCap:   findCol(['PREMIO CAP']),
    porcComision:findCol(['PORC COMISION']),
    moneda:      findColExact(['MONEDA']),
    formaPago:   findCol(['FORMA PAGO']),
    cuota:       findColExact(['CUOTA']),
  };

  if (cols.cliente < 0) {
    cols.cliente = findCol(['DEN', 'TOMADOR', 'CLIENTE']);
  }
  if (cols.referencia < 0) {
    cols.referencia = findCol(['POLIZA', 'NRO']);
  }
  if (cols.ramo < 0) {
    cols.ramo = findCol(['RAMO', 'RAMA', 'SECCI']);
  }

  const comisiones: ComisionItem[] = [];

  for (let i = headerRow + 1; i < raw.length; i++) {
    const r = raw[i];

    const cli = cols.cliente >= 0 ? toStr(r[cols.cliente]) : '';
    if (!cli || cli.length < 2) continue;

    const periodo = cols.periodo >= 0 ? toStr(r[cols.periodo]) : '';
    if (!periodo) continue;

    let foper = cols.foper >= 0 ? toStr(r[cols.foper]) : '';
    if (foper.includes('00:00:00')) {
      foper = foper.split(' ')[0];
    }

    comisiones.push({
      id: `comm-${i}`,
      periodo: periodo.replace(/\./g, ''),
      cliente: cli,
      cuitCuil:       cols.cuitCuil >= 0 ? toStr(r[cols.cuitCuil]) : '',
      ramo:           cols.ramo >= 0 ? toStr(r[cols.ramo]) : '',
      producto:       cols.producto >= 0 ? toStr(r[cols.producto]) : '',
      poliza:         cols.referencia >= 0 ? toStr(r[cols.referencia]) : '',
      nroOficialPoliza: cols.nroOficial >= 0 ? toStr(r[cols.nroOficial]) : '',
      certificado:    cols.certificado >= 0 ? toStr(r[cols.certificado]) : '',
      foper:          foper,
      endoso:         cols.endoso >= 0 ? toStr(r[cols.endoso]) : '',
      provincia:      cols.provincia >= 0 ? toStr(r[cols.provincia]).replace(/^AR-\w+ - /, '') : '',
      comision:       cols.comision >= 0 ? toNum(r[cols.comision]) : 0,
      adicCobranza:   cols.adicCob >= 0 ? toNum(r[cols.adicCob]) : 0,
      subtotal:       cols.subtotal >= 0 ? toNum(r[cols.subtotal]) : 0,
      total:          cols.total >= 0 ? toNum(r[cols.total]) : 0,
      premio:         cols.premio >= 0 ? toNum(r[cols.premio]) : 0,
      premioCap:      cols.premioCap >= 0 ? toNum(r[cols.premioCap]) : 0,
      porcComision:   cols.porcComision >= 0 ? toStr(r[cols.porcComision]) : '',
      formaPago:      cols.formaPago >= 0 ? toStr(r[cols.formaPago]) : '',
      cuota:          cols.cuota >= 0 ? toStr(r[cols.cuota]) : '',
      moneda:         cols.moneda >= 0 ? toStr(r[cols.moneda]) : '$',
    });
  }

  if (comisiones.length === 0) {
    throw new Error('No encontre datos de comisiones en el archivo');
  }

  return comisiones;
}

export function parseCartera(ws: XLSX.WorkSheet): CartteraItem[] {
  const raw = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: false,
    defval: '',
  }) as any[][];

  let headerRow = -1;

  for (let i = 0; i < raw.length; i++) {
    const r = raw[i].map((c: any) => String(c || '').toUpperCase());
    if (r.some((c: string) => c.includes('TOMADOR') || c.includes('POLIZA'))) {
      headerRow = i;
      break;
    }
  }

  if (headerRow < 0) {
    throw new Error('No pude encontrar las columnas esperadas');
  }

  const headers = raw[headerRow].map((c: any) => toStr(c).toUpperCase());

  const findCol = (names: string[]): number => {
    for (const name of names) {
      const idx = headers.findIndex((h: string) => h.includes(name));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const iSec = findCol(['SECCION', 'SECCIÓN']);
  const iRamo = findCol(['RAMO']);
  const iPol = findCol(['POLIZA', 'PÓLIZA']);
  const iTipo = findCol(['TIPO FACT', 'TIPO']);
  const iTom = findCol(['TOMADOR']);
  const iFecha = findCol(['FECHA VIG', 'VIGENCIA']);
  const iPremio = findCol(['PREMIO ULT', 'PREMIO ÚLT', 'PREMIO']);
  const iCobro = findCol(['FORMA DE COBRO', 'COBRO']);

  const cartera: CartteraItem[] = [];

  for (let i = headerRow + 1; i < raw.length; i++) {
    const r = raw[i];

    const tom = iTom >= 0 ? toStr(r[iTom]) : '';
    if (!tom) continue;

    cartera.push({
      id: `cart-${i}`,
      tomador: tom,
      seccion: iSec >= 0 ? toStr(r[iSec]) : '',
      ramo: iRamo >= 0 ? toStr(r[iRamo]) : '',
      poliza: iPol >= 0 ? toStr(r[iPol]) : '',
      tipo: iTipo >= 0 ? toStr(r[iTipo]) : '',
      fechaVig: iFecha >= 0 ? toStr(r[iFecha]) : '',
      premio: iPremio >= 0 ? toNum(r[iPremio]) : 0,
      formaCobro: iCobro >= 0 ? toStr(r[iCobro]) : '',
    });
  }

  if (cartera.length === 0) {
    throw new Error('No se encontraron datos de polizas');
  }

  return cartera;
}
