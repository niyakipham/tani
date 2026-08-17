'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Search, Flame, Heart, MessageSquareText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/lib/store';

export const BottomNav = () => {
  const pathname = usePathname();
  const { isWatchPartyOpen } = useAppContext();
  
  const navItems = [
    { icon: Home,   path: '/',       id: 'home' },
    { icon: Search, path: '/search', id: 'search' },
    { icon: MessageSquareText, path: '/chat', id: 'chat' },
    { icon: Heart,  path: '/favorites', id: 'favorites' },
  ];

  // Ẩn Bottom Nav khi mở Trạm Điểm Gian tránh vướng phím
  if (isWatchPartyOpen) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[380px] h-[64px] bg-[#091613]/95 border border-[#7ef7c7]/20 shadow-[0_0_28px_rgba(126,247,199,0.1)] z-[900] flex items-center justify-around px-2 md:hidden rounded-[18px]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
        const isChatTab = item.id === 'chat';
        
        return (
          <Link 
            key={item.id} 
            href={item.path}
            className={`w-12 h-12 flex items-center justify-center rounded-[14px] border transition-all duration-300 relative group ${
              isActive
                ? isChatTab
                  ? 'bg-[#7ef7c7] text-[#07130f] border-[#7ef7c7] translate-y-[-2px] shadow-[0_0_24px_rgba(126,247,199,0.24)]'
                  : 'bg-[#112a27] text-[#ecfffb] border-[#7ef7c7]/30 translate-y-[-2px] shadow-[0_0_18px_rgba(126,247,199,0.12)]'
                : isChatTab
                  ? 'text-[#7ef7c7] border-[#7ef7c7]/20 hover:bg-[#112c29]'
                  : 'text-[#96c9bb] border-[#7ef7c7]/10 hover:bg-[#112620]'
            }`}
          >
            <Icon size={24} className={`relative z-10 transition-transform ${isActive ? 'scale-110 fill-current' : 'group-hover:scale-110'}`} />
          </Link>
        );
      })}
    </div>
  );
};
