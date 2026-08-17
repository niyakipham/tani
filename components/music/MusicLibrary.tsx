'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Plus, Trash2, Search, Music2, MoreVertical, ListPlus,
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
  if (!seconds || isNaN(seconds)) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const MusicLibrary = () => {
  const {
    tracks, currentTrackId, isPlaying, colorTheme,
    playTrack, removeTrack, addToQueue, setIsAddTxtOpen,
  } = useMusicContext();

  const accentColor = NEO_COLORS[colorTheme] || NEO_COLORS.purple;
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = tracks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase())
  );

  const handlePlay = (trackId: string) => {
    playTrack(trackId, filtered.map(t => t.id));
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60 text-[var(--terminal-ink)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài hát..."
              className="w-full pl-11 pr-4 py-3 text-sm font-bold outline-none border border-[var(--terminal-border-strong)] shadow-[0_6px_16px_rgba(0,0,0,0.2)] bg-[var(--terminal-panel)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all placeholder:opacity-50 text-[var(--terminal-ink)]"
            />
          </div>
          <div className="flex border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] shadow-[0_6px_16px_rgba(0,0,0,0.2)]">
            {(['list', 'grid'] as const).map((v, i) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-3 text-sm font-black transition-colors ${i === 0 ? 'border-r border-[var(--terminal-border-strong)]' : ''}`}
                style={{
background: view === v ? accentColor : 'transparent',
color: view === v ? 'var(--terminal-bg-2)' : 'var(--terminal-ink)',
                }}
              >
                {v === 'list' ? '≡' : '⊞'}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={() => setIsAddTxtOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 border border-[var(--terminal-border-strong)] text-[var(--terminal-bg-2)] text-sm font-black uppercase tracking-widest shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all shrink-0"
          style={{ background: accentColor }}
        >
          <Plus size={18} /> Thêm Nhạc
        </motion.button>
      </div>

      {/* Count */}
      <div className="text-xs font-black uppercase tracking-widest opacity-70 text-[var(--terminal-ink)]">
        {filtered.length} BÀI HÁT {search ? `(LỌC TỪ ${tracks.length})` : ''}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6 border border-[var(--terminal-border-strong)] border-dashed bg-[var(--terminal-panel)]">
          <div className="w-24 h-24 flex items-center justify-center border border-[var(--terminal-border-strong)] shadow-[0_10px_30px_rgba(0,0,0,0.25)]" style={{ background: accentColor }}>
            <Music2 size={40} className="text-[var(--terminal-bg-2)]" />
          </div>
          <div className="text-center text-[var(--terminal-ink)]">
            <div className="font-black text-xl uppercase tracking-tight">
              {search ? 'Không tìm thấy bài nào' : 'Thư viện trống'}
            </div>
            <div className="text-sm font-bold opacity-70 mt-2">
              {search ? 'Thử tìm với từ khóa khác xem sao' : 'Thêm danh sách .txt để quẩy nào!'}
            </div>
          </div>
          {!search && (
            <button
              onClick={() => setIsAddTxtOpen(true)}
              className="flex items-center gap-2 px-6 py-3 border border-[var(--terminal-border-strong)] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-[var(--terminal-bg-2)]"
              style={{ background: accentColor }}
            >
              <Plus size={18} /> Thêm Nhạc Ngay
            </button>
          )}
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all relative flex flex-col"
              onClick={() => handlePlay(track.id)}
            >
              <div className="aspect-square relative border-b-2 border-[var(--terminal-border-strong)] bg-[var(--terminal-cyan)]">
                <img src={track.thumbnail} alt="" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full border border-[var(--terminal-border-strong)] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.25)]" style={{ background: accentColor }}>
                    <Play size={28} fill="currentColor" className="text-[var(--terminal-bg-2)] translate-x-[2px]" />
                  </div>
                </div>
                {currentTrackId === track.id && isPlaying && (
                  <div className="absolute bottom-2 right-2 flex items-end gap-1 bg-[var(--terminal-panel)] border border-[var(--terminal-border-strong)] p-1.5 shadow-[0_6px_16px_rgba(0,0,0,0.2)]">
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
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between" style={{ background: currentTrackId === track.id ? 'rgba(122,216,255,0.12)' : 'var(--terminal-panel)' }}>
                <div>
                  <div className="text-base font-black truncate uppercase tracking-tight text-[var(--terminal-ink)]">{track.title}</div>
                  <div className="text-xs font-bold opacity-70 truncate text-[var(--terminal-ink)]">{track.artist}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((track, i) => {
            const isActive = currentTrackId === track.id;
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 p-3 border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] cursor-pointer group shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all relative"
                style={{
                  background: isActive ? 'rgba(122,216,255,0.12)' : 'var(--terminal-panel)',
                }}
                onClick={() => handlePlay(track.id)}
              >
                {/* Number / Playing indicator */}
                <div className="w-8 flex justify-center shrink-0">
                  {isActive && isPlaying ? (
                    <div className="flex items-end gap-[2px] h-4">
                      {[1, 2, 3].map((_, bi) => (
                        <motion.div
                          key={bi}
                          className="w-[2px] bg-[var(--terminal-cyan)]"
                          animate={{ height: ['4px', '16px', '4px'] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: bi * 0.12 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm font-black opacity-40 group-hover:hidden text-[var(--terminal-ink)]">{i + 1}</span>
                  )}
                  <Play
                    size={16}
                    className="hidden group-hover:block text-[var(--terminal-ink)]"
                    fill="currentColor"
                  />
                </div>

                {/* Thumbnail */}
                <div className="w-12 h-12 border border-[var(--terminal-border-strong)] overflow-hidden shrink-0">
                  <img src={track.thumbnail} alt="" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-base font-black truncate uppercase tracking-tight text-[var(--terminal-ink)]">
                    {track.title}
                  </div>
                  <div className="text-xs font-bold opacity-70 truncate text-[var(--terminal-ink)]">{track.artist}</div>
                </div>

                {/* Duration */}
                {track.duration > 0 && (
                  <div className="text-xs font-bold opacity-60 shrink-0 text-[var(--terminal-ink)]">
                    {formatTime(track.duration)}
                  </div>
                )}

                {/* Context Menu */}
                <div className="relative shrink-0 ml-2">
                  <button
                    className="p-2 border-2 border-transparent hover:border-[var(--terminal-border-strong)] transition-all text-[var(--terminal-ink)]"
                    onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === track.id ? null : track.id); }}
                  >
                    <MoreVertical size={18} />
                  </button>

                  <AnimatePresence>
                    {openMenuId === track.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -5 }}
                        className="absolute right-0 top-10 border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] z-10 min-w-[180px] flex flex-col"
                      >
                        {[
                          {
                            icon: <ListPlus size={16} />,
                            label: 'Thêm vào Queue',
                            action: () => { addToQueue(track.id); setOpenMenuId(null); },
                          },
                          {
                            icon: <Trash2 size={16} />,
                            label: 'Xóa khỏi thư viện',
                            action: () => { removeTrack(track.id); setOpenMenuId(null); },
                            danger: true,
                          },
                        ].map((item, mi) => (
                          <button
                            key={mi}
                            onClick={e => { e.stopPropagation(); item.action(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-black uppercase tracking-wider text-left transition-colors hover:bg-[var(--terminal-bg-2)] ${mi > 0 ? 'border-t-2 border-[var(--terminal-border-strong)]' : ''}`}
                            style={{ color: item.danger ? '#ef4444' : 'var(--terminal-cyan)' }}
                          >
                            {item.icon} {item.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
