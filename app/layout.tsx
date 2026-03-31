import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Abundancia Infinita — Gestión de Seguros',
  description: 'Sistema integral de gestión para corredora de seguros independiente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-bg text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
