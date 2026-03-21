'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { House, Compass, PlayCircle, Heart, History, Download, Moon, Sun, User, ChevronRight } from 'lucide-react';

export const Sidebar = () => {
  const { toggleTheme, theme, openSidePanel, userProfile, setIsStoryModeOpen } = useAppContext();

  return (
    <aside className="fixed top-0 left-0 w-[100px] h-screen bg-[#1A1C23] flex flex-col py-8 z-50 items-center border-r border-white/5 transition-transform duration-300 max-lg:-translate-x-full dark:bg-[#1A1C23] bg-white dark:border-white/5 border-black/5">
      <div className="flex flex-col gap-4 flex-1 w-full items-center">
        <a href="#" className="flex items-center justify-center w-14 h-14 rounded-2xl text-[#808191] font-bold transition-all cursor-pointer hover:text-white hover:bg-white/5 active:bg-[#3B82F6] active:text-white active:shadow-[0_10px_30px_rgba(59,130,246,0.35)]">
          <House size={24} className="transition-transform hover:scale-110" />
        </a>
        <a href="#explore-section" className="flex items-center justify-center w-14 h-14 rounded-2xl text-[#808191] font-bold transition-all cursor-pointer hover:text-white hover:bg-white/5">
          <Compass size={24} className="transition-transform hover:scale-110" />
        </a>
        <button className="hidden items-center justify-center w-14 h-14 rounded-2xl text-[#808191] font-bold transition-all cursor-pointer hover:text-white hover:bg-white/5" onClick={() => setIsStoryModeOpen(true)}>
          <PlayCircle size={24} className="transition-transform hover:scale-110" />
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full items-center mt-8">
        <button className="flex items-center justify-center w-14 h-14 rounded-2xl text-[#808191] font-bold transition-all cursor-pointer hover:text-white hover:bg-white/5" onClick={() => openSidePanel('fav')}>
          <Heart size={24} className="transition-transform hover:scale-110" />
        </button>
        <button className="flex items-center justify-center w-14 h-14 rounded-2xl text-[#808191] font-bold transition-all cursor-pointer hover:text-white hover:bg-white/5" onClick={() => openSidePanel('history')}>
          <History size={24} className="transition-transform hover:scale-110" />
        </button>
        <button className="flex items-center justify-center w-14 h-14 rounded-2xl text-[#808191] font-bold transition-all cursor-pointer hover:text-white hover:bg-white/5" onClick={() => openSidePanel('download')}>
          <Download size={24} className="transition-transform hover:scale-110" />
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full items-center mt-8 mb-6">
        <button className="flex items-center justify-center w-14 h-14 rounded-2xl text-[#808191] font-bold transition-all cursor-pointer hover:text-white hover:bg-white/5" onClick={toggleTheme} title="Đổi Giao Diện">
          {theme === 'dark' ? <Moon size={24} className="transition-transform hover:scale-110" /> : <Sun size={24} className="transition-transform hover:scale-110" />}
        </button>
      </div>

      <div className="mt-auto flex items-center justify-center w-14 h-14 bg-transparent rounded-2xl cursor-pointer transition-all hover:bg-white/5" onClick={() => openSidePanel('fav')}>
        <div className="w-11 h-11 rounded-2xl bg-[#252836] flex items-center justify-center text-white text-xl overflow-hidden border border-white/5 dark:bg-[#252836] bg-[#F1F5F9] dark:border-white/5 border-black/5 dark:text-white text-black">
          {userProfile?.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={20} />}
        </div>
      </div>
    </aside>
  );
};
