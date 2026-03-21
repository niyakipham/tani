'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Loader2, Heart } from 'lucide-react';
import { useAppContext } from '@/lib/store';
import { fetchMoviesByGenre } from '@/lib/api';

const ALL_GENRES = [
  { name: 'Hành Động', slug: 'hanh-dong' }, { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Hài Hước', slug: 'hai-huoc' }, { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Tâm Lý', slug: 'tam-ly' }, { name: 'Hình Sự', slug: 'hinh-su' },
  { name: 'Chiến Tranh', slug: 'chien-tranh' }, { name: 'Thể Thao', slug: 'the-thao' },
  { name: 'Võ Thuật', slug: 'vo-thuat' }, { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu' }, { name: 'Khoa Học', slug: 'khoa-hoc' },
  { name: 'Kinh Dị', slug: 'kinh-di' }, { name: 'Âm Nhạc', slug: 'am-nhac' },
  { name: 'Thần Thoại', slug: 'than-thoai' }, { name: 'Tài Liệu', slug: 'tai-lieu' },
  { name: 'Gia Đình', slug: 'gia-dinh' }, { name: 'Chính kịch', slug: 'chinh-kich' },
  { name: 'Bí ẩn', slug: 'bi-an' }, { name: 'Học Đường', slug: 'hoc-duong' },
  { name: 'Kinh Điển', slug: 'kinh-dien' }, { name: 'Phim 18+', slug: 'phim-18' },
  { name: 'Short Drama', slug: 'short-drama' }
];

export const MovieCard = ({ item, onClick }: { item: any, onClick: () => void }) => {
  const { favorites, toggleFavorite } = useAppContext();
  const [isHovered, setIsHovered] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const isLiked = favorites.some((f: any) => f.slug === item.slug);

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(true);
    }, 600); // 600ms delay before showing preview
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    setIsHovered(false);
  };

  return (
    <div 
      className="bg-transparent rounded-xl overflow-hidden transition-all cursor-pointer flex flex-col relative group hover:-translate-y-2" 
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#1A1C23] dark:bg-[#1A1C23] bg-[#F8FAFC] rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_20px_rgba(0,0,0,0.3)] shadow-[0_10px_20px_rgba(0,0,0,0.03)]">
        
        {/* Placeholder Image Loading */}
        {!isImgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F1F5F9] dark:bg-[#1A1C23] z-[1]">
            <div className="w-8 h-8 border-4 border-black/10 border-t-[#3B82F6] rounded-full animate-spin dark:border-white/10 dark:border-t-[#3B82F6]"></div>
          </div>
        )}

        <img 
          src={`https://img.ophim.live/uploads/movies/${item.thumb_url}`} 
          alt={item.name} 
          loading="lazy"
          onLoad={() => setIsImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-800 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105 relative z-[2] ${isHovered ? 'opacity-0' : isImgLoaded ? 'opacity-100' : 'opacity-0'}`} 
          onError={(e) => { 
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300/1F2937/00D1F5'; 
            setIsImgLoaded(true);
          }} 
        />
        
        {isHovered && (
          <video 
            src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover absolute inset-0 z-0 animate-in fade-in duration-500"
          />
        )}

        <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-400 group-hover:opacity-100 z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-3 opacity-0 transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:opacity-100 z-20 w-[80%] max-w-[120px]">
          {/* Nút Play */}
          <div className="scale-80 group-hover:scale-100 transition-transform duration-400 w-14 h-14 rounded-full bg-black/20 hover:bg-black/50 border-2 border-white text-white flex items-center justify-center backdrop-blur-sm shrink-0">
            <Play size={24} className="fill-current ml-1" />
          </div>
          
          {/* Nút Lưu (Favorites) */}
          <button 
            className={`scale-80 group-hover:scale-100 transition-all duration-400 delay-75 w-11 h-11 rounded-full border flex items-center justify-center backdrop-blur-sm shrink-0 cursor-pointer
              ${isLiked 
                ? 'bg-[#FF4757] border-[#FF4757] text-white shadow-[0_0_15px_rgba(255,71,87,0.5)]' 
                : 'bg-black/20 border-white/50 text-white hover:bg-[#FF4757] hover:border-[#FF4757] hover:scale-110'
              }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item);
            }}
            title={isLiked ? "Bỏ Lưu" : "Lưu Phim"}
          >
            <Heart size={18} className={isLiked ? "fill-current" : ""} />
          </button>
        </div>
      </div>
      <div className="w-full pt-4 flex flex-col z-10">
        <div className="text-[1.05rem] font-bold text-black dark:text-white leading-[1.4] line-clamp-1">{item.name}</div>
        <div className="text-[0.85rem] text-black dark:text-white mt-2.5 font-semibold bg-[#F1F5F9] dark:bg-[#353945] px-4 py-2 rounded-full inline-flex items-center justify-between w-full transition-all group-hover:bg-[#3B82F6] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black after:content-['➔'] after:ml-auto">
          {item.year}
        </div>
      </div>
    </div>
  );
};

export const MovieCardSkeleton = () => {
  return (
    <div className="bg-transparent rounded-xl overflow-hidden flex flex-col relative">
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#1A1C23] dark:bg-[#1A1C23] bg-[#F8FAFC] rounded-xl animate-pulse">
      </div>
      <div className="w-full pt-4 flex flex-col gap-2">
        <div className="h-5 bg-[#1A1C23] dark:bg-[#1A1C23] bg-[#F8FAFC] rounded-md w-3/4 animate-pulse"></div>
        <div className="h-8 bg-[#F1F5F9] dark:bg-[#353945] rounded-full w-full animate-pulse mt-1"></div>
      </div>
    </div>
  );
};

export const ExploreSection = () => {
  const { preferences, setCurrentMovieSlug } = useAppContext();
  const [currentTabSlug, setCurrentTabSlug] = useState('');
  const [movies, setMovies] = useState<any[]>([]);
  const [apiPage, setApiPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const observerTarget = useRef(null);

  const sortedGenres = [...ALL_GENRES].sort((a, b) => (preferences.includes(b.slug) ? 1 : 0) - (preferences.includes(a.slug) ? 1 : 0));

  useEffect(() => {
    if (preferences.length > 0 && !currentTabSlug) {
      setCurrentTabSlug(preferences[0]);
    } else if (!currentTabSlug) {
      setCurrentTabSlug(ALL_GENRES[0].slug);
    }
  }, [preferences]);

  const fetchMoreData = useCallback(async () => {
    if (isFetching || !hasMoreData || !currentTabSlug) return;
    setIsFetching(true);
    try {
      const data = await fetchMoviesByGenre(currentTabSlug, apiPage);
      if (data.status === 'success' && data.data.items.length > 0) {
        setMovies(prev => [...prev, ...data.data.items]);
        setApiPage(prev => prev + 1);
      } else {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  }, [currentTabSlug, apiPage, isFetching, hasMoreData]);

  useEffect(() => {
    if (currentTabSlug) {
      setMovies([]);
      setApiPage(1);
      setHasMoreData(true);
      fetchMoreData();
    }
  }, [currentTabSlug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchMoreData();
        }
      },
      { rootMargin: '0px 0px 800px 0px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchMoreData]);

  const handleTabClick = (slug: string) => {
    setCurrentTabSlug(slug);
  };

  return (
    <section id="explore-section" className="mt-4 bg-white dark:bg-[#252836] rounded-[40px] p-10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] shadow-[0_20px_40px_rgba(18,38,63,0.05)] max-md:p-6 max-md:mx-4 max-md:rounded-3xl">
      <h2 className="text-[1.8rem] max-md:text-[1.4rem] font-black text-black dark:text-white tracking-[-0.5px] mb-8 max-md:mb-5 flex items-center gap-3 after:content-['➔'] after:text-[1.4rem] after:text-[#808191] after:ml-2">Khám Phá Anime</h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {sortedGenres.map(g => (
          <button 
            key={g.slug}
            className={`px-5 py-2.5 rounded-xl bg-transparent border font-bold text-[0.95rem] whitespace-nowrap transition-all ${currentTabSlug === g.slug ? 'bg-[#353945] dark:bg-[#353945] bg-[#E2E8F0] text-black dark:text-white border-transparent' : preferences.includes(g.slug) ? 'text-[#FFD166] border-[#FFD166]/20 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white' : 'border-black/10 dark:border-white/10 text-[#808191] hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
            onClick={() => handleTabClick(g.slug)}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-md:gap-4">
        {movies.length === 0 && isFetching ? (
          Array.from({ length: 10 }).map((_, idx) => (
            <MovieCardSkeleton key={`skeleton-${idx}`} />
          ))
        ) : (
          movies.map((item, idx) => (
            <MovieCard 
              key={`${item.slug}-${idx}`} 
              item={item} 
              onClick={() => { setCurrentMovieSlug(item.slug); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            />
          ))
        )}
      </div>

      {movies.length > 0 && isFetching && (
        <div className="text-center py-15 text-[#808191] font-black text-[1.1rem]">
          <Loader2 size={28} className="animate-spin inline-block mr-3 text-[#3B82F6] align-middle" /> Đang tải thêm dữ liệu...
        </div>
      )}
      <div ref={observerTarget} className="h-2.5 w-full"></div>
    </section>
  );
};
