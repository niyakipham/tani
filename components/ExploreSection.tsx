'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Loader2, Heart, Star } from 'lucide-react';
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
      className="bg-transparent rounded-[1.25rem] overflow-hidden transition-all cursor-pointer flex flex-col relative group hover:-translate-y-2 group/card select-none" 
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-[#1A1C23] border border-white/5 rounded-[1.25rem] shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        
        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 z-[15] pointer-events-none">
          <span className="bg-white/90 text-black text-[0.6rem] font-black px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider shadow-sm">{item.quality || 'HQ'}</span>
        </div>
        <div className="absolute top-2.5 right-2.5 z-[15] pointer-events-none flex items-center justify-center w-5 h-5">
          {/* Netflix style 'N' badge representation */}
          <span className="text-[#E50914] font-black text-[1.1rem] drop-shadow-md leading-none">N</span>
        </div>

        {/* Gradient Bottom Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-transparent to-transparent z-[10] opacity-80 transition-opacity duration-300 group-hover/card:opacity-100 pointer-events-none"></div>
        
        {/* Play Button Central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20] opacity-0 group-hover/card:opacity-100 transition-all duration-300 scale-75 group-hover/card:scale-100 pointer-events-none">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <Play size={20} className="fill-white text-white ml-0.5" />
          </div>
        </div>

        {/* Heart Favorite Button */}
        <button 
          className={`absolute bottom-3 right-3 z-[25] scale-90 md:scale-100 transition-all duration-300 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer
            ${isLiked 
              ? 'text-[#E50914] drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]' 
              : 'text-white/70 hover:text-white'
            }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item);
          }}
          title={isLiked ? "Bỏ Lưu" : "Lưu Phim"}
        >
          <Heart size={20} className={isLiked ? "fill-current" : ""} />
        </button>

        {/* Text Overlay Bottom */}
        <div className="absolute bottom-0 left-0 w-full p-3 pb-4 z-[15] flex flex-col gap-0.5 pointer-events-none transition-transform duration-300 translate-y-1 md:translate-y-2 group-hover/card:translate-y-0">
          <h3 className="text-white font-bold text-[0.95rem] leading-tight line-clamp-1 drop-shadow-md pr-8">{item.name}</h3>
          <div className="flex items-center gap-2 text-[0.7rem] font-bold text-white/80">
            <span className="flex items-center gap-1 text-[#FFD700]"><Star size={10} className="fill-current" /> {item.tmdb?.vote_average || '4.5'}</span>
            <span className="w-1 h-1 bg-white/30 rounded-full"></span>
            <span>{Math.floor(Math.random() * 20 + 2)}M+ Views</span>
          </div>
        </div>

        {/* Placeholder Image Loading */}
        {!isImgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1A1C23] z-[1]">
            <div className="w-8 h-8 border-4 border-white/10 border-t-[#E50914] rounded-full animate-spin"></div>
          </div>
        )}

        <img 
          src={`https://img.ophim.live/uploads/movies/${item.thumb_url}`} 
          alt={item.name} 
          loading="lazy"
          onLoad={() => setIsImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 relative z-[2] ${isHovered ? 'opacity-0' : isImgLoaded ? 'opacity-100' : 'opacity-0'}`} 
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
      </div>
    </div>
  );
};

export const MovieCardSkeleton = () => {
  return (
    <div className="bg-transparent rounded-[1.25rem] overflow-hidden flex flex-col relative w-full aspect-[4/5] md:aspect-[3/4]">
      <div className="absolute inset-0 bg-[#1A1C23] border border-white/5 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center rounded-[1.25rem]">
         <div className="w-8 h-8 border-4 border-white/10 border-t-[#E50914] rounded-full animate-spin"></div>
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
    <section id="explore-section" className="mt-2 bg-transparent p-6 max-md:p-4 max-md:pt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[1.5rem] md:text-[1.8rem] font-bold text-white tracking-tight">Popular Movies</h2>
        <span className="text-[0.8rem] text-[#808191] font-bold cursor-pointer hover:text-white flex items-center gap-1">See all <span className="text-[0.6rem]">▶</span></span>
      </div>
      
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

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
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
