import type {Metadata} from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
 title: 'T-ANIME | HPU ANIME',
 description: 'Xem anime trực tuyến miễn phí',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
 return (
 <html lang="vi" style={{ '--font-sans': '"Inter", sans-serif', '--font-mono': '"Space Mono", monospace' } as React.CSSProperties}>
 <head>
 <link rel="preconnect" href="https://fonts.googleapis.com" />
 <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
 <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
 </head>
  <body suppressHydrationWarning className="font-sans text-[var(--terminal-ink)] antialiased pixel-shell">
 <Providers>
 {children}
 </Providers>
 </body>
 </html>
 );
}
