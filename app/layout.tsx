import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'T-ANIME | HPU ANIME',
  description: 'Xem anime trực tuyến miễn phí',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" className={`${inter.variable}`}>
      <body suppressHydrationWarning className="font-sans bg-[#13141C] text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
