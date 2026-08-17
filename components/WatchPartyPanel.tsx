'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/lib/store';
import { X, Send, Heart, Check, Copy, Popcorn, Sparkles, LogOut, Users } from 'lucide-react';

export const WatchPartyPanel = () => {
  const { isWatchPartyOpen, setIsWatchPartyOpen, userProfile, roomId, peerId, isHost, peers, messages, initHost, joinRoom, leaveRoom, sendP2PMessage } = useAppContext();
  const [inputValue, setInputValue] = useState('');
  const [joinId, setJoinId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isWatchPartyOpen && roomId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isWatchPartyOpen, roomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    sendP2PMessage('CHAT', {
      user: userProfile?.name || 'Bạn',
      avatar: userProfile?.avatar || 'https://i.pravatar.cc/150?u=guest',
      text: inputValue,
      time: timeStr
    });
    setInputValue('');
  };

  const copyInviteLink = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCreateRoom = async () => {
    setIsConnecting(true);
    await initHost();
    setIsConnecting(false);
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinId.trim()) return;
    setIsConnecting(true);
    const success = await joinRoom(joinId.trim());
    setIsConnecting(false);
    if (!success) alert('Không thể kết nối đến phòng này. Vui lòng kiểm tra lại ID!');
  };

  const closePanel = () => setIsWatchPartyOpen(false);

  const baseBtn =
    'px-6 py-3.5 rounded-[14px] border font-black font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(126,247,199,0.12)]';

  return (
    <>
      <div
        className={`fixed inset-0 z-[2000] transition-all duration-300 ${isWatchPartyOpen ? 'bg-[var(--terminal-bg-2)]/60 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}
        onClick={closePanel}
      ></div>

      <aside
        className={`fixed top-0 right-0 w-[420px] max-md:w-full h-screen bg-[var(--terminal-panel)] border-l border-[var(--terminal-border-strong)] z-[2001] transform transition-transform duration-400 flex flex-col shadow-[-8px_0_24px_rgba(0,0,0,0.42)] ${isWatchPartyOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col p-6 md:p-8 relative overflow-hidden border-b border-[var(--terminal-border)]">
          <div
            className="absolute top-6 right-6 text-[1.2rem] text-[var(--terminal-ink)] bg-[var(--terminal-bg-2)] border border-[var(--terminal-border)] cursor-pointer transition-all p-2 rounded-[14px] hover:text-[var(--terminal-green)] hover:border-[var(--terminal-border-strong)] z-50"
            onClick={closePanel}
          >
            <X size={20} className="font-bold" />
          </div>

          <div className="flex items-center relative z-10 px-2 pt-2">
            <div className="flex-1">
              <div className="text-[1.6rem] font-black tracking-widest uppercase font-mono text-[var(--terminal-green)]">[ TRẠM ĐIỂM GIAN ]</div>
              <div className="text-[0.85rem] text-[var(--terminal-muted)] font-mono font-bold flex items-center gap-1.5 mt-2">
                {roomId ? (
                  <><span className="w-2.5 h-2.5 rounded-full bg-[var(--terminal-green)] animate-pulse border border-[var(--terminal-panel)]"></span> [ {isHost ? peers.length + 1 : 2} NGƯỜI ĐANG XEM ]</>
                ) : (
                  <><span className="w-2.5 h-2.5 rounded-full border border-[var(--terminal-border)]"></span> [ PHÒNG CHỜ RẠP PHIM ]</>
                )}
              </div>
            </div>
          </div>

          {roomId && (
            <div className="mt-8 flex gap-3 relative z-10">
              <button
                onClick={copyInviteLink}
                className={`${baseBtn} ${isCopied ? 'bg-[var(--terminal-green)] text-[var(--terminal-bg-2)]' : 'bg-[var(--terminal-bg-2)] text-[var(--terminal-ink)] border-[var(--terminal-border-strong)] hover:bg-[var(--terminal-green)] hover:text-[var(--terminal-bg-2)]'}`}
              >
                {isCopied ? <><Check size={18} /> ĐÃ LẤY ID KÌA!</> : <><Copy size={18} /> COPY ID CỦA RẠP</>}
              </button>
              <button
                onClick={leaveRoom}
                className="w-[50px] shrink-0 border border-[var(--terminal-border-strong)] rounded-[14px] bg-[var(--terminal-bg-2)] text-[var(--terminal-ink)] hover:bg-[var(--terminal-green)] hover:text-[var(--terminal-bg-2)] transition-all flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.22)]"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>

        {!roomId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 bg-[var(--terminal-bg-2)]/20">
            {isConnecting ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[14px] border-4 border-[var(--terminal-green)]/20 border-t-[var(--terminal-green)] animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--terminal-green)]">
                    <Sparkles size={24} className="animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-center">
                  <span className="font-black text-[1.4rem] font-mono tracking-widest uppercase text-[var(--terminal-ink)]">[ ĐANG KẾT NỐI... ]</span>
                  <span className="text-[var(--terminal-muted)] font-mono font-bold text-[0.9rem]">[ VUI LÒNG CHỜ MỘT CHÚT NHÉ! ]</span>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="w-28 h-28 bg-[var(--terminal-panel)] border border-[var(--terminal-border-strong)] rounded-[22px] flex items-center justify-center mb-8 shadow-[0_8px_28px_rgba(0,0,0,0.42)] text-[var(--terminal-green)] relative">
                  <Users size={48} className="relative z-10" />
                </div>
                <h3 className="text-[1.6rem] font-black font-mono tracking-widest uppercase text-[var(--terminal-green)] mb-3">[ KÉO NHAU CÙNG XEM ]</h3>
                <p className="text-[0.95rem] font-mono font-bold text-[var(--terminal-muted)] leading-relaxed mb-10 max-w-[280px]">[ Mở rạp phim độc quyền cho bạn bè, hoặc dùng ID tham gia vào rạp của người khác. ]</p>

                <button
                  onClick={handleCreateRoom}
                  className={`${baseBtn} w-full bg-[var(--terminal-green)] text-[var(--terminal-bg-2)] hover:bg-[var(--terminal-cyan)] hover:text-[var(--terminal-bg-2)]`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2"><Sparkles size={18} /> TẠO RẠP CỦA RIÊNG MÌNH</span>
                </button>

                <div className="w-full flex items-center gap-4 my-8">
                  <div className="h-0.5 flex-1 bg-[var(--terminal-border)]"></div>
                  <span className="text-[0.85rem] font-black font-mono tracking-widest uppercase text-[var(--terminal-muted)]">[ HOẶC ]</span>
                  <div className="h-0.5 flex-1 bg-[var(--terminal-border)]"></div>
                </div>

                <form onSubmit={handleJoinRoom} className="w-full flex gap-3 relative group">
                  <input
                    type="text"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Dán ID rạp phim vào đây..."
                    className="w-full terminal-input text-[var(--terminal-ink)] placeholder:text-[var(--terminal-muted)] pr-[110px] py-4"
                  />
                  <button
                    type="submit"
                    disabled={!joinId.trim()}
                    className="absolute right-2 top-2 bottom-2 px-5 bg-[var(--terminal-green)] text-[var(--terminal-bg-2)] rounded-[12px] font-black font-mono uppercase tracking-widest text-[0.9rem] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    VÀO NGAY
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 md:px-8 custom-scrollbar flex flex-col gap-6 relative z-10 bg-[var(--terminal-bg-2)]/10">
              <div className="text-center w-full my-4">
                <span className="text-[0.75rem] font-bold font-mono text-[var(--terminal-muted)] border border-[var(--terminal-border)] shadow-[0_2px_8px_rgba(0,0,0,0.22)] px-4 py-1.5 rounded-[9999px] uppercase tracking-widest">
                  [ {isHost ? 'Rạp phim của Host' : 'Đã vào rạp thành công'} ]
                </span>
              </div>

              {messages.map((msg, idx) => {
                const isSelf = msg.senderId === peerId;
                return (
                  <div key={idx} className={`flex gap-3 max-w-[85%] ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}>
                    <img src={msg.avatar} alt="Ava" className="w-10 h-10 border border-[var(--terminal-border)] shadow-[0_0_10px_rgba(0,0,0,0.22)] rounded-[14px] object-cover shrink-0 z-10 grayscale contrast-125" />
                    <div className={`flex flex-col gap-1.5 ${isSelf ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[0.75rem] font-black font-mono tracking-widest uppercase text-[var(--terminal-ink)]">{msg.user}</span>
                        <span className="text-[0.7rem] font-bold font-mono text-[var(--terminal-muted)]">[{msg.time}]</span>
                      </div>
                      <div
                        className={`px-4 py-3 text-[0.95rem] font-bold font-mono leading-[1.5] relative break-words border shadow-[0_0_12px_rgba(0,0,0,0.18)] rounded-[18px] transition-colors ${isSelf ? 'bg-[var(--terminal-green)] text-[var(--terminal-bg-2)] border-[var(--terminal-green)]' : 'bg-[var(--terminal-bg-2)] text-[var(--terminal-ink)] border-[var(--terminal-border)]'}`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            <div className="p-4 pb-6 md:p-6 md:pb-8 bg-[var(--terminal-bg-2)]/30 border-t border-[var(--terminal-border)] relative z-20">
              <form
                className="flex items-center gap-2 bg-[var(--terminal-bg-2)]/50 rounded-[18px] p-2 border border-[var(--terminal-border)] focus-within:border-[var(--terminal-green)] focus-within:shadow-[0_0_24px_rgba(126,247,199,0.12)] transition-all"
                onSubmit={handleSendMessage}
              >
                <button type="button" className="w-10 h-10 flex items-center justify-center text-[var(--terminal-green)] border border-[var(--terminal-border)] hover:bg-[var(--terminal-green)] hover:text-[var(--terminal-bg-2)] transition-all rounded-[14px] shrink-0">
                  <Heart size={20} className="fill-current" />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="[ TRAO LỜI MUỐN NÓI... ]"
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-[0.95rem] font-bold font-mono text-[var(--terminal-ink)] px-2 placeholder:text-[var(--terminal-muted)]"
                />
                <button
                  type="submit"
                  className={`w-10 h-10 flex items-center justify-center rounded-[14px] border transition-all shrink-0 ${inputValue.trim() ? 'bg-[var(--terminal-green)] text-[var(--terminal-bg-2)] border-[var(--terminal-green)] shadow-[0_0_16px_rgba(126,247,199,0.18)] hover:scale-105' : 'bg-[var(--terminal-bg-2)] border-[var(--terminal-border)] text-[var(--terminal-muted)]/30'}`}
                >
                  <Send size={18} className={inputValue.trim() ? "translate-x-[1px] -translate-y-[1px]" : ""} />
                </button>
              </form>
            </div>
          </>
        )}
      </aside>
    </>
  );
};
