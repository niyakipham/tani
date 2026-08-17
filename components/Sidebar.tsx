'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { House, Compass, PlayCircle, Heart, History, Download, Moon, Sun, User, ChevronRight, Music2 } from 'lucide-react';

export const Sidebar = () => {
  const { toggleTheme, theme, openSidePanel, userProfile, setIsStoryModeOpen } = useAppContext();

  return (
    <aside className="fixed top-0 left-0 w-[100px] h-screen bg-[#fdfaf6]/90 backdrop-blur-sm flex flex-col py-8 z-50 items-center border-r border-[#1f1a1d]/10 transition-transform duration-300 max-lg:-translate-x-full shadow-[18px_0_40px_rgba(31,26,29,0.05)]">
      <div className="flex flex-col gap-4 flex-1 w-full items-center">
        <a href="/" className="pixel-button flex items-center justify-center w-14 h-14 rounded-[20px] text-[#1f1a1d] transition-all cursor-pointer bg-[#fff] hover:bg-[#f6ebff]">
          <House size={24} />
        </a>
        <a href="#explore-section" className="pixel-button flex items-center justify-center w-14 h-14 rounded-[20px] text-[#1f1a1d] transition-all cursor-pointer bg-[#fff] hover:bg-[#f0f7f2]">
          <Compass size={24} />
        </a>
        <a href="/music" title="Music Player" className="pixel-button flex items-center justify-center w-14 h-14 rounded-[20px] border border-[#d7b4ea] text-[#8c5ab2] transition-all cursor-pointer bg-[#f8f3ff] hover:bg-[#efe0ff]">
          <Music2 size={24} />
        </a>
        <button className="hidden pixel-button items-center justify-center w-14 h-14 rounded-[20px] text-[#1f1a1d] transition-all cursor-pointer bg-[#fff]" onClick={() => setIsStoryModeOpen(true)}>
          <PlayCircle size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full items-center mt-8">
        <button className="pixel-button flex items-center justify-center w-14 h-14 rounded-[20px] text-[#1f1a1d] transition-all cursor-pointer bg-[#fff] hover:bg-[#fff0ec]" onClick={() => openSidePanel('fav')}>
          <Heart size={24} />
        </button>
        <button className="pixel-button flex items-center justify-center w-14 h-14 rounded-[20px] text-[#1f1a1d] transition-all cursor-pointer bg-[#fff] hover:bg-[#edf5ff]" onClick={() => openSidePanel('history')}>
          <History size={24} />
        </button>
        <button className="pixel-button flex items-center justify-center w-14 h-14 rounded-[20px] text-[#1f1a1d] transition-all cursor-pointer bg-[#fff] hover:bg-[#eefaf4]" onClick={() => openSidePanel('download')}>
          <Download size={24} />
        </button>
      </div>

      <div className="mt-auto flex items-center justify-center w-14 h-14 bg-transparent cursor-pointer transition-all" onClick={() => openSidePanel('fav')}>
        <div className="w-11 h-11 rounded-[18px] border border-[#1f1a1d]/10 bg-[#fff8f3] shadow-[0_10px_18px_rgba(31,26,29,0.08)] hover:translate-y-[-1px] flex items-center justify-center text-[#1f1a1d] text-xl overflow-hidden transition-all">
          {userProfile?.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover grayscale contrast-125" /> : <User size={20} />}
        </div>
      </div>
    </aside>
  );
};
