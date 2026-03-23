'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle, Heart, Download, Share2, Star, Clock, MonitorPlay, Cast, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Subtitles, SkipForward, Users, RotateCcw, RotateCw } from 'lucide-react';
import { useAppContext } from '@/lib/store';
import { fetchMovieDetails } from '@/lib/api';
import Hls from 'hls.js';

const EP_CHUNK_SIZE = 100;

export const HeroPlayer = () => {
  const { currentMovieSlug, favorites, toggleFavorite, history, addToHistory, updateHistoryProgress, updateHistorySnapshot, addDownload, setIsWatchPartyOpen, roomId, sendP2PMessage, setVideoSyncCallback, unreadCount } = useAppContext();
  const [movieData, setMovieData] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<any>(null);
  const [currentEpChunk, setCurrentEpChunk] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Custom Video Player States
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const lastSnapshotTimeRef = useRef(0);

  // Capture a frame from the video element as base64 JPEG
  const captureSnapshot = useCallback(() => {
    const video = videoRef.current;
    if (!video || !movieData || video.readyState < 2 || video.videoWidth === 0) return;
    try {
      const canvas = document.createElement('canvas');
      // Use a smaller resolution for thumbnail
      const scale = Math.min(1, 400 / video.videoWidth);
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      updateHistorySnapshot(movieData.slug, dataUrl);
    } catch (e) {
      // CORS or tainted canvas — silently ignore
    }
  }, [movieData, updateHistorySnapshot]);
  
  // Subtitle States
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [currentSubtitleIdx, setCurrentSubtitleIdx] = useState<number>(-1);
  const [showSubMenu, setShowSubMenu] = useState(false);

  // Skip Control Setup
  const lastTapRef = useRef<{ time: number } | null>(null);
  const [doubleTapSide, setDoubleTapSide] = useState<'left' | 'right' | null>(null);

  const skipTime = (amount: number) => {
    if (videoRef.current) {
      let nextTime = videoRef.current.currentTime + amount;
      nextTime = Math.max(0, Math.min(nextTime, duration));
      videoRef.current.currentTime = nextTime;
      setProgress(nextTime);
      if (roomId) sendP2PMessage('VIDEO_SYNC', { action: 'SEEK', time: nextTime });
      
      setDoubleTapSide(amount > 0 ? 'right' : 'left');
      setTimeout(() => setDoubleTapSide(null), 500);
    }
  };

  const handleVideoTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    const touch = e.touches[0];
    if (lastTapRef.current && now - lastTapRef.current.time < 300) {
      const rect = e.currentTarget.getBoundingClientRect();
      const xPos = touch.clientX - rect.left;
      if (xPos > rect.width / 2) skipTime(10);
      else skipTime(-10);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: now };
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    if (xPos > rect.width / 2) skipTime(10);
    else skipTime(-10);
  };

  // Sync P2P Setup
  useEffect(() => {
    setVideoSyncCallback((data: any) => {
      if (!videoRef.current) return;
      if (data.action === 'PLAY') {
        videoRef.current.currentTime = data.time;
        videoRef.current.play().catch(() => {});
      } else if (data.action === 'PAUSE') {
        videoRef.current.currentTime = data.time;
        videoRef.current.pause();
      } else if (data.action === 'SEEK') {
        videoRef.current.currentTime = data.time;
        setProgress(data.time);
      }
    });
  }, [setVideoSyncCallback]);

  useEffect(() => {
    const loadMovie = async () => {
      if (!currentMovieSlug) return;
      setIsLoading(true);
      try {
        const data = await fetchMovieDetails(currentMovieSlug);
        if (data.status) {
          setMovieData(data.movie);
          const eps = data.episodes[0]?.server_data || [];
          setEpisodes(eps);
          
          // Check history for this movie
          const historyItem = history.find(h => h.slug === currentMovieSlug);
          let targetEp = eps.length > 0 ? eps[0] : null;
          let targetChunk = 0;
          
          if (historyItem && historyItem.epName) {
            const foundEpIndex = eps.findIndex((e: any) => e.name === historyItem.epName);
            if (foundEpIndex !== -1) {
              targetEp = eps[foundEpIndex];
              targetChunk = Math.floor(foundEpIndex / EP_CHUNK_SIZE);
            }
          }
          
          setActiveEpisode(targetEp);
          setCurrentEpChunk(targetChunk);
          if (targetEp) {
            addToHistory(data.movie, targetEp.name);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMovie();
  }, [currentMovieSlug]); // Intentionally not including history to avoid reloading when history changes

  const handleSelectEpisode = (idx: number) => {
    const ep = episodes[idx];
    setActiveEpisode(ep);
    setCurrentEpChunk(Math.floor(idx / EP_CHUNK_SIZE));
    if (movieData) addToHistory(movieData, ep.name);
    
    const offset = window.innerWidth <= 1024 ? 80 : 0;
    const mainCol = document.querySelector('.main-column');
    if (mainCol) {
      const topPos = mainCol.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: topPos, behavior: 'smooth' });
    }
  };

  const playNextEpisode = () => {
    if (!activeEpisode || episodes.length === 0) return;
    
    const currentIndex = episodes.findIndex(ep => ep.slug === activeEpisode.slug);
    if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
      handleSelectEpisode(currentIndex + 1);
    }
  };

  // --- Custom Video Player Logic ---
  useEffect(() => {
    if (!activeEpisode?.link_m3u8 || !videoRef.current) return;
    const video = videoRef.current;
    let hls: Hls | null = null;
    
    setIsPlaying(false);
    setProgress(0);
    setIsBuffering(true);
    setSubtitleTracks([]);
    setCurrentSubtitleIdx(-1);

    if (Hls.isSupported()) {
      hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
      hlsRef.current = hls; // Store ref to interact later
      
      hls.loadSource(activeEpisode.link_m3u8);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        video.play().catch(e => console.log('Auto-play prevented:', e));
      });
      
      // Manage Subtitles from Hls.js
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_, data) => {
        setSubtitleTracks(data.subtitleTracks || []);
      });
      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_, data) => {
        setCurrentSubtitleIdx(data.id);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR: hls?.startLoad(); break;
            case Hls.ErrorTypes.MEDIA_ERROR: hls?.recoverMediaError(); break;
            default: hls?.destroy(); break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari which has native HLS support
      video.src = activeEpisode.link_m3u8;
      video.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
        video.play().catch(e => console.log('Auto-play prevented:', e));
        
        // Fallback for native Safari
        const tracks = Array.from(video.textTracks || []);
        if (tracks.length > 0) {
          setSubtitleTracks(tracks.map((t, idx) => ({ id: idx, name: t.label || t.language || `Phụ đề ${idx+1}` })));
          const activeIndex = tracks.findIndex(t => t.mode === 'showing');
          setCurrentSubtitleIdx(activeIndex);
        }
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [activeEpisode]);

  const changeSubtitle = (idx: number) => {
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = idx;
    } else if (videoRef.current) {
      Array.from(videoRef.current.textTracks).forEach((track, i) => {
        track.mode = i === idx ? 'showing' : 'disabled';
      });
    }
    setCurrentSubtitleIdx(idx);
    setShowSubMenu(false);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress(videoRef.current.currentTime);
    // Update history locally
    if (movieData && duration > 0) {
      const percent = Math.floor((videoRef.current.currentTime / duration) * 100);
      updateHistoryProgress(movieData.slug, percent);
      // Capture snapshot every ~15 seconds
      const now = Date.now();
      if (now - lastSnapshotTimeRef.current > 15000) {
        lastSnapshotTimeRef.current = now;
        captureSnapshot();
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (movieData) updateHistoryProgress(movieData.slug, 100);
    if (isAutoPlay) playNextEpisode();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(e => console.log('Play prevented:', e));
        if (roomId) sendP2PMessage('VIDEO_SYNC', { action: 'PLAY', time: videoRef.current.currentTime });
      } else {
        videoRef.current.pause();
        captureSnapshot();
        if (roomId) sendP2PMessage('VIDEO_SYNC', { action: 'PAUSE', time: videoRef.current.currentTime });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setProgress(time);
      if (roomId) sendP2PMessage('VIDEO_SYNC', { action: 'SEEK', time });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) setVolume(0);
      else setVolume(videoRef.current.volume > 0 ? videoRef.current.volume : 1);
    }
  };

  const changeSpeed = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSpeedMenu(false);
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  // Sync Fullscreen State with ESC key
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (!videoRef.current) return;

      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          togglePlay();
          setShowControls(true);
          break;
        case 'ArrowRight':
          e.preventDefault();
          {
            const next = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration || 0);
            videoRef.current.currentTime = next;
            setProgress(next);
            setShowControls(true);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          {
            const prev = Math.max(videoRef.current.currentTime - 10, 0);
            videoRef.current.currentTime = prev;
            setProgress(prev);
            setShowControls(true);
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hide controls on idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!videoRef.current?.paused) setShowControls(false);
    }, 3000);
  };
  
  const handleMouseLeave = () => {
    if (!videoRef.current?.paused) setShowControls(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const SKIP_INTRO_AMOUNT = 85; 
  const showSkipIntro = progress > 15 && progress < 180;

  const handleSkipIntro = () => {
    if (videoRef.current) {
      const nextTime = Math.min(videoRef.current.currentTime + SKIP_INTRO_AMOUNT, duration);
      videoRef.current.currentTime = nextTime;
      setProgress(nextTime);
      if (roomId) sendP2PMessage('VIDEO_SYNC', { action: 'SEEK', time: nextTime });
    }
  };
  // --- End Custom Player Logic ---

  const handleDownload = async () => {
    if (!movieData || !activeEpisode || isDownloading) return;
    const m3u8Link = activeEpisode.link_m3u8;
    if (!m3u8Link) { alert("Lỗi tải video!"); return; }

    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const fetchText = async (url: string) => { const res = await fetch(url); return await res.text(); };
      let manifest = await fetchText(m3u8Link);
      let baseUrl = m3u8Link.substring(0, m3u8Link.lastIndexOf('/') + 1);

      if (manifest.includes('#EXT-X-STREAM-INF')) {
        const lines = manifest.split('\n'); let bestUrl = '';
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('#EXT-X-STREAM-INF')) { let n = lines[i+1].trim(); if(n) bestUrl = n; }
        }
        if (bestUrl) {
          if (!bestUrl.startsWith('http')) bestUrl = baseUrl + bestUrl;
          manifest = await fetchText(bestUrl); baseUrl = bestUrl.substring(0, bestUrl.lastIndexOf('/') + 1);
        }
      }

      const tsUrls = [];
      for (let line of manifest.split('\n')) {
        line = line.trim(); if (line && !line.startsWith('#')) tsUrls.push(line.startsWith('http') ? line : baseUrl + line);
      }
      if (tsUrls.length === 0) throw new Error("No TS");

      const chunks = new Array(tsUrls.length); let dlCount = 0;
      for (let i = 0; i < tsUrls.length; i += 5) {
        const batch = tsUrls.slice(i, i + 5);
        const promises = batch.map(async (url, idx) => {
          const res = await fetch(url); const buffer = await res.arrayBuffer();
          return { index: i + idx, buffer };
        });
        const results = await Promise.all(promises);
        for (const r of results) chunks[r.index] = r.buffer;
        dlCount += batch.length;
        setDownloadProgress(Math.floor((dlCount / tsUrls.length) * 100));
      }

      const blob = new Blob(chunks, { type: 'video/mp2t' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a'); a.style.display = 'none'; a.href = url;
      a.download = `${movieData.slug}-tap-${activeEpisode.name}.ts`;
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
      
      addDownload(movieData, activeEpisode.name);
    } catch (error) {
      if (confirm("Lỗi mạng/CORS. Mở link gốc để tải bằng phần mềm thứ 3?")) {
        const a = document.createElement('a'); a.href = m3u8Link; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCast = async () => {
    if (!activeEpisode?.link_m3u8) {
      alert("Không tìm thấy link video để cast!");
      return;
    }

    const loadCastApi = (): Promise<void> => {
      if ((window as any).cast) return Promise.resolve();
      return new Promise((resolve) => {
        (window as any).__onGCastApiAvailable = (isAvailable: boolean) => {
          if (isAvailable) {
            const cast = (window as any).cast;
            const chrome = (window as any).chrome;
            cast.framework.CastContext.getInstance().setOptions({
              receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
              autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });
            resolve();
          }
        };
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
        document.body.appendChild(script);
      });
    };

    try {
      await loadCastApi();
      const cast = (window as any).cast;
      const chrome = (window as any).chrome;
      const context = cast.framework.CastContext.getInstance();
      
      let session = context.getCurrentSession();
      if (!session) {
        await context.requestSession();
        session = context.getCurrentSession();
      }

      if (session && activeEpisode.link_m3u8) {
        const mediaInfo = new chrome.cast.media.MediaInfo(activeEpisode.link_m3u8, 'application/x-mpegurl');
        
        // Add metadata for the cast screen
        const metadata = new chrome.cast.media.GenericMediaMetadata();
        metadata.title = movieData?.name ? `${movieData.name} - Tập ${activeEpisode.name}` : `Tập ${activeEpisode.name}`;
        if (movieData?.thumb_url) {
          metadata.images = [new chrome.cast.Image(`https://img.ophim.live/uploads/movies/${movieData.thumb_url}`)];
        }
        mediaInfo.metadata = metadata;

        const request = new chrome.cast.media.LoadRequest(mediaInfo);
        await session.loadMedia(request);
        alert('Đang cast lên thiết bị!');
      }
    } catch (e) {
      console.error('Cast error:', e);
      alert('Không thể cast. Vui lòng thử lại hoặc kiểm tra thiết bị của bạn (chỉ hỗ trợ trên trình duyệt Chrome/Edge có hỗ trợ Cast).');
    }
  };

  const isLiked = movieData ? favorites.some(f => f.slug === movieData.slug) : false;

  const totalChunks = Math.ceil(episodes.length / EP_CHUNK_SIZE);
  const startIdx = currentEpChunk * EP_CHUNK_SIZE;
  const endIdx = startIdx + EP_CHUNK_SIZE;
  const epsToRender = episodes.slice(startIdx, endIdx);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full max-md:gap-4 max-md:p-0">
      {/* Left: Video Player & Info */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <div 
          ref={playerContainerRef}
          className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[2] max-md:rounded-none group"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="absolute -inset-5 bg-[#3B82F6] blur-[80px] opacity-15 z-[-1] rounded-full max-md:hidden"></div>
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-full absolute inset-0 z-10">
              <div className="w-12 h-12 border-4 border-[#252836] border-t-[#3B82F6] rounded-full animate-spin dark:border-[#252836] border-white/10 dark:border-t-[#3B82F6] border-t-[#3B82F6]"></div>
            </div>
          ) : activeEpisode ? (
            <>
              {/* Native Video Element */}
              <video 
                ref={videoRef}
                className="w-full h-full absolute top-0 left-0 object-contain cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={handleVideoEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                playsInline
                onTouchStart={handleVideoTouchStart}
                onDoubleClick={handleDoubleClick}
              />

              {/* Double tap ripple effect */}
              {doubleTapSide && (
                <div className={`absolute top-0 bottom-0 w-[45%] flex flex-col items-center justify-center bg-white/10 animate-in fade-in zoom-in duration-300 pointer-events-none z-10 ${doubleTapSide === 'left' ? 'left-0 rounded-r-[100%]' : 'right-0 rounded-l-[100%]'}`}>
                  <div className="bg-black/40 backdrop-blur-md rounded-full p-4 mb-2 animate-bounce">
                    {doubleTapSide === 'left' ? <RotateCcw size={40} className="text-white" /> : <RotateCw size={40} className="text-white" />}
                  </div>
                  <span className="text-white font-black text-xl drop-shadow-md">{doubleTapSide === 'left' ? '-10 giây' : '+10 giây'}</span>
                </div>
              )}

              {/* Buffering Indicator */}
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="w-16 h-16 border-4 border-white/20 border-t-[#3B82F6] rounded-full animate-spin mix-blend-screen shadow-[0_0_30px_rgba(59,130,246,0.6)]"></div>
                </div>
              )}

              {/* Skip Intro Button */}
              {showSkipIntro && (
                <button 
                  onClick={handleSkipIntro}
                  className="absolute bottom-24 right-5 z-40 bg-black/60 hover:bg-[#3B82F6] text-white backdrop-blur-xl border border-white/30 hover:border-[#3B82F6] px-5 py-2.5 rounded-xl text-[0.95rem] font-bold transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-2 hover:scale-105 animate-in slide-in-from-right-8 fade-in hover:shadow-[0_10px_30px_rgba(59,130,246,0.3)] duration-500"
                >
                  <SkipForward size={18} className="fill-current" /> Bỏ qua Intro
                </button>
              )}

              {/* Custom Controls Overlay */}
              <div 
                className={`absolute bottom-0 left-0 w-full px-5 pb-5 pt-24 bg-gradient-to-t from-[#0F111A]/90 via-[#0F111A]/60 to-transparent transition-opacity duration-300 z-30 flex flex-col gap-3
                ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                {/* Seek Bar */}
                <div className="w-full flex items-center gap-3">
                  <span className="text-white text-[0.8rem] font-medium font-mono min-w-[45px]">{formatTime(progress)}</span>
                  <div className="relative flex-1 h-1.5 group/seekbar cursor-pointer flex items-center">
                    <input 
                      type="range" 
                      min="0" 
                      max={duration || 100} 
                      value={progress} 
                      onChange={handleSeek}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden transition-all group-hover/seekbar:h-2.5">
                      <div 
                        className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] relative"
                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover/seekbar:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-white/70 text-[0.8rem] font-medium font-mono min-w-[45px] text-right">{formatTime(duration)}</span>
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause Area */}
                    <div className="flex items-center gap-2 md:gap-4">
                      <button onClick={() => skipTime(-10)} className="text-white hover:text-[#3B82F6] transition-colors focus:outline-none max-md:hidden">
                        <RotateCcw size={22} />
                      </button>
                      <button onClick={togglePlay} className="text-white hover:text-[#3B82F6] transition-colors hover:scale-110 active:scale-95">
                        {isPlaying ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current" />}
                      </button>
                      <button onClick={() => skipTime(10)} className="text-white hover:text-[#3B82F6] transition-colors focus:outline-none max-md:hidden">
                        <RotateCw size={22} />
                      </button>
                    </div>
                    
                    {/* Volume */}
                    <div className="flex items-center gap-2 group/vol relative">
                      <button onClick={toggleMute} className="text-white hover:text-[#3B82F6] transition-colors">
                        {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                      </button>
                      <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 flex items-center h-8">
                        <input 
                          type="range" 
                          min="0" max="1" step="0.05" 
                          value={isMuted ? 0 : volume} 
                          onChange={handleVolumeChange}
                          className="w-20 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer accent-[#3B82F6]"
                          style={{ background: `linear-gradient(to right, #3B82F6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Subtitle Menu */}
                    {subtitleTracks.length > 0 && (
                      <div className="relative">
                        <button 
                          onClick={() => { setShowSubMenu(!showSubMenu); setShowSpeedMenu(false); }} 
                          className={`text-white hover:text-[#3B82F6] transition-colors flex items-center justify-center gap-1 group/sub ${currentSubtitleIdx !== -1 ? 'text-[#3B82F6]' : ''}`}
                          title="Phụ đề (Subtitles)"
                        >
                          <Subtitles size={24} className="max-md:w-5 max-md:h-5" />
                          <span className="text-[0.8rem] font-bold bg-white/10 px-1.5 py-0.5 rounded-md min-w-[28px] text-center max-md:hidden uppercase">
                            {currentSubtitleIdx !== -1 && subtitleTracks[currentSubtitleIdx] ? (subtitleTracks[currentSubtitleIdx].name || 'CC').substring(0,3) : 'TẮT'}
                          </span>
                        </button>
                        
                        {/* Dropdown Subtitles */}
                        {showSubMenu && (
                          <div className="absolute bottom-full right-0 mb-4 bg-[#0F111A]/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col p-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-40 max-h-[220px] overflow-y-auto custom-scrollbar transition-all scale-100 origin-bottom">
                            <button 
                              onClick={() => changeSubtitle(-1)}
                              className={`px-5 py-2.5 rounded-xl text-[0.9rem] font-bold transition-colors whitespace-nowrap text-left
                                ${currentSubtitleIdx === -1 ? 'bg-[#3B82F6] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            >
                              Tắt Phụ Đề
                            </button>
                            <div className="w-full h-px bg-white/10 my-1"></div>
                            {subtitleTracks.map((track, idx) => (
                              <button 
                                key={idx}
                                onClick={() => changeSubtitle(idx)}
                                className={`px-5 py-2.5 rounded-xl text-[0.9rem] font-bold transition-colors whitespace-nowrap text-left
                                  ${currentSubtitleIdx === idx ? 'bg-[#3B82F6] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                              >
                                {track.name || `Phụ đề ${idx + 1}`}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Speed Menu */}
                    <div className="relative">
                      <button 
                        onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowSubMenu(false); }} 
                        className="text-white hover:text-[#3B82F6] transition-colors flex items-center justify-center gap-1 group/speed"
                      >
                        <Settings size={22} className={`transition-transform duration-500 max-md:w-5 max-md:h-5 ${showSpeedMenu ? 'rotate-90' : ''}`} />
                        <span className="text-[0.85rem] font-bold w-12 max-md:w-9 text-center bg-white/10 px-2 max-md:px-1 py-0.5 rounded-md max-md:text-[0.75rem]">{playbackRate}x</span>
                      </button>
                      
                      {/* Dropdown Speed */}
                      {showSpeedMenu && (
                        <div className="absolute bottom-full right-0 mb-4 bg-[#0F111A]/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col p-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-40 max-h-[160px] overflow-y-auto custom-scrollbar transition-all scale-100 origin-bottom">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button 
                              key={rate}
                              onClick={() => changeSpeed(rate)}
                              className={`px-6 py-2 rounded-xl text-[0.9rem] font-bold transition-colors whitespace-nowrap
                                ${playbackRate === rate ? 'bg-[#3B82F6] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            >
                              {rate === 1 ? 'Chẩn (1x)' : `${rate}x`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fullscreen */}
                    <button onClick={toggleFullscreen} className="text-white hover:text-[#3B82F6] transition-colors hover:scale-110 active:scale-95">
                      {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-[#808191]">
              <MonitorPlay size={48} />
            </div>
          )}
        </div>
        
        <div className="relative z-[20] mx-auto w-full max-w-[100%] md:max-w-[95%] xl:max-w-full mt-0 md:mt-6 pt-6 md:pt-8 px-5 md:px-10 pb-8 bg-white/95 dark:bg-[#0F111A]/95 md:bg-white/80 md:dark:bg-[#13141C]/80 backdrop-blur-3xl max-md:rounded-b-[2rem] md:rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-xl dark:shadow-2xl flex flex-col gap-4 md:gap-5 items-center md:items-start transition-all">
          
          {/* Drag handle (aesthetic) */}
          <div className="w-12 h-1.5 bg-black/10 dark:bg-white/20 rounded-full mb-1 md:hidden"></div>

          {/* Title Area */}
          <div className="text-center md:text-left w-full flex flex-col items-center md:items-start">
            <h1 className="text-[1.8rem] md:text-[3.5rem] font-black text-black dark:text-white leading-[1.1] tracking-tight drop-shadow-sm dark:drop-shadow-md flex items-center justify-center md:justify-start gap-2.5 md:gap-3 flex-wrap">
              {isLoading ? (
                <div className="w-[80%] md:w-[400px] h-10 bg-black/5 dark:bg-white/10 rounded-2xl animate-pulse"></div>
              ) : (movieData?.name || 'Chọn một bộ phim')}
              {movieData?.quality && <span className="text-[0.65rem] md:text-[0.75rem] px-2.5 py-1 border border-black/20 dark:border-white/20 rounded-md font-bold bg-black/5 dark:bg-white/5 uppercase backdrop-blur-md">{movieData.quality}</span>}
            </h1>
            <p className="text-gray-500 dark:text-[#808191] mt-1 md:mt-2 text-sm md:text-base font-medium tracking-wide">
              {movieData?.origin_name || 'Let there be carnage'}
            </p>
          </div>
          
          {/* Badges & Action Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full mt-1 gap-3 md:gap-4">
            <div className="flex gap-2 md:gap-4 flex-wrap justify-center md:justify-start">
              <span className="bg-black/5 dark:bg-white/10 text-black dark:text-white px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[0.75rem] md:text-sm font-bold shadow-inner border border-black/5 dark:border-white/5">{movieData?.type || movieData?.lang || 'Action'}</span>
              <span className="bg-black/5 dark:bg-white/10 text-black dark:text-white px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[0.75rem] md:text-sm font-bold shadow-inner border border-black/5 dark:border-white/5">16+</span>
              <span className="bg-black/5 dark:bg-white/10 text-[#D4AF37] dark:text-[#FFD700] px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[0.75rem] md:text-sm font-bold shadow-inner flex items-center gap-1.5 border border-black/5 dark:border-white/5"><Star size={14} className="fill-current" /> {movieData?.tmdb?.vote_average || '4.1'}</span>
            </div>
            
            <div className="flex items-center gap-4 md:gap-5">
              <button className="text-gray-500 dark:text-[#808191] hover:text-[#3B82F6] transition-all hover:scale-110 active:scale-95"><Share2 size={24} /></button>
              <button className={`transition-all hover:scale-110 active:scale-95 ${isLiked ? 'text-[#3B82F6]' : 'text-gray-500 dark:text-[#808191] hover:text-[#3B82F6]'}`} onClick={() => movieData && toggleFavorite(movieData)}>
                <Heart size={24} className={isLiked ? 'fill-current drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : ''} />
              </button>
            </div>
          </div>
          
          {/* Story Line */}
          <div className="w-full text-left mt-2">
            <h2 className="text-black dark:text-white font-bold text-[1.2rem] mb-2 tracking-tight">Story Line</h2>
            <p className="text-gray-600 dark:text-[#808191] text-[0.95rem] leading-[1.6] opacity-90">
              {isLoading ? (
                <span className="block w-full h-16 bg-black/5 dark:bg-white/10 animate-pulse rounded-lg"></span>
              ) : movieData?.content ? movieData.content.replace(/<[^>]*>?/gm, '').substring(0, 180) + '... ' : 'Đang cập nhật nội dung phim... '}
              {movieData?.content && <span className="text-[#3B82F6] font-bold cursor-pointer hover:underline">More</span>}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex max-md:flex-col w-full gap-3 mt-2 md:mt-4">
            <button className="flex-1 flex max-md:w-full items-center justify-center gap-2 px-6 py-3.5 md:py-4 bg-[#3B82F6] text-white rounded-xl md:rounded-[1rem] font-bold shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:bg-[#2563EB] hover:-translate-y-1 transition-all text-[0.95rem] md:text-[1rem]" onClick={() => episodes.length > 0 && handleSelectEpisode(0)}>
              <PlayCircle size={22} className="fill-current drop-shadow-md" /> Play
            </button>
            <div className="flex w-full gap-3">
              <button className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 md:py-4 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-xl md:rounded-[1rem] font-bold border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/20 hover:-translate-y-1 transition-all text-[0.9rem] md:text-[1rem] relative" onClick={() => setIsWatchPartyOpen(true)}>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#3B82F6] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(59,130,246,0.5)] animate-bounce z-10">
                    {unreadCount}
                  </span>
                )}
                <Users size={20} /> Watch Party
              </button>
              <button className="flex-1 flex items-center justify-center px-6 py-3.5 md:py-4 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-xl md:rounded-[1rem] border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all hover:-translate-y-1" onClick={handleDownload} title="Tải Về">
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Episodes Panel */}
      <div className="w-full lg:w-[320px] xl:w-[360px] lg:sticky lg:top-[100px] lg:max-h-[calc(100vh-120px)] flex flex-col bg-white dark:bg-[#252836] border border-black/5 dark:border-white/5 rounded-[40px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] shadow-[0_20px_40px_rgba(18,38,63,0.05)] max-md:relative max-md:top-0 max-md:min-h-[350px] max-md:max-h-none">
        <div className="flex flex-col mb-6 gap-4">
          <div className="text-[1.4rem] font-black text-black dark:text-white flex items-center gap-2.5">
            <MonitorPlay size={24} className="text-[#3B82F6] fill-current" /> Chọn Tập
          </div>
          <div className="flex gap-3 items-center w-full justify-between">
            <span className="text-[0.85rem] font-bold bg-[#1A1C23] dark:bg-[#1A1C23] bg-[#F1F5F9] px-4 py-2.5 rounded-xl text-[#808191] dark:text-[#808191] text-black whitespace-nowrap">
              {episodes.length} Tập
            </span>
            <div className="flex items-center gap-2 ml-auto mr-2">
              <span className="text-[0.8rem] font-bold text-[#808191]">Tự động chuyển tập</span>
              <button 
                className={`w-10 h-5 rounded-full relative transition-colors ${isAutoPlay ? 'bg-[#3B82F6]' : 'bg-[#353945] dark:bg-[#353945] bg-[#E2E8F0]'}`}
                onClick={() => setIsAutoPlay(!isAutoPlay)}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${isAutoPlay ? 'left-[22px]' : 'left-0.5'}`}></div>
              </button>
            </div>
            {totalChunks > 1 && (
              <select 
                className="bg-white dark:bg-[#1A1C23] border border-black/5 dark:border-transparent text-black dark:text-white rounded-xl px-4 py-2.5 text-[15px] font-bold outline-none cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-[#353945]"
                value={currentEpChunk}
                onChange={(e) => setCurrentEpChunk(parseInt(e.target.value))}
              >
                {Array.from({length: totalChunks}).map((_, i) => {
                  const start = i * EP_CHUNK_SIZE + 1;
                  const end = Math.min((i + 1) * EP_CHUNK_SIZE, episodes.length);
                  return <option key={i} value={i} className="bg-white dark:bg-[#252836] text-black dark:text-white">Tập {start} - {end}</option>;
                })}
              </select>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2.5 content-start pr-2 custom-scrollbar">
          {epsToRender.map((ep, idx) => {
            const realIdx = startIdx + idx;
            const isActive = activeEpisode && activeEpisode.slug === ep.slug;
            return (
              <button 
                key={ep.slug}
                className={`px-1 py-3 rounded-xl text-[0.9rem] font-black transition-all block text-center whitespace-nowrap overflow-hidden text-ellipsis w-full ${isActive ? 'bg-[#3B82F6] text-white shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-105 z-[2]' : 'bg-[#1A1C23] dark:bg-[#1A1C23] bg-[#F8FAFC] border border-transparent text-[#808191] hover:bg-[#353945] dark:hover:bg-[#353945] hover:bg-[#E2E8F0] hover:text-black dark:hover:text-white hover:-translate-y-0.5'}`}
                title={ep.name}
                onClick={() => handleSelectEpisode(realIdx)}
              >
                {ep.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
