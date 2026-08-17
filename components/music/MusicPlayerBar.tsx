'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle,
  Volume2, VolumeX, ListMusic, Users, ChevronUp, ChevronDown,
  Repeat1, Music2,
} from 'lucide-react';
import { useMusicContext } from '@/lib/musicStore';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const NEO_COLORS: Record<string, string> = {
  purple: '#B28DFF',
  ocean:  '#6EE7B7',
  rose:   '#FFA6C9',
  forest: '#86EFAC',
  sunset: '#FDBA74',
  mono:   '#D4D4D4',
};

export const MusicPlayerBar = () => {
  const {
    currentTrackId, tracks, isPlaying, isLoop, isShuffle,
    volume, progress, duration, isMusicBarVisible, colorTheme,
    togglePlay, nextTrack, prevTrack, toggleLoop, toggleShuffle,
    setVolume, seekTo, setIsQueueOpen, setIsMusicPartyOpen,
  } = useMusicContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const accentColor = NEO_COLORS[colorTheme] || NEO_COLORS.purple;
  const currentTrack = tracks.find(t => t.id === currentTrackId);

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    seekTo(percent);
  };

  const handleSliderDrag = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    seekTo(percent);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleSliderDrag);
      window.addEventListener('mouseup', () => setIsDragging(false));
      return () => {
        window.removeEventListener('mousemove', handleSliderDrag);
        window.removeEventListener('mouseup', () => setIsDragging(false));
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  if (!isMusicBarVisible) return null;

  const elapsedSeconds = duration > 0 ? (progress / 100) * duration : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 150 }}
        animate={{ y: 0 }}
        exit={{ y: 150 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-[100px] md:bottom-0 left-0 md:left-[220px] right-0 z-[1500] select-none border-t-2 border-b-2 md:border-b-0 border-[var(--terminal-border-strong)] bg-[var(--terminal-bg-2)] shadow-[0px_-4px_0px_var(--terminal-cyan)]"
      >
        {/* Timeline Slider - Brutalist squiggly (Material 3 style) */}
        <div
          ref={sliderRef}
          className="relative w-full h-5 cursor-pointer bg-[var(--terminal-panel)] border-b-2 border-[var(--terminal-border-strong)] overflow-hidden"
          onClick={handleSliderClick}
          onMouseDown={() => setIsDragging(true)}
        >
          {/* Unplayed straight line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-[var(--terminal-cyan)] opacity-20 pointer-events-none" />

          {/* Track fill with squiggly animation */}
          <motion.div
            className="absolute left-0 top-0 h-full border-r-[3px] border-[var(--terminal-border-strong)]"
            style={{ 
              backgroundColor: accentColor,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='20' viewBox='0 0 32 20'%3E%3Cpath d='M0 10 Q 8 2, 16 10 T 32 10' fill='none' stroke='%23311B56' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundSize: '32px 20px',
              backgroundRepeat: 'repeat-x',
            }}
            animate={{ 
               width: `${progress}%`,
               backgroundPosition: isPlaying ? ['0px center', '-32px center'] : '0px center'
            }}
            transition={{ 
               width: { duration: isDragging ? 0 : 0.2, ease: 'linear' },
               backgroundPosition: { duration: 0.8, repeat: Infinity, ease: 'linear' }
            }}
          />
        </div>

        {/* Main Bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 md:px-6 md:py-3 relative">
          {/* Thumbnail + info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div
              className="relative w-12 h-12 border border-[var(--terminal-border-strong)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] overflow-hidden shrink-0 cursor-pointer bg-[var(--terminal-panel)]"
              onClick={() => setIsExpanded(!isExpanded)}
              whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: 'none' }}
            >
              {currentTrack ? (
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover grayscale-[20%] contrast-125"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: accentColor }}>
                  <Music2 size={20} className="text-[var(--terminal-bg-2)]" />
                </div>
              )}
            </motion.div>

            <div className="min-w-0 flex-1">
              <div className="font-black text-sm truncate uppercase tracking-tight text-[var(--terminal-ink)]">
                {currentTrack?.title || 'Chưa chọn bài'}
              </div>
              <div className="text-xs font-bold truncate opacity-60 text-[var(--terminal-ink)]">
                {currentTrack?.artist || '—'} · {formatTime(elapsedSeconds)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={toggleShuffle}
              className={`p-2 border border-[var(--terminal-border-strong)] transition-all hidden md:flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
                ${isShuffle ? 'text-[var(--terminal-ink)]' : 'bg-[var(--terminal-panel)] text-[var(--terminal-ink)]'}`}
              style={{ background: isShuffle ? accentColor : 'var(--terminal-panel)' }}
            >
              <Shuffle size={16} />
            </button>

            <motion.button
              onClick={prevTrack}
              className="p-2 border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] text-[var(--terminal-ink)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              whileTap={{ scale: 0.9 }}
            >
              <SkipBack size={20} />
            </motion.button>

            {/* Play Button */}
            <motion.button
              onClick={togglePlay}
              className="w-12 h-12 flex items-center justify-center border border-[var(--terminal-border-strong)] text-[var(--terminal-ink)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              style={{ background: accentColor }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPlaying ? 'pause' : 'play'}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <motion.button
              onClick={nextTrack}
              className="p-2 border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] text-[var(--terminal-ink)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              whileTap={{ scale: 0.9 }}
            >
              <SkipForward size={20} />
            </motion.button>

            <button
              onClick={toggleLoop}
              className={`p-2 border border-[var(--terminal-border-strong)] transition-all hidden md:flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
                ${isLoop ? 'text-[var(--terminal-ink)]' : 'bg-[var(--terminal-panel)] text-[var(--terminal-ink)]'}`}
              style={{ background: isLoop ? accentColor : 'var(--terminal-panel)' }}
            >
              {isLoop ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
            {/* Volume */}
            <div className="items-center gap-2 hidden lg:flex">
              <button onClick={handleMuteToggle} className="text-[var(--terminal-ink)]">
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div className="relative w-24 h-3 bg-[var(--terminal-panel)] border border-[var(--terminal-border-strong)] cursor-pointer">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={e => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                />
                <div className="h-full border-r border-[var(--terminal-border-strong)]" style={{ width: `${volume}%`, background: accentColor }} />
              </div>
            </div>

            {/* Queue */}
            <motion.button
              className="p-2 border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] text-[var(--terminal-ink)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsQueueOpen(true)}
            >
              <ListMusic size={18} />
            </motion.button>

            {/* Party */}
            <motion.button
              className="p-2 border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] text-[var(--terminal-ink)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMusicPartyOpen(true)}
            >
              <Users size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
