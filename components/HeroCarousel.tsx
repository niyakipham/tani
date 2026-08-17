'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/lib/store';
import { getApiItems, isApiSuccess } from '@/lib/api';

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
 const items = getApiItems(data);
 if (isApiSuccess(data) && items.length > 0) {
 setMovies(items.slice(0, 12));
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
 <div className="relative w-full py-6 md:py-10 flex flex-col items-center rounded-[28px] border border-[#7ef7c7]/12 bg-[linear-gradient(180deg,rgba(8,17,15,0.96),rgba(11,20,18,0.92))] shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
 {/* Header */}
 <div className="text-center mb-5 md:mb-8 z-10 w-full px-4 border-b border-[#7ef7c7]/10 pb-4">
 <h2 className="text-[#7ef7c7] font-mono font-black text-sm md:text-2xl tracking-[0.3em] uppercase">
 [ DÒNG CHẢY PHIM MỚI ]
 </h2>
 <h1 className="text-[#ebfff9] font-mono font-black text-[1.8rem] md:text-5xl tracking-widest uppercase mt-2">
 [ TUYỆT PHẨM 2026 ]
 </h1>
 </div>

 {/* Horizontal scroll container */}
 <div className="relative w-full group/carousel">
 {/* Left arrow */}
 <button
 onClick={() => scroll('left')}
 className={`absolute left-1 md:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-12 md:h-12 bg-[#07130f] rounded-full flex items-center justify-center border border-[#7ef7c7]/25 shadow-[0_0_20px_rgba(126,247,199,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-[#7ef7c7]/50 ${canScrollLeft ? 'opacity-0 group-hover/carousel:opacity-100' : 'opacity-0 pointer-events-none'}`}
 >
 <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-[#7ef7c7]" />
 </button>

 {/* Right arrow */}
 <button
 onClick={() => scroll('right')}
 className={`absolute right-1 md:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-12 md:h-12 bg-[#07130f] rounded-full flex items-center justify-center border border-[#7ef7c7]/25 shadow-[0_0_20px_rgba(126,247,199,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-[#7ef7c7]/50 ${canScrollRight ? 'opacity-0 group-hover/carousel:opacity-100' : 'opacity-0 pointer-events-none'}`}
 >
 <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-[#7ef7c7]" />
 </button>

 <div className={`absolute left-0 top-0 bottom-0 w-2 border-r border-[#7ef7c7]/10 bg-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
 <div className={`absolute right-0 top-0 bottom-0 w-2 border-l border-[#7ef7c7]/10 bg-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

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
 <div
 className="relative aspect-[2/3] overflow-hidden border border-[#7ef7c7]/15 rounded-[20px] shadow-[0_16px_32px_rgba(0,0,0,0.22)] transition-all duration-400 ease-out group-hover:scale-[1.04] group-hover:shadow-[0_18px_30px_rgba(126,247,199,0.08)]"
 >
 <img
 src={`https://img.ophim.live/uploads/movies/${movie.thumb_url}`}
 alt={movie.name}
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
 draggable={false}
 loading="lazy"
 />
 
 <div className="absolute inset-0 bg-[#7ef7c7]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
 <div className="w-11 h-11 md:w-14 md:h-14 bg-[#07130f]/85 rounded-full border border-[#7ef7c7]/50 shadow-[0_0_20px_rgba(126,247,199,0.18)] flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300">
 <Play className="text-[#7ef7c7] ml-0.5 w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
 </div>
 </div>

 <div className="absolute bottom-0 left-0 right-0 p-3 bg-[#07130f]/80 border-t border-[#7ef7c7]/10 backdrop-blur-sm">
 <h3 className="text-[#ebfff9] font-black font-mono uppercase text-[0.8rem] md:text-[0.95rem] leading-tight line-clamp-1">
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
