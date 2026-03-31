// src/components/Sidebar.tsx

'use client';

import { ReactNode } from 'react';
import {
  LayoutDashboard,
  FileText,
  Clock,
  TrendingUp,
  DollarSign,
  Bell,
  Upload,
} from 'lucide-react';

interface NavItem {
  id: string;
  icon: ReactNode;
  label: string;
  badge?: string;
  section?: string;
}

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  alerts: number;
  hasCartera: boolean;
  hasComisiones: boolean;
}

export function Sidebar({
  activePage,
  onPageChange,
  alerts,
  hasCartera,
  hasComisiones,
}: SidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: 'Dashboard',
      section: 'Principal',
    },
    {
      id: 'polizas',
      icon: <FileText className="w-4 h-4" />,
      label: 'Pólizas',
    },
    {
      id: 'cartera',
      icon: <Clock className="w-4 h-4" />,
      label: 'Cartera vigente',
      badge: hasCartera ? '+' : undefined,
    },
    {
      id: 'facturacion',
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Facturación',
      section: 'Financiero',
    },
    {
      id: 'comisiones',
      icon: <DollarSign className="w-4 h-4" />,
      label: 'Comisiones',
      badge: hasComisiones ? '+' : undefined,
    },
    {
      id: 'alertas',
      icon: <Bell className="w-4 h-4" />,
      label: 'Alertas',
      badge: alerts > 0 ? String(alerts) : '—',
      section: 'Gestión',
    },
    {
      id: 'importar',
      icon: <Upload className="w-4 h-4" />,
      label: 'Importar datos',
    },
  ];

  let currentSection = '';

  return (
    <aside className="w-56 bg-ink text-white p-7 flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="pb-6 border-b border-white/10 mb-6">
        <h1 className="font-display text-lg font-light leading-tight">
          Abundancia<br />Infinita
        </h1>
        <p className="text-xs text-white/35 font-mono tracking-widest mt-2">
          CORREDORA DE SEGUROS
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          // Mostrar sección
          if (item.section && item.section !== currentSection) {
            currentSection = item.section;
            return (
              <div key={`section-${item.section}`}>
                <div className="text-xs text-white/25 font-mono tracking-widest uppercase px-3 py-3 mb-1">
                  {item.section}
                </div>
                <NavButton
                  item={item}
                  isActive={activePage === item.id}
                  onClick={() => onPageChange(item.id)}
                />
              </div>
            );
          }

          return (
            <NavButton
              key={item.id}
              item={item}
              isActive={activePage === item.id}
              onClick={() => onPageChange(item.id)}
            />
          );
        })}
      </nav>
    </aside>
  );
}

function NavButton({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all ${
        isActive
          ? 'bg-white/10 text-white font-medium'
          : 'text-white/50 hover:text-white/85 hover:bg-white/5'
      }`}
    >
      <span className={`${isActive ? 'opacity-100' : 'opacity-65'}`}>{item.icon}</span>
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge && (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-mono ${
            item.badge === '—'
              ? 'bg-transparent'
              : 'bg-accent text-white font-medium'
          }`}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}
