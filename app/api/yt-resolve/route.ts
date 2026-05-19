import { NextRequest, NextResponse } from 'next/server';


function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json() as { urls: string[] };
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const results = await Promise.all(
      urls.map(async (url: string) => {
        const videoId = extractYouTubeId(url);
        if (!videoId) return null;

        try {
          // Use YouTube oEmbed – no API key required
          const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
          const res = await fetch(oembedUrl, { next: { revalidate: 3600 } });

          if (!res.ok) return null;
          const data = await res.json() as {
            title: string;
            author_name: string;
            thumbnail_url: string;
            duration?: number;
          };

          // Try to get duration via noembed (fallback)
          let duration = 0;
          try {
            const noembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            if (noembedRes.ok) {
              const noembedData = await noembedRes.json() as { duration?: number };
              duration = noembedData.duration || 0;
            }
          } catch { /* ignore */ }

          return {
            id: `track_${videoId}_${Date.now()}`,
            title: data.title || 'Unknown Title',
            artist: data.author_name || 'Unknown Artist',
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            youtubeId: videoId,
            duration,
            addedAt: new Date().toISOString(),
          };
        } catch {
          return null;
        }
      })
    );

    const tracks = results;
    return NextResponse.json({ tracks });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
