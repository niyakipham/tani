'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, ListMusic, Music2, Check, Trash2 } from 'lucide-react';
import { useMusicContext } from '@/lib/musicStore';

const NEO_COLORS: Record<string, string> = {
  purple: '#B28DFF',
  ocean:  '#6EE7B7',
  rose:   '#FFA6C9',
  forest: '#86EFAC',
  sunset: '#FDBA74',
  mono:   '#D4D4D4',
};

export const CreatePlaylistModal = () => {
  const {
    isCreatePlaylistOpen, setIsCreatePlaylistOpen,
    tracks, playlists, colorTheme,
    createPlaylist, deletePlaylist, updatePlaylist,
    playTrack,
  } = useMusicContext();

  const accentColor = NEO_COLORS[colorTheme] || NEO_COLORS.purple;

  const [step, setStep] = useState<'list' | 'create' | 'detail'>('list');
  const [newName, setNewName] = useState('');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  const handleClose = () => {
    setIsCreatePlaylistOpen(false);
    setStep('list');
    setNewName('');
    setSelectedTrackIds([]);
    setActivePlaylistId(null);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist(newName.trim(), selectedTrackIds);
    setStep('list');
    setNewName('');
    setSelectedTrackIds([]);
  };

  const toggleTrack = (id: string) => {
    setSelectedTrackIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const activePlaylist = playlists.find(p => p.id === activePlaylistId);
  const playlistTracks = activePlaylist
    ? activePlaylist.trackIds.map(id => tracks.find(t => t.id === id)).filter(Boolean) as typeof tracks
    : [];

  return (
    <AnimatePresence>
      {isCreatePlaylistOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000]"
            style={{ background: 'rgba(49,27,86,0.6)', backdropFilter: 'blur(2px)' }}
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[540px] md:max-h-[85vh] bg-[#FAF8F5] border-4 border-[#311B56] shadow-[8px_8px_0px_#311B56] flex flex-col z-[3001]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b-4 border-[#311B56] bg-white">
              <div className="flex items-center gap-4">
                {step !== 'list' && (
                  <motion.button
                    onClick={() => setStep('list')}
                    className="p-2 border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] bg-white text-[#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    ←
                  </motion.button>
                )}
                <h2 className="font-black text-xl uppercase tracking-tight text-[#311B56]">
                  {step === 'list' ? '🎵 Playlist của tôi' : step === 'create' ? 'Tạo Playlist mới' : activePlaylist?.name}
                </h2>
              </div>
              <motion.button
                onClick={handleClose}
                className="p-2 border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] bg-white text-[#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} strokeWidth={3} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-[#FAF8F5]">

              {/* Playlist List */}
              {step === 'list' && (
                <>
                  <motion.button
                    onClick={() => setStep('create')}
                    className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-[#311B56] bg-white text-[#311B56] hover:bg-gray-50 transition-all shadow-[2px_2px_0px_#311B56] uppercase font-black tracking-widest"
                    whileTap={{ scale: 0.97 }}
                  >
                    <Plus size={20} strokeWidth={3} /> Tạo playlist mới
                  </motion.button>

                  {playlists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 border-2 border-[#311B56] bg-white opacity-80">
                      <ListMusic size={48} className="text-[#311B56]" />
                      <div className="text-center text-[#311B56]">
                        <div className="font-black uppercase tracking-widest text-lg">Chưa có playlist nào</div>
                        <div className="text-sm font-bold mt-1">Tạo playlist đầu tiên của Hoàng ngay!</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {playlists.map((pl, i) => {
                        const firstTrack = tracks.find(t => t.id === pl.trackIds[0]);
                        return (
                          <motion.div
                            key={pl.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-4 p-3 border-2 border-[#311B56] bg-white cursor-pointer group shadow-[4px_4px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#311B56] transition-all"
                            onClick={() => { setActivePlaylistId(pl.id); setStep('detail'); }}
                          >
                            <div className="w-16 h-16 border-2 border-[#311B56] overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                              {firstTrack ? (
                                <img src={firstTrack.thumbnail} alt="" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                              ) : (
                                <Music2 size={24} className="text-[#311B56]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-lg uppercase tracking-tight text-[#311B56] truncate">{pl.name}</div>
                              <div className="text-sm font-bold opacity-70 text-[#311B56] mt-1">{pl.trackIds.length} BÀI HÁT</div>
                            </div>
                            <motion.button
                              className="p-3 border-2 border-transparent hover:border-[#ef4444] text-[#ef4444] transition-all bg-white mr-2 opacity-0 group-hover:opacity-100"
                              whileTap={{ scale: 0.8 }}
                              onClick={e => { e.stopPropagation(); deletePlaylist(pl.id); }}
                            >
                              <Trash2 size={20} />
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Create Form */}
              {step === 'create' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="text-sm font-black uppercase tracking-widest mb-3 block text-[#311B56]">Tên playlist</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="VD: Nhạc buổi sáng..."
                      className="w-full px-5 py-4 border-4 border-[#311B56] outline-none text-base font-bold bg-white text-[#311B56] shadow-inner focus:bg-gray-50"
                      autoFocus
                    />
                  </div>

                  <div className="border-4 border-[#311B56] bg-white p-4">
                    <div className="text-sm font-black uppercase tracking-widest mb-4 pb-2 border-b-2 border-[#311B56] text-[#311B56]">
                      Chọn bài hát ({selectedTrackIds.length} đã chọn)
                    </div>
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2">
                      {tracks.map(track => {
                        const isSelected = selectedTrackIds.includes(track.id);
                        return (
                          <div
                            key={track.id}
                            className="flex items-center gap-3 p-3 border-2 border-[#311B56] cursor-pointer transition-colors"
                            style={{
                              background: isSelected ? accentColor : 'white',
                            }}
                            onClick={() => toggleTrack(track.id)}
                          >
                            <div className="w-10 h-10 border-2 border-[#311B56] overflow-hidden shrink-0 bg-[#311B56]">
                              <img src={track.thumbnail} alt="" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-black uppercase tracking-tight text-[#311B56] truncate">{track.title}</div>
                            </div>
                            <div
                              className="w-6 h-6 border-2 border-[#311B56] flex items-center justify-center shrink-0 bg-white"
                            >
                              {isSelected && <Check size={16} strokeWidth={4} className="text-[#311B56]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Playlist Detail */}
              {step === 'detail' && activePlaylist && (
                <div className="flex flex-col gap-3">
                  <div className="text-sm font-black uppercase tracking-widest text-[#311B56] mb-2 px-2 border-b-2 border-[#311B56] pb-2">
                    {playlistTracks.length} BÀI HÁT
                  </div>
                  {playlistTracks.map((track, i) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 p-3 border-2 border-[#311B56] bg-white cursor-pointer group shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                      onClick={() => playTrack(track.id, activePlaylist.trackIds)}
                    >
                      <div className="w-12 h-12 border-2 border-[#311B56] overflow-hidden shrink-0 bg-[#311B56]">
                        <img src={track.thumbnail} alt="" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-black uppercase tracking-tight text-[#311B56] truncate">{track.title}</div>
                        <div className="text-xs font-bold opacity-70 text-[#311B56] truncate mt-1">{track.artist}</div>
                      </div>
                    </motion.div>
                  ))}
                  {playlistTracks.length === 0 && (
                    <div className="text-center py-12 border-2 border-[#311B56] bg-white opacity-60 text-[#311B56]">
                      <div className="font-black uppercase tracking-widest">Playlist này trống</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {step === 'create' && (
              <div className="p-5 border-t-4 border-[#311B56] flex gap-4 bg-white">
                <motion.button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex-1 py-4 border-2 border-[#311B56] text-[#311B56] font-black uppercase tracking-widest shadow-[4px_4px_0px_#311B56] disabled:opacity-50 disabled:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#311B56] transition-all"
                  style={{
                    background: newName.trim() ? accentColor : '#E5E5E5',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Tạo Playlist
                </motion.button>
                <motion.button
                  onClick={() => setStep('list')}
                  className="px-8 py-4 border-2 border-[#311B56] bg-white text-[#311B56] font-black uppercase tracking-widest shadow-[4px_4px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#311B56] transition-all"
                  whileTap={{ scale: 0.95 }}
                >
                  Hủy
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
