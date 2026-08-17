'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Play, GripVertical, ListMusic, Music2 } from 'lucide-react';
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
  if (!seconds || isNaN(seconds)) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const MusicQueue = () => {
  const {
    isQueueOpen, setIsQueueOpen,
    queue, removeFromQueue, clearQueue,
    tracks, currentTrackId, playTrack, colorTheme,
  } = useMusicContext();

  const accentColor = NEO_COLORS[colorTheme] || NEO_COLORS.purple;
  const queueTracks = queue.map(id => tracks.find(t => t.id === id)).filter(Boolean) as typeof tracks;

  return (
    <AnimatePresence>
      {isQueueOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2500]"
            style={{ background: 'rgba(49,27,86,0.6)', backdropFilter: 'blur(2px)' }}
            onClick={() => setIsQueueOpen(false)}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-[88px] md:bottom-0 w-[380px] max-md:w-full z-[2501] flex flex-col bg-[var(--terminal-bg-2)] border-l-2 border-[var(--terminal-border-strong)] shadow-[-4px_0_0_var(--terminal-cyan)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b-2 border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-[var(--terminal-border-strong)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] flex items-center justify-center" style={{ background: accentColor }}>
                  <ListMusic size={20} className="text-[var(--terminal-bg-2)]" />
                </div>
                <div>
                  <h2 className="font-black text-lg uppercase tracking-tight text-[var(--terminal-ink)]">Hàng Đợi</h2>
                  <p className="text-xs font-bold opacity-70 text-[var(--terminal-ink)]">{queueTracks.length} BÀI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {queueTracks.length > 0 && (
                  <motion.button
                    onClick={clearQueue}
                    className="text-xs px-3 py-2 border border-[var(--terminal-border-strong)] font-black uppercase tracking-widest bg-[var(--terminal-panel)] text-[#ef4444] shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    whileTap={{ scale: 0.95 }}
                  >
                    Xóa Hết
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setIsQueueOpen(false)}
                  className="p-2 border border-[var(--terminal-border-strong)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] bg-[var(--terminal-panel)] text-[var(--terminal-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {queueTracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-70">
                  <div className="p-4 border border-[var(--terminal-border-strong)] border-dashed bg-[var(--terminal-panel)]">
                    <Music2 size={40} className="text-[var(--terminal-bg-2)]" />
                  </div>
                  <div className="text-center text-[var(--terminal-ink)]">
                    <div className="font-black uppercase tracking-widest">Hàng đợi trống</div>
                    <div className="text-xs font-bold mt-1">Thêm nhạc vào list ngay thôi!</div>
                  </div>
                </div>
              ) : (
                queueTracks.map((track, i) => (
                  <motion.div
                    key={`${track.id}-${i}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-2 border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] cursor-pointer group transition-all shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    style={{ background: currentTrackId === track.id ? 'rgba(122,216,255,0.12)' : 'var(--terminal-panel)' }}
                    onClick={() => playTrack(track.id, queue)}
                  >
                    {/* Position */}
                    <div className="w-6 text-center text-sm font-black opacity-40 shrink-0 text-[var(--terminal-ink)]">
                      {i + 1}
                    </div>

                    {/* Drag handle */}
                    <div className="opacity-0 group-hover:opacity-40 shrink-0 text-[var(--terminal-ink)]">
                      <GripVertical size={16} />
                    </div>

                    {/* Thumbnail */}
                    <div className="w-12 h-12 border border-[var(--terminal-border-strong)] overflow-hidden shrink-0 bg-[var(--terminal-cyan)]">
                      <img src={track.thumbnail} alt="" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black truncate uppercase tracking-tight text-[var(--terminal-ink)]">
                        {track.title}
                      </div>
                      <div className="text-xs font-bold opacity-70 flex items-center gap-2 text-[var(--terminal-ink)]">
                        <span className="truncate">{track.artist}</span>
                        {track.duration > 0 && <span className="shrink-0">{formatTime(track.duration)}</span>}
                      </div>
                    </div>

                    {/* Play icon on hover */}
                    <motion.button
                      className="p-2 border border-[var(--terminal-border-strong)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-[var(--terminal-panel)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      style={{ color: 'var(--terminal-cyan)' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={e => { e.stopPropagation(); playTrack(track.id, queue); }}
                    >
                      <Play size={16} fill="currentColor" />
                    </motion.button>

                    {/* Remove */}
                    <motion.button
                      className="p-2 border border-[var(--terminal-border-strong)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-[var(--terminal-panel)] text-[#ef4444] shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      whileTap={{ scale: 0.9 }}
                      onClick={e => { e.stopPropagation(); removeFromQueue(i); }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
