'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Search, Flame, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/lib/store';

export const BottomNav = () => {
  const pathname = usePathname();
  const { isWatchPartyOpen } = useAppContext();
  
  const navItems = [
    { icon: Home, path: '/', id: 'home' },
    { icon: Search, path: '/search', id: 'search' },
    { icon: Flame, path: '/trending', id: 'trending' },
    { icon: Heart, path: '/favorites', id: 'favorites' },
  ];

  // Ẩn Bottom Nav khi mở Trạm Điểm Gian tránh vướng phím
  if (isWatchPartyOpen) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[360px] h-[64px] bg-black/60 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[900] flex items-center justify-around px-2 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
        
        return (
          <Link 
            key={item.id} 
            href={item.path}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 relative group ${isActive ? 'text-white' : 'text-[#808191] hover:text-white'}`}
          >
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full opacity-100 transition-opacity"></div>
            )}
            <Icon size={24} className={`relative z-10 transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] fill-white' : 'group-hover:scale-110'}`} />
            
            {isActive && (
              <div className="absolute -bottom-2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]"></div>
            )}
          </Link>
        );
      })}
    </div>
  );
};
