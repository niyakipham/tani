'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/lib/store';
import { X, Send, Heart, Check, Copy, Popcorn, Sparkles, LogOut, Loader2, Users } from 'lucide-react';

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

  return (
    <>
      <div 
        className={`fixed inset-0 z-[2000] backdrop-blur-md transition-all duration-500 ${isWatchPartyOpen ? 'bg-black/40 opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`} 
        onClick={closePanel}
      ></div>
      
      <aside 
        className={`fixed top-0 right-0 w-[420px] max-md:w-full h-screen bg-white/95 dark:bg-[#0F111A]/95 backdrop-blur-3xl border-l border-white/20 dark:border-white/10 z-[2001] transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col shadow-[-30px_0_60px_rgba(0,0,0,0.3)] dark:shadow-[-30px_0_60px_rgba(0,0,0,0.6)] ${isWatchPartyOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col p-6 md:p-8 relative overflow-hidden">
          {/* Decorative Background Gradients */}
          <div className="absolute top-[-50%] right-[-20%] w-[200px] h-[200px] bg-[#3B82F6] rounded-full mix-blend-screen mix-blend-plus-lighter filter blur-[80px] opacity-40 animate-pulse"></div>
          <div className="absolute top-[-20%] left-[-20%] w-[150px] h-[150px] bg-[#EC4899] rounded-full mix-blend-screen mix-blend-plus-lighter filter blur-[80px] opacity-30"></div>

          <div className="absolute top-6 right-6 text-[1.2rem] text-[#808191] cursor-pointer transition-all p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-[#FF4757] hover:text-white hover:rotate-90 z-10" onClick={closePanel}>
            <X size={20} />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] rounded-[1.25rem] flex items-center justify-center shadow-[0_10px_30px_rgba(139,92,246,0.4)] group">
               <div className="absolute inset-0 bg-white/20 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <Popcorn size={28} className="text-white fill-current transform transition-transform group-hover:scale-110 group-hover:-rotate-6" />
            </div>
            <div className="flex-1">
              <div className="text-[1.35rem] font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#EC4899] dark:from-[#3B82F6] dark:to-[#F472B6] drop-shadow-sm">Trạm Điểm Gian</div>
              <div className="text-[0.85rem] text-[#808191] font-semibold flex items-center gap-1.5 mt-1">
                {roomId ? (
                  <><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span></span> {isHost ? peers.length + 1 : 2} người đang xem cùng anh</>
                ) : (
                  <><span className="w-2.5 h-2.5 rounded-full bg-[#808191]/50"></span> Phòng chờ rạp phim</>
                )}
              </div>
            </div>
          </div>
          
          {roomId && (
            <div className="mt-8 flex gap-3 relative z-10">
              <button 
                onClick={copyInviteLink} 
                className={`py-3 flex-1 rounded-2xl flex items-center justify-center gap-2 font-black transition-all text-[0.9rem] overflow-hidden relative group ${isCopied ? 'bg-[#10B981] text-white shadow-[0_8px_25px_rgba(16,185,129,0.4)]' : 'bg-[#e0e7ff] dark:bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white dark:hover:bg-[#3B82F6] shadow-sm hover:shadow-[0_8px_25px_rgba(59,130,246,0.3)] hover:-translate-y-1'}`}
              >
                {isCopied ? <><Check size={18} className="animate-in zoom-in" /> Đã Lấy ID Kìa!</> : <><Copy size={18} /> Copy ID Của Rạp</>}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
              <button onClick={leaveRoom} className="w-[50px] shrink-0 rounded-2xl bg-[#FF4757]/10 text-[#FF4757] hover:bg-[#FF4757] hover:text-white hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(255,71,87,0.3)] transition-all flex items-center justify-center">
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>

        {!roomId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
            {isConnecting ? (
              <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-[#3B82F6]/20 border-t-[#3B82F6] animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[#3B82F6]">
                     <Sparkles size={24} className="animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-center">
                   <span className="font-black text-[1.4rem] text-black dark:text-white tracking-tight">Đang kết nối...</span>
                   <span className="text-[#808191] text-[0.9rem]">Vui lòng chờ một chút nhé anh!</span>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-700">
                <div className="w-28 h-28 bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] dark:from-[#1A1D2D] dark:to-[#252836] rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-[#3B82F6]/10 text-[#3B82F6] relative">
                  <div className="absolute inset-0 rounded-full bg-[#3B82F6]/20 animate-ping"></div>
                  <Users size={48} className="relative z-10 drop-shadow-md" />
                </div>
                <h3 className="text-[1.6rem] font-black text-black dark:text-white mb-3 tracking-tight">Kéo Nhau Cùng Xem</h3>
                <p className="text-[0.95rem] text-[#808191] leading-relaxed mb-10 max-w-[280px]">Mở rạp phim độc quyền cho bạn bè, hoặc dùng ID tham gia vào rạp của người khác.</p>
                
                <button onClick={handleCreateRoom} className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-black text-[1.05rem] shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-1 mb-8 overflow-hidden relative group">
                  <span className="relative z-10 flex items-center justify-center gap-2"><Sparkles size={18} /> Tạo Rạp Của Riêng Mình</span>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </button>
                
                <div className="w-full flex items-center gap-4 mb-8 opacity-40">
                  <div className="h-px flex-1 bg-[#808191]"></div>
                  <span className="text-[0.75rem] font-black tracking-widest uppercase text-[#808191]">Hoặc</span>
                  <div className="h-px flex-1 bg-[#808191]"></div>
                </div>

                <form onSubmit={handleJoinRoom} className="w-full flex gap-3 relative group">
                  <input 
                    type="text" 
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Dán ID rạp phim vào đây..." 
                    className="w-full bg-[#F4F7FB] dark:bg-[#1A1C23] border border-[#E2E8F0] dark:border-[#2D303E] rounded-2xl pl-5 pr-[110px] py-4 text-[0.95rem] font-medium text-black dark:text-white outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all placeholder:text-[#808191]/60"
                  />
                  <button type="submit" disabled={!joinId.trim()} className="absolute right-2 top-2 bottom-2 px-5 bg-[#3B82F6] text-white rounded-xl font-bold text-[0.9rem] transition-all hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(59,130,246,0.3)]">
                    Vào Ngay
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 md:px-8 custom-scrollbar flex flex-col gap-6 relative z-10 bg-[#F8FAFC]/50 dark:bg-transparent">
              <div className="text-center w-full my-4">
                 <span className="text-[0.7rem] font-bold text-[#808191] bg-black/5 dark:bg-white/5 backdrop-blur-sm px-4 py-1.5 rounded-full uppercase tracking-wider">
                   {isHost ? 'Rạp phim của Host' : 'Đã vào rạp thành công'}
                 </span>
              </div>
              
              {messages.map((msg, idx) => {
                const isSelf = msg.senderId === peerId;
                return (
                  <div key={idx} className={`flex gap-3 max-w-[85%] animate-in slide-in-from-bottom-4 fade-in duration-300 ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}>
                    <img src={msg.avatar} alt="Ava" className="w-10 h-10 border-2 border-white dark:border-[#252836] shadow-sm rounded-full object-cover shrink-0 z-10" />
                    <div className={`flex flex-col gap-1.5 ${isSelf ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[0.75rem] font-black text-black/70 dark:text-white/70">{msg.user}</span>
                        <span className="text-[0.65rem] font-bold text-[#808191]">{msg.time}</span>
                      </div>
                      <div className={`px-5 py-3 text-[0.95rem] font-medium leading-[1.5] relative break-words shadow-sm ${isSelf ? 'bg-gradient-to-br from-[#3B82F6] to-[#6366F1] text-white rounded-[1.25rem] rounded-tr-md shadow-[0_8px_20px_rgba(59,130,246,0.25)]' : 'bg-white dark:bg-[#1A1C23] text-black dark:text-white rounded-[1.25rem] rounded-tl-md border border-black/5 dark:border-white/5'}`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            <div className="p-4 pb-6 md:p-6 md:pb-8 bg-white/80 dark:bg-[#0F111A]/80 backdrop-blur-xl border-t border-black/5 dark:border-white/10 relative z-20">
              <form className="flex items-center gap-2 bg-[#F4F7FB] dark:bg-[#1A1C23] rounded-full p-2 border border-black/5 dark:border-white/5 transition-all focus-within:ring-4 focus-within:ring-[#3B82F6]/10 focus-within:border-[#3B82F6]/30 shadow-inner" onSubmit={handleSendMessage}>
                <button type="button" className="w-10 h-10 flex items-center justify-center text-[#808191] hover:text-[#EC4899] hover:bg-[#EC4899]/10 transition-all rounded-full shrink-0">
                  <Heart size={20} className="fill-current" />
                </button>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Trao lời muốn nói..." 
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-[0.95rem] font-medium text-black dark:text-white px-2 placeholder:text-[#808191]/60"
                />
                <button type="submit" className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shrink-0 ${inputValue.trim() ? 'bg-[#3B82F6] text-white shadow-[0_4px_15px_rgba(59,130,246,0.4)] hover:bg-[#2563EB] hover:scale-105 hover:-rotate-12' : 'bg-black/5 dark:bg-white/5 text-[#808191]'}`}>
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
