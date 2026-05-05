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
 <div className="relative w-full py-6 md:py-10 flex flex-col items-center bg-[#FAF8F5] border-b-2 border-[#311B56]">
 {/* Header */}
 <div className="text-center mb-5 md:mb-8 z-10 w-full px-4 border-b-2 border-[#311B56] pb-4">
 <h2 className="text-[#311B56] font-mono font-black text-sm md:text-2xl tracking-[0.3em] uppercase">
 [ DÒNG CHẢY PHIM MỚI ]
 </h2>
 <h1 className="text-[#311B56] font-mono font-black text-[1.8rem] md:text-5xl tracking-widest uppercase mt-2">
 [ TUYỆT PHẨM 2026 ]
 </h1>
 </div>

 {/* Horizontal scroll container */}
 <div className="relative w-full group/carousel">
 {/* Left arrow */}
 <button
 onClick={() => scroll('left')}
 className={`absolute left-1 md:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-12 md:h-12 bg-[#FAF8F5] rounded-none flex items-center justify-center shadow-[2px_2px_0px_#311B56] border-2 border-[#311B56] transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_#311B56] ${canScrollLeft ? 'opacity-0 group-hover/carousel:opacity-100' : 'opacity-0 pointer-events-none'}`}
 >
 <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-[#311B56]" />
 </button>

 {/* Right arrow */}
 <button
 onClick={() => scroll('right')}
 className={`absolute right-1 md:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-12 md:h-12 bg-[#FAF8F5] rounded-none flex items-center justify-center shadow-[2px_2px_0px_#311B56] border-2 border-[#311B56] transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_#311B56] ${canScrollRight ? 'opacity-0 group-hover/carousel:opacity-100' : 'opacity-0 pointer-events-none'}`}
 >
 <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-[#311B56]" />
 </button>

 {/* Left border indicator instead of fade */}
 <div className={`absolute left-0 top-0 bottom-0 w-2 border-r-2 border-[#311B56] bg-[#FAF8F5] z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
 {/* Right border indicator instead of fade */}
 <div className={`absolute right-0 top-0 bottom-0 w-2 border-l-2 border-[#311B56] bg-[#FAF8F5] z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

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
 className="relative aspect-[2/3] rounded-none border-2 border-[#311B56] overflow-hidden shadow-[4px_4px_0px_#311B56] transition-all duration-400 ease-out group-hover:scale-[1.04] group-hover:shadow-[8px_8px_0px_#311B56]"
 >
 <img
 src={`https://img.ophim.live/uploads/movies/${movie.thumb_url}`}
 alt={movie.name}
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
 draggable={false}
 loading="lazy"
 />
 
 <div className="absolute inset-0 bg-[#311B56]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

 {/* Play button on hover */}
 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
 <div className="w-11 h-11 md:w-14 md:h-14 bg-[#FAF8F5] rounded-none border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300">
 <Play className="text-[#311B56] ml-0.5 w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
 </div>
 </div>

 {/* Movie name block */}
 <div className="absolute bottom-0 left-0 right-0 p-3 bg-[#FAF8F5] border-t-2 border-[#311B56]">
 <h3 className="text-[#311B56] font-black font-mono uppercase text-[0.8rem] md:text-[0.95rem] leading-tight line-clamp-1">
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
