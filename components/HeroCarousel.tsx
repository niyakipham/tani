'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/lib/store';

export const HeroCarousel = () => {
  const { setCurrentMovieSlug } = useAppContext();
  const [movies, setMovies] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    fetch('https://ophim1.com/v1/api/danh-sach/phim-bo?page=1')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data.items.length > 0) {
          setMovies(data.data.items.slice(0, 12));
        }
      });
  }, []);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [movies, checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('.movie-card')?.clientWidth || 200;
    const scrollAmount = cardWidth * 2 + 24;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Mouse drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleMouseUp = () => setIsDragging(false);

  if (movies.length === 0) return null;

  return (
    <div className="relative w-full py-6 md:py-10 flex flex-col items-center bg-transparent">
      {/* Header */}
      <div className="text-center mb-5 md:mb-8 z-10 w-full px-4">
        <h2 className="text-[#3B82F6] font-black text-sm md:text-2xl tracking-[0.3em] uppercase drop-shadow-sm dark:drop-shadow-lg">
          Dòng Chảy Phim Mới
        </h2>
        <h1 className="text-black dark:text-white font-black text-[1.8rem] md:text-5xl tracking-tighter uppercase mt-1 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          Tuyệt Phẩm 2026
        </h1>
      </div>

      {/* Horizontal scroll container */}
      <div className="relative w-full group/carousel">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-1 md:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-12 md:h-12 bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-black/5 dark:border-white/10 transition-all duration-300 hover:scale-110 hover:bg-white dark:hover:bg-black/90 ${canScrollLeft ? 'opacity-0 group-hover/carousel:opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-black/70 dark:text-white/80" />
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-1 md:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-12 md:h-12 bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-black/5 dark:border-white/10 transition-all duration-300 hover:scale-110 hover:bg-white dark:hover:bg-black/90 ${canScrollRight ? 'opacity-0 group-hover/carousel:opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-black/70 dark:text-white/80" />
        </button>

        {/* Left fade */}
        <div className={`absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-white dark:from-[#0a0a0a] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
        {/* Right fade */}
        <div className={`absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-white dark:from-[#0a0a0a] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide px-6 md:px-12 py-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {movies.map((movie) => (
            <div
              key={movie.slug}
              className="movie-card flex-shrink-0 w-[140px] md:w-[200px] group cursor-pointer"
              onClick={() => {
                setCurrentMovieSlug(movie.slug);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {/* Card image */}
              <div
                className="relative aspect-[2/3] rounded-2xl md:rounded-[1.4rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-400 ease-out group-hover:scale-[1.04] group-hover:shadow-[0_15px_40px_rgba(59,130,246,0.25)]"
              >
                <img
                  src={`https://img.ophim.live/uploads/movies/${movie.thumb_url}`}
                  alt={movie.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  draggable={false}
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Play button on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-11 h-11 md:w-14 md:h-14 bg-[#3B82F6] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.6)] scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="text-white ml-0.5 w-5 h-5 md:w-6 md:h-6" fill="white" />
                  </div>
                </div>

                {/* Movie name */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <h3 className="text-white font-bold text-[0.8rem] md:text-[0.95rem] leading-tight line-clamp-2 drop-shadow-md">
                    {movie.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
