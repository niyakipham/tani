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
    <div className="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1A1C23] w-full max-w-[500px] rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] shadow-[0_20px_60px_rgba(18,38,63,0.1)] flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="text-[1.4rem] font-black text-black dark:text-white tracking-tight">Cài Đặt Thông Báo</h2>
              <p className="text-[0.9rem] text-[#808191] font-medium mt-1">Tùy chỉnh thông báo bạn muốn nhận</p>
            </div>
          </div>
          <button 
            className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#808191] hover:text-black dark:hover:text-white hover:bg-[#FF4757] dark:hover:bg-[#FF4757] transition-all"
            onClick={() => setIsNotificationModalOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#252836] dark:bg-[#252836] bg-[#F8FAFC] border border-black/5 dark:border-transparent transition-all hover:bg-[#353945] dark:hover:bg-[#353945] hover:bg-[#F1F5F9] cursor-pointer" onClick={() => handleToggle('newEpisodes')}>
            <div>
              <div className="text-[1.05rem] font-bold text-black dark:text-white">Tập Phim Mới</div>
              <div className="text-[0.85rem] text-[#808191] mt-1">Thông báo khi có tập mới của phim đang theo dõi</div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${notificationSettings.newEpisodes ? 'bg-[#3B82F6]' : 'bg-[#353945] dark:bg-[#353945] bg-[#E2E8F0]'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${notificationSettings.newEpisodes ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#252836] dark:bg-[#252836] bg-[#F8FAFC] border border-black/5 dark:border-transparent transition-all hover:bg-[#353945] dark:hover:bg-[#353945] hover:bg-[#F1F5F9] cursor-pointer" onClick={() => handleToggle('recommendations')}>
            <div>
              <div className="text-[1.05rem] font-bold text-black dark:text-white">Gợi Ý Phim</div>
              <div className="text-[0.85rem] text-[#808191] mt-1">Nhận đề xuất phim dựa trên sở thích của bạn</div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${notificationSettings.recommendations ? 'bg-[#3B82F6]' : 'bg-[#353945] dark:bg-[#353945] bg-[#E2E8F0]'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${notificationSettings.recommendations ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#252836] dark:bg-[#252836] bg-[#F8FAFC] border border-black/5 dark:border-transparent transition-all hover:bg-[#353945] dark:hover:bg-[#353945] hover:bg-[#F1F5F9] cursor-pointer" onClick={() => handleToggle('systemUpdates')}>
            <div>
              <div className="text-[1.05rem] font-bold text-black dark:text-white">Cập Nhật Hệ Thống</div>
              <div className="text-[0.85rem] text-[#808191] mt-1">Thông báo về tính năng mới và bảo trì</div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${notificationSettings.systemUpdates ? 'bg-[#3B82F6]' : 'bg-[#353945] dark:bg-[#353945] bg-[#E2E8F0]'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${notificationSettings.systemUpdates ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-black/5 dark:border-white/5 flex justify-end">
          <button 
            className="px-8 py-3.5 bg-[#3B82F6] text-white rounded-xl font-bold transition-all hover:bg-[#2563EB] hover:-translate-y-1 shadow-[0_4px_15px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.6)] flex items-center gap-2"
            onClick={() => setIsNotificationModalOpen(false)}
          >
            <Check size={20} /> Lưu Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
};
