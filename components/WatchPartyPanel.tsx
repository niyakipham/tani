'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/lib/store';
import { X, Users, Send, Smile, Copy, Heart, Check, Popcorn } from 'lucide-react';

type Message = { id: number; user: string; avatar: string; text: string; time: string; isSelf?: boolean };

const mockMessages: Message[] = [
  { id: 1, user: 'Anh Hoàng', avatar: 'https://i.pravatar.cc/150?u=hoang', text: 'Anime này đỉnh quá Hân ơi! ✨', time: '20:45' },
  { id: 2, user: 'Hân', avatar: 'https://i.pravatar.cc/150?u=han', text: 'Dạ, art style siêu đẹp luôn anh! 😍 Hân mê quá trời nè!', time: '20:45' },
  { id: 3, user: 'Trang', avatar: 'https://i.pravatar.cc/150?u=trang', text: 'Test hệ thống âm thanh 1 2 3... 🛠️', time: '20:46' },
];

export const WatchPartyPanel = () => {
  const { isWatchPartyOpen, setIsWatchPartyOpen, userProfile } = useAppContext();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isWatchPartyOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isWatchPartyOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: userProfile?.name || 'Bạn',
      avatar: userProfile?.avatar || 'https://i.pravatar.cc/150?u=guest',
      text: inputValue,
      time: timeStr,
      isSelf: true
    }]);
    setInputValue('');
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText('https://t-anime.app/watch-party/room/a3x-9b2');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const closePanel = () => setIsWatchPartyOpen(false);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[2000] backdrop-blur-sm transition-opacity duration-300 ${isWatchPartyOpen ? 'block opacity-100' : 'hidden opacity-0 dark:bg-black/60 bg-white/85'}`} 
        onClick={closePanel}
      ></div>
      
      {/* Panel */}
      <aside 
        className={`fixed top-0 right-0 w-[400px] max-md:w-[90%] h-screen bg-white dark:bg-[#1A1C23] border-l border-black/5 dark:border-white/5 z-[2001] transform transition-transform duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.8)] shadow-none ${isWatchPartyOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
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
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span> 42 người đang xem
              </div>
            </div>
          </div>
          
          <button 
            onClick={copyInviteLink} 
            className={`mt-6 py-3 w-full rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-[0.9rem] ${isCopied ? 'bg-[#10B981] text-white' : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)]'}`}
          >
            {isCopied ? <><Check size={18} /> Đã copy link mời!</> : <><Copy size={18} /> Mời bạn bè cùng xem</>}
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:px-8 bg-[#F4F7FB]/50 dark:bg-transparent custom-scrollbar flex flex-col gap-4">
          <div className="text-center w-full my-2">
             <span className="text-[0.75rem] font-bold text-[#808191] bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">Hôm nay</span>
          </div>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 max-w-[90%] ${msg.isSelf ? 'ml-auto flex-row-reverse' : ''}`}>
              <img src={msg.avatar} alt="Ava" className="w-9 h-9 border border-black/10 dark:border-white/10 rounded-full object-cover shrink-0" />
              <div className={`flex flex-col gap-1 ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[0.75rem] font-bold text-[#808191]">{msg.user}</span>
                  <span className="text-[0.65rem] text-[#808191]/70">{msg.time}</span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-[0.95rem] leading-[1.4] relative ${msg.isSelf ? 'bg-[#3B82F6] text-white rounded-tr-sm shadow-[0_5px_15px_rgba(59,130,246,0.3)]' : 'bg-white dark:bg-[#252836] text-black dark:text-white rounded-tl-sm shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 md:px-6 bg-white dark:bg-[#1A1C23] border-t border-black/5 dark:border-white/5">
          <form className="flex items-center gap-2 bg-[#F4F7FB] dark:bg-[#252836] rounded-2xl p-2" onSubmit={handleSendMessage}>
            <button type="button" className="p-2 text-[#808191] hover:text-[#FF4757] transition-colors rounded-xl hover:bg-black/5 dark:hover:bg-white/5">
              <Heart size={20} className="fill-current" />
            </button>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập cảm nghĩ của bạn..." 
              className="flex-1 bg-transparent border-none outline-none text-[0.95rem] text-black dark:text-white px-1"
            />
            <button type="submit" className={`p-2 rounded-xl transition-all ${inputValue.trim() ? 'bg-[#3B82F6] text-white shadow-[0_4px_10px_rgba(59,130,246,0.4)]' : 'bg-black/5 dark:bg-white/5 text-[#808191]'}`}>
              <Send size={18} className={inputValue.trim() ? "translate-x-[1px] -translate-y-[1px]" : ""} />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
};
