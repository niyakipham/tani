'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Database, Bell, ArrowRight, Moon, Sun } from 'lucide-react';
import { getApiItems, isApiSuccess, searchMovies } from '@/lib/api';
import { useAppContext } from '@/lib/store';

export const Header = () => {
 const router = useRouter();
 const searchParams = useSearchParams();
 const queryParam = searchParams.get('q') || '';
 
 const [isScrolled, setIsScrolled] = useState(false);
 const [searchQuery, setSearchQuery] = useState(queryParam);
 const [searchResults, setSearchResults] = useState<any[]>([]);
 const [isSearching, setIsSearching] = useState(false);
 const [showDropdown, setShowDropdown] = useState(false);
 const searchRef = useRef<HTMLDivElement>(null);
 const { theme, toggleTheme, setCurrentMovieSlug, setIsScanModalOpen, setIsNotificationModalOpen, recentSearches, addRecentSearch, clearRecentSearches } = useAppContext();

 useEffect(() => {
 setSearchQuery(queryParam);
 }, [queryParam]);

 useEffect(() => {
 const handleScroll = () => {
 setIsScrolled(window.scrollY > 50);
 };
 window.addEventListener('scroll', handleScroll);
 return () => window.removeEventListener('scroll', handleScroll);
 }, []);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
 setShowDropdown(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 useEffect(() => {
 const delayDebounceFn = setTimeout(async () => {
 if (searchQuery.trim()) {
 setIsSearching(true);
 try {
 const data = await searchMovies(searchQuery);
 if (isApiSuccess(data)) {
 setSearchResults(getApiItems(data));
 } else {
 setSearchResults([]);
 }
 } catch (error) {
 console.error(error);
 setSearchResults([]);
 } finally {
 setIsSearching(false);
 }
 } else {
 setSearchResults([]);
 }
 }, 500);

 return () => clearTimeout(delayDebounceFn);
 }, [searchQuery]);

 const handleSelectMovie = (slug: string) => {
 if (searchQuery.trim()) {
 addRecentSearch(searchQuery.trim());
 }
 setCurrentMovieSlug(slug);
 setShowDropdown(false);
 setSearchQuery('');
 if (window.location.pathname !== '/') {
 router.push('/');
 } else {
 window.scrollTo({ top: 0, behavior: 'smooth' });
 }
 };

 const handleSeeAllResults = () => {
 if (searchQuery.trim()) {
 addRecentSearch(searchQuery.trim());
 setShowDropdown(false);
 router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
 }
 };

 const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
 if (e.key === 'Enter') {
 handleSeeAllResults();
 }
 };

 const handleRecentSearchClick = (query: string) => {
 setSearchQuery(query);
 setShowDropdown(true);
 router.push(`/search?q=${encodeURIComponent(query)}`);
 };

 return (
 <header className={`fixed top-0 right-0 w-[calc(100%-100px)] max-lg:w-full h-[80px] max-md:h-[70px] flex items-center justify-between px-8 lg:px-10 max-md:px-5 z-[500] transition-all duration-300 ${isScrolled ? 'bg-[#FAF8F5]/95 border-b-[3px] border-[#311B56] backdrop-blur-xl shadow-[0_6px_0_#311B56]' : 'bg-[#FAF8F5]'}`}>
 
 {/* Left: Logo */}
 <div className="flex-1 basis-0 flex items-center justify-start">
 <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
 <div className="flex items-center gap-2">
 <span className="text-[#311B56] font-mono text-2xl font-bold tracking-tighter">[</span>
 <span className="text-[#311B56] font-black text-xl tracking-[0.2em] mt-0.5">T-ANIME</span>
 <span className="text-[#311B56] font-mono text-2xl font-bold tracking-tighter">]</span>
 </div>
 </div>
 </div>

 {/* Center: Search */}
 <div className="flex-[2] max-md:flex-[3] basis-0 flex justify-center max-md:px-2" ref={searchRef}>
 <div className="relative w-full max-w-[500px]">
 <div className="flex items-center gap-3.5 max-md:gap-2 bg-[#FAF8F5] border-[3px] border-[#311B56] shadow-[5px_5px_0px_#311B56] py-3 px-6 max-md:py-2.5 max-md:px-3 transition-all focus-within:translate-y-[2px] focus-within:translate-x-[2px] focus-within:shadow-[2px_2px_0px_#311B56]">

 <Search size={20} className="text-[#311B56] shrink-0 max-md:w-4 max-md:h-4" />
 <input 
 type="text" 
 placeholder="Tìm kiếm hàng ngàn bộ Anime..." 
 className="bg-transparent border-none text-[#311B56] w-full outline-none text-[15px] font-medium placeholder:text-[#311B56]/60 font-mono"
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 if (e.target.value.trim()) setShowDropdown(true);
 }}
 onFocus={() => searchQuery.trim() && setShowDropdown(true)}
 onKeyDown={handleKeyDown}
 />
 </div>
 
 {showDropdown && (
 <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-[#FAF8F5] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] max-h-[60vh] flex flex-col overflow-hidden z-[101]">
 <div className="overflow-y-auto p-3 flex-1">
 {searchQuery.trim() ? (
 isSearching ? (
 <div className="p-10 text-center text-[0.95rem] text-[#8A74A3] font-semibold">Đang dò tìm tín hiệu...</div>
 ) : searchResults.length > 0 ? (
 searchResults.slice(0, 5).map((item) => (
 <div key={item._id} className="flex gap-4 p-3 rounded-none border-b border-[#311B56]/20 cursor-pointer transition-all hover:bg-[#311B56]/5" onClick={() => handleSelectMovie(item.slug)}>
 <div className="w-14 h-20 rounded-none bg-[#FAF8F5] border border-[#311B56] overflow-hidden shrink-0">
 <img src={`https://img.ophim.live/uploads/movies/${item.thumb_url}`} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/54x76/1F2937/00D1F5'; }} />
 </div>
 <div className="flex flex-col justify-center overflow-hidden">
 <div className="text-base font-bold text-[#311B56] whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
 <div className="text-[0.8rem] text-[#311B56]/70 mt-1.5 font-mono">{item.origin_name}</div>
 </div>
 </div>
 ))
 ) : (
 <div className="p-10 text-center text-[0.95rem] text-[#8A74A3] font-semibold">Không tìm thấy Anime.</div>
 )
 ) : (
 recentSearches.length > 0 ? (
 <div className="flex flex-col">
 <div className="flex justify-between items-center px-3 py-2 border-b border-[#311B56]/20">
 <span className="text-[0.85rem] font-bold text-[#311B56] uppercase tracking-wider font-mono">[ HISTORY ]</span>
 <button className="text-[0.8rem] text-[#311B56] hover:underline font-mono" onClick={(e) => { e.stopPropagation(); clearRecentSearches(); }}>CLEAR</button>
 </div>
 {recentSearches.map((query, idx) => (
 <div key={idx} className="flex items-center gap-3 p-3 border-b border-[#311B56]/10 cursor-pointer transition-all hover:bg-[#311B56]/5" onClick={() => handleRecentSearchClick(query)}>
 <Search size={16} className="text-[#311B56]/70" />
 <span className="text-[0.95rem] font-medium text-[#311B56] font-mono">{query}</span>
 </div>
 ))}
 </div>
 ) : (
 <div className="p-10 text-center text-[0.95rem] text-[#8A74A3] font-semibold">Nhập tên phim để tìm kiếm...</div>
 )
 )}
 </div>
 
 {!isSearching && searchQuery.trim() && (
 <div className="p-3 border-t-2 border-[#311B56] bg-[#FAF8F5]">
 <button 
 className="w-full py-3 rounded-none border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] bg-[#311B56] text-[#FAF8F5] font-bold text-[0.95rem] flex items-center justify-center gap-2 transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none font-mono" 
 onClick={handleSeeAllResults}
 >
 [ VIEW ALL ] <ArrowRight size={16} />
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 {/* Right: Actions */}
 <div className="flex-1 basis-0 flex items-center justify-end gap-2 sm:gap-4">

 <button className="w-10 h-10 max-md:w-9 max-md:h-9 rounded-none border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] bg-[#FAF8F5] flex items-center justify-center text-[#311B56] text-[1.2rem] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none" onClick={() => setIsScanModalOpen(true)} title="Công Cụ Quét Dữ Liệu">
 <Database size={18} />
 </button>
 <button className="w-10 h-10 max-md:w-9 max-md:h-9 rounded-none border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] bg-[#FAF8F5] flex items-center justify-center text-[#311B56] text-[1.2rem] transition-all relative hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none" onClick={() => setIsNotificationModalOpen(true)}>
 <Bell size={18} />
 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#A57CC6] rounded-none border border-[#311B56]"></span>
 </button>
 </div>
 </header>
 );
};
