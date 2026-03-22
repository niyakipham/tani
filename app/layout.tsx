import type {Metadata} from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'T-ANIME | HPU ANIME',
  description: 'Xem anime trực tuyến miễn phí',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" style={{ '--font-sans': '"Inter", sans-serif' } as React.CSSProperties}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="font-sans bg-[#13141C] text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
