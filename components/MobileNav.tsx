'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { House, Compass, PlayCircle, User } from 'lucide-react';

export const MobileNav = () => {
  const { openSidePanel, setIsStoryModeOpen, userProfile } = useAppContext();

  return (
    <nav className="hidden max-lg:flex fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#13141C]/95 backdrop-blur-[30px] border-t border-black/5 dark:border-white/5 z-[1000] px-6 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] justify-between">
      <a href="#" className="flex flex-col items-center gap-1.5 text-[#808191] text-[0.75rem] font-bold transition-all p-2 rounded-xl hover:text-white hover:bg-[#3B82F6]">
        <House size={24} />
        <span>Trang Chủ</span>
      </a>
      <a href="#explore-section" className="flex flex-col items-center gap-1.5 text-[#808191] text-[0.75rem] font-bold transition-all p-2 rounded-xl hover:text-white hover:bg-[#3B82F6]">
        <Compass size={24} />
        <span>Khám Phá</span>
      </a>
      <div className="flex flex-col items-center gap-1.5 text-[#808191] text-[0.75rem] font-bold transition-all p-2 rounded-xl cursor-pointer hover:text-white hover:bg-[#3B82F6]" onClick={() => setIsStoryModeOpen(true)}>
        <PlayCircle size={24} />
        <span>T-Story</span>
      </div>
      <div className="flex flex-col items-center gap-1.5 text-[#808191] text-[0.75rem] font-bold transition-all p-2 rounded-xl cursor-pointer hover:text-white hover:bg-[#3B82F6]" onClick={() => openSidePanel('fav')}>
        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-[#3B82F6] to-[#00D1F5]">
          {userProfile?.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={16} className="text-white" />}
        </div>
        <span>Cá Nhân</span>
      </div>
    </nav>
  );
};
