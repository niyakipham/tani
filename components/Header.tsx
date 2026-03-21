'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Database, Bell, ArrowRight } from 'lucide-react';
import { searchMovies } from '@/lib/api';
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
  const { setCurrentMovieSlug, setIsScanModalOpen, setIsNotificationModalOpen, recentSearches, addRecentSearch, clearRecentSearches } = useAppContext();

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
          if (data.status === 'success') {
            setSearchResults(data.data.items || []);
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
    <header className={`fixed top-0 right-0 w-[calc(100%-100px)] max-lg:w-full h-[80px] max-md:h-[70px] flex items-center justify-between px-8 lg:px-10 max-md:px-5 z-[500] transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-[#13141C]/95 border-b border-black/5 dark:border-white/5 backdrop-blur-xl' : 'bg-[#F4F7FB] dark:bg-[#13141C]'}`}>
      
      {/* Left: Logo */}
      <div className="flex-1 basis-0 flex items-center justify-start">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
            <span className="text-white font-black text-xl">T</span>
          </div>
          <div className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hidden sm:block">
            ANIME
          </div>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-[2] max-md:flex-[3] basis-0 flex justify-center max-md:px-2" ref={searchRef}>
        <div className="relative w-full max-w-[500px]">
          <div className="flex items-center gap-3.5 max-md:gap-2 bg-black/5 dark:bg-[#252836]/60 border border-transparent rounded-2xl py-3 px-6 max-md:py-2.5 max-md:px-3 transition-all focus-within:bg-white dark:focus-within:bg-[#252836] focus-within:border-black/10 dark:focus-within:border-white/10 focus-within:shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
            <Search size={20} className="text-[#808191] shrink-0 max-md:w-4 max-md:h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm hàng ngàn bộ Anime..."
              className="bg-transparent border-none text-black dark:text-white w-full outline-none text-[15px] font-medium placeholder:text-[#808191]"
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
            <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white dark:bg-[#252836] border border-black/5 dark:border-white/5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] shadow-[0_20px_40px_rgba(18,38,63,0.05)] max-h-[60vh] flex flex-col overflow-hidden z-[101]">
              <div className="overflow-y-auto p-3 flex-1">
                {searchQuery.trim() ? (
                  isSearching ? (
                    <div className="p-10 text-center text-[0.95rem] text-[#808191] font-semibold">Đang dò tìm tín hiệu...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.slice(0, 5).map((item) => (
                      <div key={item._id} className="flex gap-4 p-3 rounded-[14px] cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5" onClick={() => handleSelectMovie(item.slug)}>
                        <div className="w-14 h-20 rounded-lg bg-[#F8FAFC] dark:bg-[#13141C] overflow-hidden shrink-0">
                          <img src={`https://img.ophim.live/uploads/movies/${item.thumb_url}`} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/54x76/1F2937/00D1F5'; }} />
                        </div>
                        <div className="flex flex-col justify-center overflow-hidden">
                          <div className="text-base font-bold text-black dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
                          <div className="text-[0.8rem] text-[#808191] mt-1.5 font-semibold">{item.origin_name}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-[0.95rem] text-[#808191] font-semibold">Không tìm thấy Anime.</div>
                  )
                ) : (
                  recentSearches.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center px-3 py-2">
                        <span className="text-[0.85rem] font-bold text-[#808191] uppercase tracking-wider">Tìm kiếm gần đây</span>
                        <button className="text-[0.8rem] text-[#3B82F6] hover:underline" onClick={(e) => { e.stopPropagation(); clearRecentSearches(); }}>Xóa tất cả</button>
                      </div>
                      {recentSearches.map((query, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5" onClick={() => handleRecentSearchClick(query)}>
                          <Search size={16} className="text-[#808191]" />
                          <span className="text-[0.95rem] font-medium text-black dark:text-white">{query}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center text-[0.95rem] text-[#808191] font-semibold">Nhập tên phim để tìm kiếm...</div>
                  )
                )}
              </div>
              
              {!isSearching && searchQuery.trim() && (
                <div className="p-3 border-t border-black/5 dark:border-white/5 bg-[#F8FAFC]/50 dark:bg-[#1A1C23]/50">
                  <button 
                    className="w-full py-3 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] font-bold text-[0.95rem] flex items-center justify-center gap-2 transition-all hover:bg-[#3B82F6] hover:text-white"
                    onClick={handleSeeAllResults}
                  >
                    Xem tất cả kết quả cho &quot;{searchQuery}&quot; <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex-1 basis-0 flex items-center justify-end gap-3 sm:gap-4">
        <button className="w-11 h-11 rounded-full bg-transparent border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white text-[1.2rem] transition-all relative cursor-pointer hover:bg-[#F1F5F9] dark:hover:bg-[#252836] hover:text-black dark:hover:text-white" onClick={() => setIsScanModalOpen(true)} title="Công Cụ Quét Dữ Liệu">
          <Database size={20} />
        </button>
        <button className="w-11 h-11 rounded-full bg-transparent border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white text-[1.2rem] transition-all relative cursor-pointer hover:bg-[#F1F5F9] dark:hover:bg-[#252836] hover:text-black dark:hover:text-white" onClick={() => setIsNotificationModalOpen(true)}>
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF4757] rounded-full shadow-[0_0_0_2px_#13141C] dark:shadow-[0_0_0_2px_#13141C] shadow-[0_0_0_2px_#F4F7FB]"></span>
        </button>
      </div>
    </header>
  );
};
