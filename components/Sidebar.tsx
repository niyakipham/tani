'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { House, Compass, PlayCircle, Heart, History, Download, Moon, Sun, User, ChevronRight, Music2 } from 'lucide-react';

export const Sidebar = () => {
  const { toggleTheme, theme, openSidePanel, userProfile, setIsStoryModeOpen } = useAppContext();

  return (
    <aside className="fixed top-0 left-0 w-[100px] h-screen bg-[#FAF8F5] flex flex-col py-8 z-50 items-center border-r-2 border-[#311B56] transition-transform duration-300 max-lg:-translate-x-full">
      <div className="flex flex-col gap-4 flex-1 w-full items-center">
        <a href="/" className="flex items-center justify-center w-14 h-14 rounded-none border-2 border-[#311B56] text-[#311B56] transition-all cursor-pointer hover:border-[#311B56] hover:shadow-[2px_2px_0px_#311B56] active:bg-[#311B56] active:text-[#FAF8F5] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none">
          <House size={24} />
        </a>
        <a href="#explore-section" className="flex items-center justify-center w-14 h-14 rounded-none border-2 border-[#311B56] text-[#311B56] transition-all cursor-pointer hover:border-[#311B56] hover:shadow-[2px_2px_0px_#311B56]">
          <Compass size={24} />
        </a>
        {/* Music Player Link */}
        <a href="/music" title="Music Player" className="flex items-center justify-center w-14 h-14 rounded-none border-2 border-[#7C3AED] text-[#7C3AED] transition-all cursor-pointer hover:bg-[#7C3AED] hover:text-white hover:shadow-[2px_2px_0px_#7C3AED]">
          <Music2 size={24} />
        </a>
        <button className="hidden items-center justify-center w-14 h-14 rounded-none border-2 border-[#311B56] text-[#311B56] transition-all cursor-pointer hover:border-[#311B56] hover:shadow-[2px_2px_0px_#311B56]" onClick={() => setIsStoryModeOpen(true)}>
          <PlayCircle size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full items-center mt-8">
        <button className="flex items-center justify-center w-14 h-14 rounded-none border-2 border-[#311B56] text-[#311B56] transition-all cursor-pointer hover:border-[#311B56] hover:shadow-[2px_2px_0px_#311B56]" onClick={() => openSidePanel('fav')}>
          <Heart size={24} />
        </button>
        <button className="flex items-center justify-center w-14 h-14 rounded-none border-2 border-[#311B56] text-[#311B56] transition-all cursor-pointer hover:border-[#311B56] hover:shadow-[2px_2px_0px_#311B56]" onClick={() => openSidePanel('history')}>
          <History size={24} />
        </button>
        <button className="flex items-center justify-center w-14 h-14 rounded-none border-2 border-[#311B56] text-[#311B56] transition-all cursor-pointer hover:border-[#311B56] hover:shadow-[2px_2px_0px_#311B56]" onClick={() => openSidePanel('download')}>
          <Download size={24} />
        </button>
      </div>

      <div className="mt-auto flex items-center justify-center w-14 h-14 bg-transparent cursor-pointer transition-all" onClick={() => openSidePanel('fav')}>
        <div className="w-11 h-11 rounded-none border-2 border-[#311B56] bg-[#FAF8F5] shadow-[2px_2px_0px_#311B56] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] flex items-center justify-center text-[#311B56] text-xl overflow-hidden transition-all">
          {userProfile?.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover grayscale contrast-125" /> : <User size={20} />}
        </div>
      </div>
    </aside>
  );
};
