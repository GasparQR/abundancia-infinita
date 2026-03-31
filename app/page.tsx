'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/pages/Dashboard';
import { Polizas } from '@/components/pages/Polizas';
import { Cartera } from '@/components/pages/Cartera';
import { Comisiones } from '@/components/pages/Comisiones';
import { Importar } from '@/components/pages/Importar';
import { Alertas } from '@/components/pages/Alertas';
import { Facturacion } from '@/components/pages/Facturacion';
import { Toast } from '@/components/Toast';
import { Poliza, CartteraItem, ComisionItem } from '@/types';

const SAMPLE_POLICIES: Poliza[] = [
  {
    id: '1',
    cliente: 'QUINTANA RUIZ JAVIER',
    bien: 'AUTO',
    compania: 'RUS',
    detalle: 'ECOSPORT',
    vence: '2019-05-10',
    estado: 'Anulada',
  },
  {
    id: '2',
    cliente: 'CENTENO JUAN MARÍA',
    bien: 'AUTO',
    compania: 'RUS',
    detalle: 'SANDERO POK394',
    vence: '2026-03-15',
    estado: 'Activa',
  },
  {
    id: '3',
    cliente: 'PEREZ ANALÍA',
    bien: 'AUTO',
    compania: 'SANCOR',
    detalle: 'CRONOS AAF-762',
    vence: '2026-04-10',
    estado: 'Activa',
  },
];

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toast, setToast] = useState('');
  const [policies] = useState<Poliza[]>(SAMPLE_POLICIES);
  const [cartera, setCartera] = useState<CartteraItem[]>([]);
  const [comisiones, setComisiones] = useState<ComisionItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCartera = localStorage.getItem('cartera');
      const savedComisiones = localStorage.getItem('comisiones');
      if (savedCartera) setCartera(JSON.parse(savedCartera));
      if (savedComisiones) setComisiones(JSON.parse(savedComisiones));
    } catch (e) {
      // localStorage not available (SSR)
    }
    setHydrated(true);
  }, []);

  const handleShowToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleClearData = (type: 'cartera' | 'comisiones') => {
    if (type === 'cartera') {
      setCartera([]);
      localStorage.removeItem('cartera');
    } else {
      setComisiones([]);
      localStorage.removeItem('comisiones');
    }
    handleShowToast('Datos borrados');
  };

  const handleImportCartera = (data: CartteraItem[]) => {
    setCartera(data);
    localStorage.setItem('cartera', JSON.stringify(data));
    handleShowToast(`✓ Cartera importada: ${data.length} pólizas`);
  };

  const handleImportComisiones = (data: ComisionItem[]) => {
    setComisiones(data);
    localStorage.setItem('comisiones', JSON.stringify(data));
    handleShowToast(`✓ Comisiones importadas: ${data.length} registros`);
  };

  const upcomingExpired = policies.filter((p) => {
    if (!p.vence || p.estado === 'Anulada') return false;
    const days = Math.round((new Date(p.vence).getTime() - new Date().getTime()) / 86400000);
    return days >= 0 && days <= 90;
  }).length;

  if (!hydrated) {
    return (
      <main className="flex min-h-screen bg-bg items-center justify-center">
        <div className="text-ink-3 text-sm">Cargando...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-bg">
      <Sidebar
        activePage={currentPage}
        onPageChange={setCurrentPage}
        alerts={upcomingExpired}
        hasCartera={cartera.length > 0}
        hasComisiones={comisiones.length > 0}
      />

      <div className="flex-1 overflow-x-hidden">
        {currentPage === 'dashboard' && <Dashboard policies={policies} />}
        {currentPage === 'polizas' && <Polizas policies={policies} />}
        {currentPage === 'cartera' && (
          <Cartera data={cartera} onClear={() => handleClearData('cartera')} />
        )}
        {currentPage === 'comisiones' && (
          <Comisiones data={comisiones} onClear={() => handleClearData('comisiones')} />
        )}
        {currentPage === 'facturacion' && <Facturacion />}
        {currentPage === 'alertas' && <Alertas policies={policies} />}
        {currentPage === 'importar' && (
          <Importar
            onImportCartera={handleImportCartera}
            onImportComisiones={handleImportComisiones}
            onShowToast={handleShowToast}
          />
        )}
      </div>

      <Toast message={toast} />
    </main>
  );
}
