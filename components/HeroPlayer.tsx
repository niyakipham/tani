'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, Heart, Download, Share2, Star, Clock, MonitorPlay, Cast, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Subtitles, SkipForward, Users } from 'lucide-react';
import { useAppContext } from '@/lib/store';
import { fetchMovieDetails } from '@/lib/api';
import Hls from 'hls.js';

const EP_CHUNK_SIZE = 100;

export const HeroPlayer = () => {
  const { currentMovieSlug, favorites, toggleFavorite, history, addToHistory, updateHistoryProgress, addDownload, setIsWatchPartyOpen, roomId, sendP2PMessage, setVideoSyncCallback } = useAppContext();
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
  
  // Subtitle States
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [currentSubtitleIdx, setCurrentSubtitleIdx] = useState<number>(-1);
  const [showSubMenu, setShowSubMenu] = useState(false);

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
              />

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
                    {/* Play/Pause */}
                    <button onClick={togglePlay} className="text-white hover:text-[#3B82F6] transition-colors hover:scale-110 active:scale-95">
                      {isPlaying ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current" />}
                    </button>
                    
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
        
        <div className="flex flex-col gap-5 mt-8 min-w-0 z-[2] max-md:mt-3 max-md:gap-4 max-md:px-5">
          <div className="flex flex-wrap gap-3 text-[0.85rem] font-bold text-white items-center">
            {isLoading ? (
              <div className="w-[60%] h-6 bg-[#F1F5F9] dark:bg-[#252836] rounded-2xl animate-pulse"></div>
            ) : movieData ? (
              <>
                <span className="text-black bg-white px-3 py-1 rounded-full font-black flex items-center gap-1.5 dark:text-[#13141C] dark:bg-white"><Star size={14} className="fill-current" /> {movieData.tmdb?.vote_average || '9.5'}</span>
                <span className="bg-[#F1F5F9] dark:bg-[#353945] px-3 py-1 rounded-full border border-transparent text-black dark:text-white">{movieData.quality || 'FHD'}</span>
                <span className="bg-[#F1F5F9] dark:bg-[#353945] px-3 py-1 rounded-full border border-transparent text-black dark:text-white">{movieData.lang || 'Vietsub'}</span>
                <span className="bg-[#F1F5F9] dark:bg-[#353945] px-3 py-1 rounded-full border border-transparent text-black dark:text-white">{movieData.year}</span>
                <span className="text-[#808191] flex items-center gap-1.5"><Clock size={14} /> {movieData.time || '24 Phút/Tập'}</span>
              </>
            ) : null}
          </div>
          
          <h1 className="text-[3.5rem] max-md:text-[2.2rem] font-black text-black dark:text-white leading-[1.1] tracking-[-2px] break-words capitalize">
            {isLoading ? (
              <>
                <div className="w-[80%] h-10 bg-[#F1F5F9] dark:bg-[#252836] rounded-2xl animate-pulse mb-2"></div>
                <div className="w-[50%] h-10 bg-[#F1F5F9] dark:bg-[#252836] rounded-2xl animate-pulse"></div>
              </>
            ) : movieData?.name || 'Chọn một bộ phim'}
          </h1>
          
          <div className="flex flex-wrap gap-4 items-center mt-2 max-md:grid max-md:grid-cols-2 max-md:gap-3 max-md:w-full">
            <button className="flex items-center justify-center gap-2.5 px-8 py-3.5 max-md:px-2 max-md:py-3.5 bg-[#3B82F6] text-white border-none rounded-full text-base max-md:text-[0.9rem] font-bold transition-all hover:bg-[#2563EB] hover:-translate-y-[3px] shadow-[0_4px_15px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.6)] max-md:w-full" onClick={() => episodes.length > 0 && handleSelectEpisode(0)}>
              <PlayCircle size={22} className="fill-current" /> Xem Ngay
            </button>
            <button className={`flex items-center justify-center gap-2.5 px-8 py-3.5 max-md:px-2 max-md:py-3.5 bg-transparent border rounded-full text-base max-md:text-[0.9rem] font-bold transition-all max-md:w-full ${isLiked ? 'bg-[#FF4757]/10 border-[#FF4757]/30 text-[#FF4757] hover:bg-[#FF4757]/20' : 'border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:-translate-y-[2px] hover:border-black/20 dark:hover:border-white/20'}`} onClick={() => movieData && toggleFavorite(movieData)}>
              <Heart size={20} className={isLiked ? 'fill-current' : ''} /> <span>{isLiked ? 'Đã Lưu' : 'Lưu'}</span>
            </button>
            <button className="flex items-center justify-center gap-2.5 px-8 py-3.5 max-md:px-2 max-md:py-3.5 bg-transparent border border-black/10 dark:border-white/10 rounded-full text-base max-md:text-[0.9rem] font-bold transition-all text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:-translate-y-[2px] hover:border-black/20 dark:hover:border-white/20 max-md:w-full" onClick={handleDownload}>
              {isDownloading ? (
                <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> <span>{downloadProgress}%</span></>
              ) : (
                <><Download size={20} /> <span>Tải Về</span></>
              )}
            </button>
            <button className="flex items-center justify-center gap-2.5 px-8 py-3.5 max-md:px-2 max-md:py-3.5 bg-transparent border border-black/10 dark:border-white/10 rounded-full text-base max-md:text-[0.9rem] font-bold transition-all text-black dark:text-white hover:bg-[#3B82F6] hover:text-white hover:border-transparent hover:-translate-y-[2px] max-md:w-full group" onClick={() => setIsWatchPartyOpen(true)}>
              <Users size={20} className="group-hover:animate-bounce" /> <span className="max-md:hidden">Xem Chung</span>
            </button>
            <button className="flex items-center justify-center gap-2.5 px-8 py-3.5 max-md:px-2 max-md:py-3.5 bg-transparent border border-black/10 dark:border-white/10 rounded-full text-base max-md:text-[0.9rem] font-bold transition-all text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:-translate-y-[2px] hover:border-black/20 dark:hover:border-white/20 max-md:w-full" onClick={() => alert("Đã copy link phim vào khay nhớ tạm!")}>
              <Share2 size={20} />
            </button>
            <button className="flex items-center justify-center gap-2.5 px-8 py-3.5 max-md:px-2 max-md:py-3.5 bg-transparent border border-black/10 dark:border-white/10 rounded-full text-base max-md:text-[0.9rem] font-bold transition-all text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:-translate-y-[2px] hover:border-black/20 dark:hover:border-white/20 max-md:w-full" onClick={handleCast} title="Cast to Device">
              <Cast size={20} />
            </button>
          </div>

          <div className="text-base text-[#808191] leading-[1.8] break-words font-normal max-w-[800px] max-md:text-[0.95rem]">
            {isLoading ? (
              <>
                <div className="w-full h-4 bg-[#F1F5F9] dark:bg-[#252836] rounded-2xl animate-pulse mb-2"></div>
                <div className="w-[90%] h-4 bg-[#F1F5F9] dark:bg-[#252836] rounded-2xl animate-pulse mb-2"></div>
                <div className="w-[70%] h-4 bg-[#F1F5F9] dark:bg-[#252836] rounded-2xl animate-pulse"></div>
              </>
            ) : movieData?.content ? movieData.content.replace(/<[^>]*>?/gm, '').substring(0, 450) + '...' : 'Đang cập nhật...'}
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
