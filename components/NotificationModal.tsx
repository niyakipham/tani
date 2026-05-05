'use client';

import React from 'react';
import { X, Bell, Check } from 'lucide-react';
import { useAppContext } from '@/lib/store';

export const NotificationModal = () => {
 const { isNotificationModalOpen, setIsNotificationModalOpen, notificationSettings, setNotificationSettings } = useAppContext();

 if (!isNotificationModalOpen) return null;

 const handleToggle = (key: keyof typeof notificationSettings) => {
 const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
 setNotificationSettings(newSettings);
 localStorage.setItem('tanime_notif_settings', JSON.stringify(newSettings));
 };

 return (
 <div className="fixed inset-0 bg-[#311B56]/80 z-[3000] flex items-center justify-center p-4 backdrop-blur-sm">
 <div className="bg-[#FAF8F5] w-full max-w-[500px] border-4 border-[#311B56] rounded-none shadow-[12px_12px_0px_#311B56] flex flex-col relative">
 <div className="p-8 border-b-4 border-[#311B56] flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-none border-2 border-[#311B56] bg-[#FAF8F5] shadow-[4px_4px_0px_#311B56] flex items-center justify-center text-[#311B56]">
 <Bell size={24} />
 </div>
 <div>
 <h2 className="text-[1.4rem] font-black font-mono tracking-widest uppercase text-[#311B56]">[ CÀI ĐẶT THÔNG BÁO ]</h2>
 <p className="text-[0.85rem] text-[#311B56]/80 font-mono font-bold mt-1 uppercase">[ Tùy chỉnh thông báo bạn muốn nhận ]</p>
 </div>
 </div>
 <button 
 className="w-10 h-10 rounded-none border-2 border-[#311B56] bg-[#FAF8F5] shadow-[4px_4px_0px_#311B56] hover:shadow-[2px_2px_0px_#311B56] hover:translate-y-[2px] flex items-center justify-center text-[#311B56] hover:text-[#FAF8F5] hover:bg-[#311B56] transition-all"
 onClick={() => setIsNotificationModalOpen(false)}
 >
 <X size={20} className="font-bold" />
 </button>
 </div>

 <div className="p-8 flex flex-col gap-6">
 <div className="flex items-center justify-between p-4 rounded-none bg-[#FAF8F5] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#311B56] cursor-pointer" onClick={() => handleToggle('newEpisodes')}>
 <div>
 <div className="text-[1.05rem] font-black font-mono uppercase tracking-widest text-[#311B56]">[ TẬP PHIM MỚI ]</div>
 <div className="text-[0.85rem] text-[#311B56]/80 font-mono font-bold mt-1">Thông báo khi có tập mới của phim đang theo dõi</div>
 </div>
 <div className={`w-12 h-6 border-2 border-[#311B56] rounded-none p-0.5 transition-colors duration-300 ease-in-out relative ${notificationSettings.newEpisodes ? 'bg-[#311B56]' : 'bg-[#FAF8F5]'}`}>
 <div className={`w-4 h-4 rounded-none bg-[#FAF8F5] border-2 border-[#311B56] transform transition-transform duration-300 ease-in-out absolute top-[1px] ${notificationSettings.newEpisodes ? 'translate-x-6' : 'translate-x-0'}`}></div>
 </div>
 </div>

 <div className="flex items-center justify-between p-4 rounded-none bg-[#FAF8F5] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#311B56] cursor-pointer" onClick={() => handleToggle('recommendations')}>
 <div>
 <div className="text-[1.05rem] font-black font-mono uppercase tracking-widest text-[#311B56]">[ GỢI Ý PHIM ]</div>
 <div className="text-[0.85rem] text-[#311B56]/80 font-mono font-bold mt-1">Nhận đề xuất phim dựa trên sở thích của bạn</div>
 </div>
 <div className={`w-12 h-6 border-2 border-[#311B56] rounded-none p-0.5 transition-colors duration-300 ease-in-out relative ${notificationSettings.recommendations ? 'bg-[#311B56]' : 'bg-[#FAF8F5]'}`}>
 <div className={`w-4 h-4 rounded-none bg-[#FAF8F5] border-2 border-[#311B56] transform transition-transform duration-300 ease-in-out absolute top-[1px] ${notificationSettings.recommendations ? 'translate-x-6' : 'translate-x-0'}`}></div>
 </div>
 </div>

 <div className="flex items-center justify-between p-4 rounded-none bg-[#FAF8F5] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#311B56] cursor-pointer" onClick={() => handleToggle('systemUpdates')}>
 <div>
 <div className="text-[1.05rem] font-black font-mono uppercase tracking-widest text-[#311B56]">[ CẬP NHẬT HỆ THỐNG ]</div>
 <div className="text-[0.85rem] text-[#311B56]/80 font-mono font-bold mt-1">Thông báo về tính năng mới và bảo trì</div>
 </div>
 <div className={`w-12 h-6 border-2 border-[#311B56] rounded-none p-0.5 transition-colors duration-300 ease-in-out relative ${notificationSettings.systemUpdates ? 'bg-[#311B56]' : 'bg-[#FAF8F5]'}`}>
 <div className={`w-4 h-4 rounded-none bg-[#FAF8F5] border-2 border-[#311B56] transform transition-transform duration-300 ease-in-out absolute top-[1px] ${notificationSettings.systemUpdates ? 'translate-x-6' : 'translate-x-0'}`}></div>
 </div>
 </div>
 </div>

 <div className="p-6 border-t-4 border-[#311B56] flex justify-end">
 <button 
 className="px-8 py-3.5 bg-[#FAF8F5] text-[#311B56] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#311B56] hover:bg-[#311B56] hover:text-[#FAF8F5] rounded-none font-black font-mono uppercase tracking-widest transition-all flex items-center gap-2"
 onClick={() => setIsNotificationModalOpen(false)}
 >
 <Check size={20} className="font-bold" /> [ LƯU CÀI ĐẶT ]
 </button>
 </div>
 </div>
 </div>
 );
};
