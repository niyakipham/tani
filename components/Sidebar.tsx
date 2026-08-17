'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { House, Compass, PlayCircle, Heart, History, Download, Moon, Sun, User, ChevronRight, MessageSquareText } from 'lucide-react';

export const Sidebar = () => {
  const { toggleTheme, theme, openSidePanel, userProfile, setIsStoryModeOpen } = useAppContext();

  return (
    <aside className="fixed top-0 left-0 w-[100px] h-screen bg-[#07130f]/90 backdrop-blur-sm flex flex-col py-8 z-50 items-center border-r border-[#7ef7c7]/15 transition-transform duration-300 max-lg:-translate-x-full shadow-[18px_0_40px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col gap-4 flex-1 w-full items-center">
        <a href="/" className="pixel-button flex items-center justify-center w-14 h-14 rounded-[18px] text-[#7ef7c7] transition-all cursor-pointer bg-[#0d1d1a] hover:bg-[#122c28]">
          <House size={24} />
        </a>
        <a href="#explore-section" className="pixel-button flex items-center justify-center w-14 h-14 rounded-[18px] text-[#7ad8ff] transition-all cursor-pointer bg-[#0d1d1a] hover:bg-[#112b2f]">
          <Compass size={24} />
        </a>
        <a href="/chat" title="Chat Chung" className="pixel-button flex items-center justify-center w-14 h-14 rounded-[18px] border border-[#7ef7c7]/35 text-[#7ef7c7] transition-all cursor-pointer bg-[#0d1d1a] hover:bg-[#112c29]">
          <MessageSquareText size={24} />
        </a>
        <button className="hidden pixel-button items-center justify-center w-14 h-14 rounded-[18px] text-[#7ef7c7] transition-all cursor-pointer bg-[#0d1d1a]" onClick={() => setIsStoryModeOpen(true)}>
          <PlayCircle size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full items-center mt-8">
        <button className="pixel-button flex items-center justify-center w-14 h-14 rounded-[18px] text-[#f5d6a8] transition-all cursor-pointer bg-[#0d1d1a] hover:bg-[#2a2018]" onClick={() => openSidePanel('fav')}>
          <Heart size={24} />
        </button>
        <button className="pixel-button flex items-center justify-center w-14 h-14 rounded-[18px] text-[#7ad8ff] transition-all cursor-pointer bg-[#0d1d1a] hover:bg-[#12262d]" onClick={() => openSidePanel('history')}>
          <History size={24} />
        </button>
        <button className="pixel-button flex items-center justify-center w-14 h-14 rounded-[18px] text-[#c8b8ff] transition-all cursor-pointer bg-[#0d1d1a] hover:bg-[#1d1b33]" onClick={() => openSidePanel('download')}>
          <Download size={24} />
        </button>
      </div>

      <div className="mt-auto flex items-center justify-center w-14 h-14 bg-transparent cursor-pointer transition-all" onClick={() => openSidePanel('fav')}>
        <div className="w-11 h-11 rounded-[16px] border border-[#7ef7c7]/20 bg-[#0d1d1a] shadow-[0_10px_18px_rgba(0,0,0,0.28)] hover:translate-y-[-1px] flex items-center justify-center text-[#ecfffb] text-xl overflow-hidden transition-all">
          {userProfile?.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover grayscale contrast-125" /> : <User size={20} />}
        </div>
      </div>
    </aside>
  );
};
