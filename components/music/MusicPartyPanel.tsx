'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Send, Users, Copy, Check, LogOut, Loader2, Sparkles, Music2, Heart,
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

export const MusicPartyPanel = () => {
  const {
    isMusicPartyOpen, setIsMusicPartyOpen,
    musicRoomId, musicPeerId, isMusicHost, musicPeers, musicMessages,
    currentTrackId, tracks, isPlaying, colorTheme,
    initMusicHost, joinMusicRoom, leaveMusicRoom, sendMusicP2P, setMusicSyncCallback,
    togglePlay, playTrack,
  } = useMusicContext();

  const accentColor = NEO_COLORS[colorTheme] || NEO_COLORS.purple;
  const [inputValue, setInputValue] = useState('');
  const [joinId, setJoinId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentTrack = tracks.find(t => t.id === currentTrackId);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isMusicPartyOpen && musicRoomId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [musicMessages, isMusicPartyOpen, musicRoomId]);

  // Register sync callback
  useEffect(() => {
    setMusicSyncCallback((data: any) => {
      if (data.type === 'PLAY_TRACK' && data.trackId) {
        playTrack(data.trackId);
      } else if (data.type === 'TOGGLE_PLAY') {
        togglePlay();
      }
    });
  }, [setMusicSyncCallback, playTrack, togglePlay]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    sendMusicP2P('MUSIC_CHAT', {
      user: 'Bạn',
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${musicPeerId}`,
      text: inputValue,
      time: timeStr,
    });
    setInputValue('');
  };

  const handleCopy = () => {
    if (!musicRoomId) return;
    navigator.clipboard.writeText(musicRoomId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCreate = async () => {
    setIsConnecting(true);
    await initMusicHost();
    setIsConnecting(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinId.trim()) return;
    setIsConnecting(true);
    const ok = await joinMusicRoom(joinId.trim());
    setIsConnecting(false);
    if (!ok) alert('Không thể kết nối! Kiểm tra lại ID nhé Hoàng!');
  };

  const closePanel = () => setIsMusicPartyOpen(false);

  return (
    <AnimatePresence>
      {isMusicPartyOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2800]"
            style={{ background: 'rgba(49,27,86,0.6)', backdropFilter: 'blur(2px)' }}
            onClick={closePanel}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-[88px] md:bottom-0 w-[400px] max-md:w-full z-[2801] flex flex-col bg-[#FAF8F5] border-l-2 border-[#311B56] shadow-[-4px_0_0_#311B56]"
          >
            {/* Header */}
            <div className="p-5 border-b-2 border-[#311B56] bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] flex items-center justify-center" style={{ background: accentColor }}>
                    <Users size={20} className="text-[#311B56]" />
                  </div>
                  <div>
                    <h2 className="font-black text-lg uppercase tracking-tight text-[#311B56]">🎵 Nghe Cùng Nhau</h2>
                    <p className="text-xs font-bold opacity-70 text-[#311B56]">
                      {musicRoomId
                        ? `${isMusicHost ? musicPeers.length + 1 : 2} NGƯỜI ĐANG NGHE`
                        : 'PHÒNG CHỜ'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {musicRoomId && (
                    <motion.button
                      onClick={leaveMusicRoom}
                      className="p-2 border-2 border-[#311B56] bg-white text-[#ef4444] shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      whileTap={{ scale: 0.9 }}
                    >
                      <LogOut size={18} />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={closePanel}
                    className="p-2 border-2 border-[#311B56] bg-white text-[#311B56] shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Room ID copy bar */}
              {musicRoomId && (
                <motion.button
                  onClick={handleCopy}
                  className="w-full py-3 border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-colors hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  style={{ background: isCopied ? '#86EFAC' : accentColor, color: '#311B56' }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCopied ? <><Check size={16} /> Đã copy ID!</> : <><Copy size={16} /> Copy Room ID</>}
                </motion.button>
              )}

              {/* Now syncing */}
              {musicRoomId && currentTrack && (
                <div className="mt-4 flex items-center gap-3 p-2 border-2 border-[#311B56] bg-white shadow-[2px_2px_0px_#311B56]">
                  <img src={currentTrack.thumbnail} alt="" className="w-10 h-10 border-2 border-[#311B56] object-cover grayscale-[20%] contrast-125" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black truncate uppercase text-[#311B56]">{currentTrack.title}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold opacity-60 text-[#311B56]">ĐANG PHÁT</span>
                      {isPlaying && (
                        <div className="flex items-end gap-[2px] h-3">
                          {[1,2,3].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-[3px] bg-[#311B56]"
                              animate={{ height: ['4px', '12px', '4px'] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Music2 size={18} className="text-[#311B56] mr-2" />
                </div>
              )}
            </div>

            {/* No room – lobby */}
            {!musicRoomId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
                {isConnecting ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="animate-spin text-[#311B56]" />
                    <div className="font-black text-xl uppercase tracking-widest text-[#311B56]">Đang kết nối...</div>
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 border-4 border-[#311B56] bg-white shadow-[6px_6px_0px_#311B56] flex items-center justify-center" style={{ background: accentColor }}>
                      <Users size={48} className="text-[#311B56]" />
                    </div>
                    <div className="text-center text-[#311B56]">
                      <h3 className="text-2xl font-black uppercase tracking-tight">Nghe Cùng Bạn Bè</h3>
                      <p className="text-sm font-bold opacity-70 mt-2">
                        Tạo phòng hoặc tham gia vào phòng của người khác để quẩy chung!
                      </p>
                    </div>

                    <motion.button
                      onClick={handleCreate}
                      className="w-full py-4 border-2 border-[#311B56] font-black text-lg uppercase tracking-widest shadow-[4px_4px_0px_#311B56] flex items-center justify-center gap-2 text-[#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#311B56]"
                      style={{ background: accentColor }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Sparkles size={20} /> Tạo phòng mới
                    </motion.button>

                    <div className="w-full flex items-center gap-3">
                      <div className="flex-1 h-[2px] bg-[#311B56]" />
                      <span className="text-sm font-black opacity-60 text-[#311B56]">HOẶC</span>
                      <div className="flex-1 h-[2px] bg-[#311B56]" />
                    </div>

                    <form onSubmit={handleJoin} className="w-full flex flex-col gap-3">
                      <input
                        type="text"
                        value={joinId}
                        onChange={e => setJoinId(e.target.value)}
                        placeholder="Dán Room ID vào đây..."
                        className="w-full px-4 py-3 border-2 border-[#311B56] text-sm font-bold outline-none shadow-[2px_2px_0px_#311B56] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all placeholder:opacity-50 text-[#311B56]"
                      />
                      <motion.button
                        type="submit"
                        disabled={!joinId.trim()}
                        className="w-full py-3 border-2 border-[#311B56] font-black uppercase tracking-widest shadow-[2px_2px_0px_#311B56] text-[#311B56] disabled:opacity-50 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        style={{ background: joinId.trim() ? '#FAF8F5' : '#E5E5E5' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Tham Gia
                      </motion.button>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50">
                  <div className="text-center">
                    <span className="text-xs px-4 py-2 border-2 border-[#311B56] font-black uppercase tracking-widest bg-white shadow-[2px_2px_0px_#311B56] text-[#311B56]" style={{ background: isMusicHost ? accentColor : 'white' }}>
                      {isMusicHost ? '🎧 Bạn là host' : '🎵 Đã vào phòng thành công'}
                    </span>
                  </div>

                  {musicMessages.map((msg, i) => {
                    const isSelf = msg.senderId === musicPeerId;
                    return (
                      <div key={i} className={`flex gap-3 max-w-[85%] ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}>
                        <img src={msg.avatar} alt="" className="w-10 h-10 border-2 border-[#311B56] bg-white object-cover shrink-0 shadow-[2px_2px_0px_#311B56]" />
                        <div className={`flex flex-col gap-1 ${isSelf ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black opacity-80 text-[#311B56]">{msg.user}</span>
                            <span className="text-[10px] font-bold opacity-40 text-[#311B56]">{msg.time}</span>
                          </div>
                          <div
                            className="px-4 py-2.5 border-2 border-[#311B56] text-sm font-bold shadow-[2px_2px_0px_#311B56]"
                            style={{
                              background: isSelf ? accentColor : 'white',
                              color: '#311B56',
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Input */}
                <div className="p-4 border-t-2 border-[#311B56] bg-white">
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center border-2 border-[#311B56] bg-white shadow-[2px_2px_0px_#311B56] focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-none transition-all px-2">
                      <button type="button" className="p-2 text-[#311B56]">
                        <Heart size={18} fill="currentColor" />
                      </button>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Nhắn gì đó..."
                        className="flex-1 bg-transparent outline-none py-3 text-sm font-bold text-[#311B56] placeholder:opacity-50"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="p-3 border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] text-[#311B56] disabled:opacity-50 disabled:bg-gray-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      style={{ background: inputValue.trim() ? accentColor : 'white' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send size={20} />
                    </motion.button>
                  </form>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
