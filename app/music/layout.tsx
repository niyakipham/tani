import type { Metadata } from 'next';
import { MusicProvider } from '@/lib/musicStore';

export const metadata: Metadata = {
  title: 'T-ANIME | Music Player',
  description: 'Nghe nhạc từ YouTube – Tani Music Player',
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return (
    <MusicProvider>
      {children}
    </MusicProvider>
  );
}
