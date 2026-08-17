'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, Repeat, Shuffle, Music2, Repeat1,
  Clock, BarChart3, Heart, ListMusic, Disc3,
} from 'lucide-react';
import { useMusicContext } from '@/lib/musicStore';

const NEO_COLORS: Record<string, string> = {
  purple: '#B28DFF',
  ocean:  '#6EE7B7',
  rose:   '#FFA6C9',
  forest: '#86EFAC',
  sunset: '#FDBA74',
  mono:   '#D4D4D4',
};

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function useDigitalClock() {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

export const MusicDashboard = () => {
  const {
    currentTrackId, tracks, isPlaying, isLoop, isShuffle,
    progress, duration, colorTheme, playlists,
    togglePlay, toggleLoop, toggleShuffle,
    playTrack, setIsAddTxtOpen, setIsCreatePlaylistOpen,
  } = useMusicContext();

  const accentColor = NEO_COLORS[colorTheme] || NEO_COLORS.purple;
  const currentTrack = tracks.find(t => t.id === currentTrackId);
  const now = useDigitalClock();
  const [vinylAngle, setVinylAngle] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => setVinylAngle(a => (a + 1) % 360), 30);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const hours = now ? now.getHours().toString().padStart(2, '0') : '--';
  const minutes = now ? now.getMinutes().toString().padStart(2, '0') : '--';
  const seconds = now ? now.getSeconds().toString().padStart(2, '0') : '--';
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const currentDayName = now ? dayNames[now.getDay()] : '---';
  const currentDate = now ? `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}` : '--/--/----';

  const elapsedSec = duration > 0 ? (progress / 100) * duration : 0;
  const recentTracks = tracks.slice(-5).reverse();

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Music2 size={16} />, label: 'Bài hát', value: tracks.length },
          { icon: <ListMusic size={16} />, label: 'Playlist', value: playlists.length },
          { icon: <BarChart3 size={16} />, label: 'Queue', value: 0 },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] p-4 flex flex-col gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-all"
          >
            <div className="flex items-center gap-2" style={{ color: 'var(--terminal-cyan)' }}>
              {stat.icon}
              <span className="text-xs font-bold uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-3xl font-black text-[var(--terminal-ink)]">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Row: Now Playing + Clock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Now Playing Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-[var(--terminal-border-strong)] shadow-[0_12px_36px_rgba(0,0,0,0.28)] bg-[var(--terminal-panel)] relative overflow-hidden flex flex-col h-full min-h-[360px]"
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, var(--terminal-border-strong) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 p-6 flex flex-col h-full gap-6 justify-between flex-1">
            {/* Vinyl Record */}
            <div className="flex items-center justify-center pt-4">
              <div className="relative">
                <motion.div
                  className="w-48 h-48 rounded-full overflow-hidden border border-[var(--terminal-border-strong)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] bg-[var(--terminal-panel)]"
                  style={{ rotate: vinylAngle }}
                >
                  {currentTrack ? (
                    <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--terminal-bg-2)]">
                      <Disc3 size={64} className="text-[var(--terminal-ink)]" />
                    </div>
                  )}
                </motion.div>
                {/* Center hole */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] shadow-inner" />
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center bg-[var(--terminal-panel)] border border-[var(--terminal-border-strong)] p-3 shadow-[0_6px_16px_rgba(0,0,0,0.2)]">
              <h2 className="text-xl font-black truncate uppercase tracking-tight text-[var(--terminal-ink)]">
                {currentTrack?.title || '— Chưa phát bài nào —'}
              </h2>
              <p className="text-sm font-bold opacity-80 mt-1 text-[var(--terminal-ink)]">
                {currentTrack?.artist || 'Chọn một bài để bắt đầu'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <motion.button
                onClick={toggleShuffle}
                className="p-3 border border-[var(--terminal-border-strong)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                style={{ background: isShuffle ? accentColor : 'var(--terminal-panel)', color: isShuffle ? 'var(--terminal-bg-2)' : 'var(--terminal-ink)' }}
              >
                <Shuffle size={20} />
              </motion.button>

              <motion.button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full border border-[var(--terminal-border-strong)] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-shadow"
                style={{ background: accentColor, color: 'var(--terminal-bg-2)' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isPlaying ? 'p' : 'pp'}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              <motion.button
                onClick={toggleLoop}
                className="p-3 border border-[var(--terminal-border-strong)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                style={{ background: isLoop ? accentColor : 'var(--terminal-panel)', color: isLoop ? 'var(--terminal-bg-2)' : 'var(--terminal-ink)' }}
              >
                {isLoop ? <Repeat1 size={20} /> : <Repeat size={20} />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Clock Component */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-[var(--terminal-border-strong)] shadow-[0_12px_36px_rgba(0,0,0,0.28)] bg-[var(--terminal-panel)] p-6 flex flex-col items-center justify-center gap-6"
        >
          <div className="flex items-center gap-2 text-[var(--terminal-ink)] bg-[var(--terminal-bg-2)] px-4 py-2 border border-[var(--terminal-border-strong)]">
            <Clock size={16} />
            <span className="text-sm font-black uppercase tracking-widest">Đồng Hồ</span>
          </div>

          {/* Digital Clock */}
          <div className="flex items-center gap-2">
            {[hours, minutes, seconds].map((unit, i) => (
              <React.Fragment key={i}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={unit}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="border border-[var(--terminal-border-strong)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] px-5 py-4 min-w-[80px] text-center font-black text-5xl md:text-6xl tabular-nums text-[var(--terminal-bg-2)]"
                    style={{ background: accentColor }}
                  >
                    {unit}
                  </motion.div>
                </AnimatePresence>
                {i < 2 && (
                  <motion.span
                    className="text-4xl font-black text-[var(--terminal-ink)]"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    :
                  </motion.span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="text-center mt-2 border-t-2 border-b-2 border-[var(--terminal-border-strong)] py-3 w-full">
            <div className="text-xl font-black uppercase text-[var(--terminal-ink)]">
              {currentDayName}
            </div>
            <div className="text-sm font-bold opacity-80 tracking-widest text-[var(--terminal-ink)]">
              {currentDate}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 w-full mt-2">
            <motion.button
              className="flex-1 py-3 border border-[var(--terminal-border-strong)] text-sm font-black uppercase tracking-widest shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-[var(--terminal-bg-2)]"
              style={{ background: accentColor }}
              onClick={() => setIsAddTxtOpen(true)}
            >
              + Thêm Nhạc
            </motion.button>
            <motion.button
              className="flex-1 py-3 border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] text-[var(--terminal-ink)] text-sm font-black uppercase tracking-widest shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              onClick={() => setIsCreatePlaylistOpen(true)}
            >
              + Playlist
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Recent Tracks */}
      {recentTracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-[var(--terminal-border-strong)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] bg-[var(--terminal-panel)] p-6"
        >
          <h3 className="text-lg font-black mb-4 flex items-center gap-2 uppercase tracking-widest text-[var(--terminal-ink)]">
            <Heart size={20} fill={accentColor} color="var(--terminal-bg-2)" strokeWidth={2} />
            Phát Gần Đây
          </h3>
          <div className="flex flex-col gap-3">
            {recentTracks.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 border-2 border-transparent hover:border-[var(--terminal-border-strong)] hover:bg-[var(--terminal-border-soft)] cursor-pointer transition-all"
                style={{
                  background: currentTrackId === track.id ? 'rgba(122,216,255,0.12)' : 'transparent',
                  borderColor: currentTrackId === track.id ? 'var(--terminal-cyan)' : 'transparent',
                }}
                onClick={() => playTrack(track.id, tracks.map(t => t.id))}
              >
                <div className="w-12 h-12 border border-[var(--terminal-border-strong)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] bg-[var(--terminal-panel)] overflow-hidden shrink-0">
                  <img src={track.thumbnail} alt="" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-black truncate text-[var(--terminal-ink)] uppercase">{track.title}</div>
                  <div className="text-xs font-bold opacity-70 truncate text-[var(--terminal-ink)]">{track.artist}</div>
                </div>
                {currentTrackId === track.id && isPlaying && (
                  <div className="flex items-end gap-1 h-6 shrink-0 bg-[var(--terminal-panel)] border border-[var(--terminal-border-strong)] p-1 shadow-[0_6px_16px_rgba(0,0,0,0.2)]">
                    {[1, 2, 3].map((_, bi) => (
                      <motion.div
                        key={bi}
                        className="w-1.5 bg-[var(--terminal-cyan)]"
                        animate={{ height: ['4px', '16px', '4px'] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: bi * 0.15 }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
