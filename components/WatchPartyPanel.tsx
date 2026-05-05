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
 className={`fixed inset-0 z-[2000] transition-all duration-300 ${isWatchPartyOpen ? 'bg-[#311B56]/60 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`} 
 onClick={closePanel}
 ></div>
 
 <aside 
 className={`fixed top-0 right-0 w-[420px] max-md:w-full h-screen bg-[#FAF8F5] border-l-2 border-[#311B56] z-[2001] transform transition-transform duration-400 flex flex-col shadow-[-8px_0_0px_#311B56] ${isWatchPartyOpen ? 'translate-x-0' : 'translate-x-full'}`}
 >
 <div className="flex flex-col p-6 md:p-8 relative overflow-hidden border-b-2 border-[#311B56]">

 <div className="absolute top-6 right-6 text-[1.2rem] text-[#FAF8F5] bg-[#311B56] border-2 border-[#311B56] cursor-pointer transition-all p-2 rounded-none hover:bg-[#FAF8F5] hover:text-[#311B56] shadow-[2px_2px_0px_#311B56] hover:translate-y-[2px] hover:shadow-none z-50" onClick={closePanel}>
 <X size={20} className="font-bold" />
 </div>
 
 <div className="flex items-center relative z-10 px-2">
 <div className="flex-1">
 <div className="text-[1.6rem] font-black tracking-widest uppercase font-mono text-[#311B56]">[ TRẠM ĐIỂM GIAN ]</div>
 <div className="text-[0.85rem] text-[#311B56] font-mono font-bold flex items-center gap-1.5 mt-2">
 {roomId ? (
 <><span className="w-2.5 h-2.5 rounded-none bg-[#311B56] animate-pulse border border-[#FAF8F5]"></span> [ {isHost ? peers.length + 1 : 2} NGƯỜI ĐANG XEM ]</>
 ) : (
 <><span className="w-2.5 h-2.5 rounded-none border border-[#311B56]"></span> [ PHÒNG CHỜ RẠP PHIM ]</>
 )}
 </div>
 </div>
 </div>
 
 {roomId && (
 <div className="mt-8 flex gap-3 relative z-10">
 <button 
 onClick={copyInviteLink} 
 className={`py-3 flex-1 border-2 border-[#311B56] rounded-none flex items-center justify-center gap-2 font-black font-mono transition-all text-[0.9rem] uppercase tracking-widest relative ${isCopied ? 'bg-[#311B56] text-[#FAF8F5] shadow-[4px_4px_0px_#311B56]' : 'bg-[#FAF8F5] text-[#311B56] hover:bg-[#311B56] hover:text-[#FAF8F5] shadow-[4px_4px_0px_#311B56] hover:shadow-[2px_2px_0px_#311B56] hover:translate-y-[2px]'}`}
 >
 {isCopied ? <><Check size={18} /> ĐÃ LẤY ID KÌA!</> : <><Copy size={18} /> COPY ID CỦA RẠP</>}
 </button>
 <button onClick={leaveRoom} className="w-[50px] shrink-0 border-2 border-[#311B56] rounded-none bg-[#FAF8F5] text-[#311B56] hover:bg-[#311B56] hover:text-[#FAF8F5] hover:translate-y-[2px] shadow-[4px_4px_0px_#311B56] hover:shadow-[2px_2px_0px_#311B56] transition-all flex items-center justify-center">
 <LogOut size={20} />
 </button>
 </div>
 )}
 </div>

 {!roomId ? (
 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 bg-[#FAF8F5]">
 {isConnecting ? (
 <div className="flex flex-col items-center gap-6">
 <div className="relative">
 <div className="w-20 h-20 rounded-none border-4 border-[#311B56]/20 border-t-[#311B56] animate-spin"></div>
 <div className="absolute inset-0 flex items-center justify-center text-[#311B56]">
 <Sparkles size={24} className="animate-pulse" />
 </div>
 </div>
 <div className="flex flex-col gap-2 text-center">
 <span className="font-black text-[1.4rem] font-mono tracking-widest uppercase text-[#311B56]">[ ĐANG KẾT NỐI... ]</span>
 <span className="text-[#311B56]/80 font-mono font-bold text-[0.9rem]">[ VUI LÒNG CHỜ MỘT CHÚT NHÉ! ]</span>
 </div>
 </div>
 ) : (
 <div className="w-full flex flex-col items-center">
 <div className="w-28 h-28 bg-[#FAF8F5] border-4 border-[#311B56] rounded-none flex items-center justify-center mb-8 shadow-[8px_8px_0px_#311B56] text-[#311B56] relative">
 <Users size={48} className="relative z-10" />
 </div>
 <h3 className="text-[1.6rem] font-black font-mono tracking-widest uppercase text-[#311B56] mb-3">[ KÉO NHAU CÙNG XEM ]</h3>
 <p className="text-[0.95rem] font-mono font-bold text-[#311B56]/80 leading-relaxed mb-10 max-w-[280px]">[ Mở rạp phim độc quyền cho bạn bè, hoặc dùng ID tham gia vào rạp của người khác. ]</p>
 
 <button onClick={handleCreateRoom} className="w-full py-4 bg-[#FAF8F5] border-2 border-[#311B56] text-[#311B56] hover:bg-[#311B56] hover:text-[#FAF8F5] rounded-none font-black font-mono uppercase tracking-widest text-[1.05rem] shadow-[4px_4px_0px_#311B56] hover:shadow-[2px_2px_0px_#311B56] transition-all hover:translate-y-[2px] mb-8">
 <span className="relative z-10 flex items-center justify-center gap-2"><Sparkles size={18} /> TẠO RẠP CỦA RIÊNG MÌNH</span>
 </button>
 
 <div className="w-full flex items-center gap-4 mb-8">
 <div className="h-0.5 flex-1 bg-[#311B56]"></div>
 <span className="text-[0.85rem] font-black font-mono tracking-widest uppercase text-[#311B56]">[ HOẶC ]</span>
 <div className="h-0.5 flex-1 bg-[#311B56]"></div>
 </div>

 <form onSubmit={handleJoinRoom} className="w-full flex gap-3 relative group">
 <input 
 type="text" 
 value={joinId}
 onChange={(e) => setJoinId(e.target.value)}
 placeholder="Dán ID rạp phim vào đây..." 
 className="w-full bg-[#FAF8F5] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] focus:shadow-[2px_2px_0px_#311B56] rounded-none pl-5 pr-[110px] py-4 text-[0.95rem] font-bold font-mono text-[#311B56] outline-none transition-all placeholder:text-[#311B56]/50 focus:translate-y-[2px]"
 />
 <button type="submit" disabled={!joinId.trim()} className="absolute right-2 top-2 bottom-2 px-5 bg-[#311B56] text-[#FAF8F5] rounded-none font-black font-mono uppercase tracking-widest text-[0.9rem] transition-all hover:bg-[#FAF8F5] hover:text-[#311B56] hover:border-2 hover:border-[#311B56] disabled:opacity-50 disabled:cursor-not-allowed">
 VÀO NGAY
 </button>
 </form>
 </div>
 )}
 </div>
 ) : (
 <>
 <div className="flex-1 overflow-y-auto p-6 md:px-8 custom-scrollbar flex flex-col gap-6 relative z-10 bg-[#FAF8F5]">
 <div className="text-center w-full my-4">
 <span className="text-[0.75rem] font-bold font-mono text-[#311B56] border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] px-4 py-1.5 rounded-none uppercase tracking-widest">
 [ {isHost ? 'Rạp phim của Host' : 'Đã vào rạp thành công'} ]
 </span>
 </div>
 
 {messages.map((msg, idx) => {
 const isSelf = msg.senderId === peerId;
 return (
 <div key={idx} className={`flex gap-3 max-w-[85%] ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}>
 <img src={msg.avatar} alt="Ava" className="w-10 h-10 border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] rounded-none object-cover shrink-0 z-10 grayscale contrast-125" />
 <div className={`flex flex-col gap-1.5 ${isSelf ? 'items-end' : 'items-start'}`}>
 <div className="flex items-center gap-2 px-1">
 <span className="text-[0.75rem] font-black font-mono tracking-widest uppercase text-[#311B56]">{msg.user}</span>
 <span className="text-[0.7rem] font-bold font-mono text-[#311B56]/70">[{msg.time}]</span>
 </div>
 <div className={`px-4 py-3 text-[0.95rem] font-bold font-mono leading-[1.5] relative break-words border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] rounded-none ${isSelf ? 'bg-[#311B56] text-[#FAF8F5]' : 'bg-[#FAF8F5] text-[#311B56]'}`}>
 {msg.text}
 </div>
 </div>
 </div>
 );
 })}
 <div ref={messagesEndRef} className="h-4" />
 </div>

 <div className="p-4 pb-6 md:p-6 md:pb-8 bg-[#FAF8F5] border-t-2 border-[#311B56] relative z-20">
 <form className="flex items-center gap-2 bg-[#FAF8F5] rounded-none p-2 border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] transition-all focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0px_#311B56]" onSubmit={handleSendMessage}>
 <button type="button" className="w-10 h-10 flex items-center justify-center text-[#311B56] border-2 border-[#311B56] hover:border-[#311B56] transition-all rounded-none shrink-0">
 <Heart size={20} className="fill-current" />
 </button>
 <input 
 type="text" 
 value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 placeholder="[ TRAO LỜI MUỐN NÓI... ]" 
 className="flex-1 min-w-0 bg-transparent border-none outline-none text-[0.95rem] font-bold font-mono text-[#311B56] px-2 placeholder:text-[#311B56]/50"
 />
 <button type="submit" className={`w-10 h-10 flex items-center justify-center rounded-none border-2 transition-all shrink-0 ${inputValue.trim() ? 'bg-[#311B56] text-[#FAF8F5] border-[#311B56] shadow-[2px_2px_0px_#311B56] hover:bg-[#FAF8F5] hover:text-[#311B56]' : 'bg-[#FAF8F5] border-[#311B56]/30 text-[#311B56]/30'}`}>
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
