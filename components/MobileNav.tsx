'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { House, Compass, PlayCircle, User } from 'lucide-react';

export const MobileNav = () => {
  const { openSidePanel, setIsStoryModeOpen, userProfile } = useAppContext();

  const base =
    'flex flex-col items-center gap-1 text-[0.7rem] font-black font-mono tracking-widest uppercase transition-all py-3 rounded-[14px] border border-[var(--terminal-border)] hover:translate-y-[-2px] hover:shadow-[0_0_18px_rgba(126,247,199,0.12)]';

  return (
    <nav className="hidden max-lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] h-[64px] bg-[var(--terminal-panel)]/95 border border-[var(--terminal-border-strong)] shadow-[0_0_28px_rgba(126,247,199,0.08)] z-[900] items-center justify-around px-2 rounded-[18px] backdrop-blur-xl">
      <a href="/" className={`${base} text-[var(--terminal-muted)] hover:text-[var(--terminal-green)] hover:bg-[var(--terminal-bg-2)]/60`}>
        <House size={24} className="mb-1" />
        <span>[ NHÀ ]</span>
      </a>
      <a href="#explore-section" className={`${base} text-[var(--terminal-muted)] hover:text-[var(--terminal-cyan)] hover:bg-[var(--terminal-bg-2)]/60`}>
        <Compass size={24} className="mb-1" />
        <span>[ KHÁM PHÁ ]</span>
      </a>
      <div
        className={`${base} text-[var(--terminal-muted)] hover:text-[var(--terminal-green)] hover:bg-[var(--terminal-bg-2)]/60 cursor-pointer`}
        onClick={() => setIsStoryModeOpen(true)}
      >
        <PlayCircle size={24} className="mb-1" />
        <span>[ T-STORY ]</span>
      </div>
      <div
        className={`${base} text-[var(--terminal-muted)] hover:text-[var(--terminal-green)] hover:bg-[var(--terminal-bg-2)]/60 cursor-pointer`}
        onClick={() => openSidePanel('fav')}
      >
        <div className="w-6 h-6 rounded-[10px] border border-[var(--terminal-border)] overflow-hidden flex items-center justify-center bg-[var(--terminal-bg-2)] mb-1 shadow-[0_0_8px_rgba(0,0,0,0.22)]">
          {userProfile?.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover grayscale contrast-125" /> : <User size={16} className="text-[var(--terminal-muted)]" />}
        </div>
        <span>[ CÁ NHÂN ]</span>
      </div>
    </nav>
  );
};
