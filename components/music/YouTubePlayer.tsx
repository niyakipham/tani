'use client';

import React, { useEffect, useRef } from 'react';
import { useMusicContext } from '@/lib/musicStore';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer = () => {
  const {
    currentTrackId, tracks, isPlaying, volume,
    setProgress, setDuration, setIsPlaying,
    nextTrack, isLoop, ytPlayerRef,
  } = useMusicContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const isReadyRef = useRef(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTrack = tracks.find(t => t.id === currentTrackId);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.YT) {
      initPlayer();
      return;
    }
    window.onYouTubeIframeAPIReady = initPlayer;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initPlayer = () => {
    if (!containerRef.current) return;
    const player = new window.YT.Player(containerRef.current, {
      height: '1',
      width: '1',
      videoId: '',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: (e: any) => {
          isReadyRef.current = true;
          ytPlayerRef.current = e.target;
          e.target.setVolume(volume);
        },
        onStateChange: (e: any) => {
          const YT = window.YT;
          if (e.data === YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setDuration(e.target.getDuration());
            startProgressTracker(e.target);
          } else if (e.data === YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            stopProgressTracker();
          } else if (e.data === YT.PlayerState.ENDED) {
            stopProgressTracker();
            setProgress(100);
            if (isLoop) {
              e.target.seekTo(0, true);
              e.target.playVideo();
            } else {
              nextTrack();
            }
          }
        },
        onError: () => {
          setIsPlaying(false);
          stopProgressTracker();
        },
      },
    });
    ytPlayerRef.current = player;
  };

  const startProgressTracker = (player: any) => {
    stopProgressTracker();
    progressIntervalRef.current = setInterval(() => {
      try {
        const current = player.getCurrentTime();
        const total = player.getDuration();
        if (total > 0) {
          setProgress((current / total) * 100);
        }
      } catch { /* ignore */ }
    }, 500);
  };

  const stopProgressTracker = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Handle track change
  useEffect(() => {
    if (!isReadyRef.current || !ytPlayerRef.current || !currentTrack) return;
    try {
      ytPlayerRef.current.loadVideoById(currentTrack.youtubeId);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.youtubeId]);

  // Handle play/pause
  useEffect(() => {
    if (!isReadyRef.current || !ytPlayerRef.current) return;
    try {
      if (isPlaying) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    } catch { /* ignore */ }
  }, [isPlaying]);

  // Handle volume
  useEffect(() => {
    if (!isReadyRef.current || !ytPlayerRef.current) return;
    try {
      ytPlayerRef.current.setVolume(volume);
    } catch { /* ignore */ }
  }, [volume]);

  return (
    <div
      style={{ position: 'fixed', bottom: '-100px', left: '-100px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}
      aria-hidden="true"
    >
      <div ref={containerRef} />
    </div>
  );
};
