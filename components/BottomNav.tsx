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
 <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[360px] h-[64px] bg-[#FAF8F5] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] z-[900] flex items-center justify-around px-2 md:hidden">
 {navItems.map((item) => {
 const Icon = item.icon;
 const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
 
 return (
 <Link 
 key={item.id} 
 href={item.path}
 className={`w-12 h-12 flex items-center justify-center rounded-none border-2 border-[#311B56] transition-all duration-300 relative group ${isActive ? 'bg-[#311B56] text-[#FAF8F5] border-[#311B56] translate-y-[-2px] shadow-[2px_2px_0px_#311B56]' : 'text-[#311B56] hover:bg-[#311B56]/10'}`}
 >
 <Icon size={24} className={`relative z-10 transition-transform ${isActive ? 'scale-110 fill-current' : 'group-hover:scale-110'}`} />
 </Link>
 );
 })}
 </div>
 );
};
