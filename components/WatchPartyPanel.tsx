'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/lib/store';
import { X, Send, Heart, Check, Copy, Popcorn, RadioReceiver, LogOut, Loader2 } from 'lucide-react';

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
        className={`fixed inset-0 bg-black/60 z-[2000] backdrop-blur-sm transition-opacity duration-300 ${isWatchPartyOpen ? 'block opacity-100' : 'hidden opacity-0 dark:bg-black/60 bg-white/85'}`} 
        onClick={closePanel}
      ></div>
      
      <aside 
        className={`fixed top-0 right-0 w-[400px] max-md:w-full h-screen bg-white dark:bg-[#1A1C23] border-l border-black/5 dark:border-white/5 z-[2001] transform transition-transform duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.8)] shadow-none ${isWatchPartyOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col p-6 md:p-8 border-b border-black/5 dark:border-white/5 relative bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10">
          <div className="absolute top-6 right-6 text-[1.2rem] text-[#808191] cursor-pointer transition-all p-2 rounded-xl bg-white/50 dark:bg-black/20 hover:text-white hover:bg-[#FF4757] backdrop-blur-md" onClick={closePanel}>
            <X size={20} />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-[0_4px_15px_rgba(59,130,246,0.5)]">
               <Popcorn size={24} className="text-white fill-current" />
            </div>
            <div>
              <div className="text-[1.2rem] font-black text-black dark:text-white leading-[1.2]">Trạm Điểm Gian</div>
              <div className="text-[0.8rem] text-[#808191] font-semibold flex items-center gap-1 mt-0.5">
                {roomId ? (
                  <><span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span> {isHost ? peers.length + 1 : 2} người đang xem</>
                ) : (
                  <><span className="w-2 h-2 rounded-full bg-[#808191]"></span> Chưa kết nối</>
                )}
              </div>
            </div>
          </div>
          
          {roomId && (
            <div className="mt-6 flex gap-2">
              <button 
                onClick={copyInviteLink} 
                className={`py-2.5 flex-1 rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-[0.85rem] ${isCopied ? 'bg-[#10B981] text-white' : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)]'}`}
              >
                {isCopied ? <><Check size={16} /> Đã Copy ID</> : <><Copy size={16} /> Copy ID Phòng</>}
              </button>
              <button onClick={leaveRoom} className="py-2.5 px-4 rounded-xl bg-[#FF4757]/10 text-[#FF4757] hover:bg-[#FF4757] hover:text-white transition-all font-bold flex items-center justify-center">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        {!roomId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F4F7FB]/50 dark:bg-transparent">
            {isConnecting ? (
              <div className="flex flex-col items-center gap-4 text-[#3B82F6]">
                <Loader2 size={40} className="animate-spin" />
                <span className="font-bold text-[1.1rem]">Đang kết nối tín hiệu...</span>
              </div>
            ) : (
              <>
                <div className="w-24 h-24 bg-white dark:bg-[#252836] rounded-full flex items-center justify-center mb-6 shadow-xl text-[#3B82F6]">
                  <RadioReceiver size={40} />
                </div>
                <h3 className="text-[1.3rem] font-black text-black dark:text-white mb-2">Bắt Đầu Cùng Nhau</h3>
                <p className="text-[0.9rem] text-[#808191] mb-8">Tạo phòng để làm chủ xị, hoặc nhập ID phòng của bạn bè để cùng hòa nhịp cảm xúc!</p>
                
                <button onClick={handleCreateRoom} className="w-full py-3.5 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white rounded-xl font-bold text-[1rem] shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.6)] transition-all hover:-translate-y-1 mb-6">
                  Tạo Phòng Chiếu Mới
                </button>
                
                <div className="w-full flex items-center gap-4 mb-6 opacity-50">
                  <div className="h-px flex-1 bg-[#808191]"></div>
                  <span className="text-[0.8rem] font-bold text-[#808191uppercase">Hoặc</span>
                  <div className="h-px flex-1 bg-[#808191]"></div>
                </div>

                <form onSubmit={handleJoinRoom} className="w-full flex flex-col gap-3">
                  <input 
                    type="text" 
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Nhập ID Phòng..." 
                    className="w-full bg-white dark:bg-[#252836] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-[0.95rem] text-black dark:text-white outline-none focus:border-[#3B82F6]"
                  />
                  <button type="submit" disabled={!joinId.trim()} className="w-full py-3.5 bg-white dark:bg-[#252836] border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl font-bold text-[1rem] transition-all hover:bg-black/5 dark:hover:bg-[#353945] disabled:opacity-50 disabled:cursor-not-allowed">
                    Tham Gia Tính Năng
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 md:px-8 bg-[#F4F7FB]/50 dark:bg-transparent custom-scrollbar flex flex-col gap-4">
              <div className="text-center w-full my-2">
                 <span className="text-[0.75rem] font-bold text-[#808191] bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">Bạn đã tham gia phòng {isHost ? '(Host)' : ''}</span>
              </div>
              
              {messages.map((msg, idx) => {
                const isSelf = msg.senderId === peerId;
                return (
                  <div key={idx} className={`flex gap-3 max-w-[90%] ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}>
                    <img src={msg.avatar} alt="Ava" className="w-9 h-9 border border-black/10 dark:border-white/10 rounded-full object-cover shrink-0" />
                    <div className={`flex flex-col gap-1 ${isSelf ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.75rem] font-bold text-[#808191]">{msg.user}</span>
                        <span className="text-[0.65rem] text-[#808191]/70">{msg.time}</span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl text-[0.95rem] leading-[1.4] relative break-words ${isSelf ? 'bg-[#3B82F6] text-white rounded-tr-sm shadow-[0_5px_15px_rgba(59,130,246,0.3)]' : 'bg-white dark:bg-[#252836] text-black dark:text-white rounded-tl-sm shadow-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 pb-8 md:p-6 bg-white dark:bg-[#1A1C23] border-t border-black/5 dark:border-white/5">
              <form className="flex items-center gap-2 bg-[#F4F7FB] dark:bg-[#252836] rounded-2xl p-2" onSubmit={handleSendMessage}>
                <button type="button" className="p-2 text-[#808191] hover:text-[#FF4757] transition-colors rounded-xl hover:bg-black/5 dark:hover:bg-white/5">
                  <Heart size={20} className="fill-current" />
                </button>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập cảm nghĩ của bạn..." 
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-[0.95rem] text-black dark:text-white px-1"
                />
                <button type="submit" className={`p-2 rounded-xl transition-all ${inputValue.trim() ? 'bg-[#3B82F6] text-white shadow-[0_4px_10px_rgba(59,130,246,0.4)]' : 'bg-black/5 dark:bg-white/5 text-[#808191]'}`}>
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
