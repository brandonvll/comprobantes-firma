import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GPT Receipt Studio - Generador de Comprobantes Bancarios con IA',
  description: 'Modifica y regenera recibos bancarios conservando textura, sombra, inclinación y tipografía con OpenAI GPT Image API.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
