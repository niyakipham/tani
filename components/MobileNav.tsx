'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { House, Compass, PlayCircle, User } from 'lucide-react';

export const MobileNav = () => {
 const { openSidePanel, setIsStoryModeOpen, userProfile } = useAppContext();

 return (
 <nav className="hidden max-lg:flex fixed bottom-0 left-0 w-full bg-[#FAF8F5] border-t-4 border-[#311B56] z-[1000] px-4 py-2 pb-[calc(8px+env(safe-area-inset-bottom))] justify-between">
 <a href="#" className="flex flex-col items-center gap-1 text-[#311B56] text-[0.7rem] font-black font-mono tracking-widest uppercase transition-all p-2 rounded-none hover:text-[#FAF8F5] hover:bg-[#311B56] border-2 border-[#311B56] hover:border-[#311B56] hover:shadow-[2px_2px_0px_#311B56] hover:-translate-y-1">
 <House size={24} className="mb-1" />
 <span>[ NHÀ ]</span>
 </a>
 <a href="#explore-section" className="flex flex-col items-center gap-1 text-[#311B56] text-[0.7rem] font-black font-mono tracking-widest uppercase transition-all p-2 rounded-none hover:text-[#FAF8F5] hover:bg-[#311B56] border-2 border-[#311B56] hover:border-[#311B56] hover:shadow-[2px_2px_0px_#311B56] hover:-translate-y-1">
 <Compass size={24} className="mb-1" />
 <span>[ KHÁM PHÁ ]</span>
 </a>
 <div className="flex flex-col items-center gap-1 text-[#311B56] text-[0.7rem] font-black font-mono tracking-widest uppercase transition-all p-2 rounded-none cursor-pointer hover:text-[#FAF8F5] hover:bg-[#311B56] border-2 border-[#311B56] hover:border-[#311B56] hover:shadow-[2px_2px_0px_#311B56] hover:-translate-y-1" onClick={() => setIsStoryModeOpen(true)}>
 <PlayCircle size={24} className="mb-1" />
 <span>[ T-STORY ]</span>
 </div>
 <div className="flex flex-col items-center gap-1 text-[#311B56] text-[0.7rem] font-black font-mono tracking-widest uppercase transition-all p-2 rounded-none cursor-pointer hover:text-[#FAF8F5] hover:bg-[#311B56] border-2 border-[#311B56] hover:border-[#311B56] hover:shadow-[2px_2px_0px_#311B56] hover:-translate-y-1" onClick={() => openSidePanel('fav')}>
 <div className="w-6 h-6 rounded-none border border-current overflow-hidden flex items-center justify-center bg-[#FAF8F5] mb-1 shadow-[2px_2px_0px_currentColor]">
 {userProfile?.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover grayscale contrast-125" /> : <User size={16} className="text-current" />}
 </div>
 <span>[ CÁ NHÂN ]</span>
 </div>
 </nav>
 );
};
