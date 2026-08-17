'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Loader2, Heart, Star } from 'lucide-react';
import { useAppContext } from '@/lib/store';
import { fetchMoviesByGenre, getApiItems, isApiSuccess } from '@/lib/api';

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
 className="bg-[#FAF8F5] rounded-none border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] overflow-hidden transition-all cursor-pointer flex flex-col relative group hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[8px_8px_0px_#311B56] select-none" 
 onClick={onClick}
 onMouseEnter={handleMouseEnter}
 onMouseLeave={handleMouseLeave}
 >
 <div className="relative w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-[#FAF8F5] border-b-2 border-[#311B56]">
 
 {/* Badges Overlay */}
 <div className="absolute top-2.5 left-2.5 z-[15] pointer-events-none">
 <span className="bg-[#FAF8F5] border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] text-[#311B56] text-[0.6rem] font-bold px-1.5 py-0.5 uppercase tracking-wider font-mono">[ {item.quality || 'HQ'} ]</span>
 </div>
 <div className="absolute top-2.5 right-2.5 z-[15] pointer-events-none flex items-center justify-center w-6 h-6 bg-[#311B56] border-2 border-[#311B56]">
 <span className="text-[#FAF8F5] font-black text-[1rem] leading-none">T</span>
 </div>

 {/* Solid Overlay on Hover */}
 <div className="absolute inset-0 bg-[#311B56]/40 z-[10] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 pointer-events-none"></div>
 
 {/* Play Button Central */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20] opacity-0 group-hover/card:opacity-100 transition-all duration-300 scale-75 group-hover/card:scale-100 pointer-events-none">
 <div className="w-12 h-12 bg-[#FAF8F5] rounded-none flex items-center justify-center border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56]">
 <Play size={20} className="fill-[#311B56] text-[#311B56] ml-0.5" />
 </div>
 </div>

 {/* Heart Favorite Button */}
 <button 
 className={`absolute bottom-3 right-3 z-[25] scale-90 md:scale-100 transition-all duration-300 w-8 h-8 rounded-none border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] flex items-center justify-center bg-[#FAF8F5] cursor-pointer
 ${isLiked 
 ? 'text-[#A57CC6]' 
 : 'text-[#311B56]/50 hover:text-[#311B56]'
 }`}
 onClick={(e) => {
 e.stopPropagation();
 toggleFavorite(item);
 }}
 title={isLiked ? "Bỏ Lưu" : "Lưu Phim"}
 >
 <Heart size={16} className={isLiked ? "fill-[#A57CC6]" : ""} />
 </button>

 {/* Placeholder Image Loading */}
 {!isImgLoaded && (
 <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F5] z-[1]">
 <div className="w-8 h-8 border-4 border-[#311B56] border-t-[#3B82F6] rounded-full animate-spin"></div>
 </div>
 )}

 <img 
 src={`https://img.ophim.live/uploads/movies/${item.thumb_url}`} 
 alt={item.name} 
 loading="lazy"
 onLoad={() => setIsImgLoaded(true)}
 className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 relative z-[2] ${isHovered ? 'opacity-0' : isImgLoaded ? 'opacity-100' : 'opacity-0'}`} 
 onError={(e) => { 
 (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300/311B56/FAF8F5'; 
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
 {/* Text Info Below Image */}
 <div className="w-full p-3 flex flex-col gap-1 bg-[#FAF8F5]">
 <h3 className="text-[#311B56] font-black text-[0.95rem] leading-tight line-clamp-1 uppercase tracking-wide">{item.name}</h3>
 <div className="flex items-center justify-between text-[0.7rem] font-bold text-[#311B56]/80 font-mono">
 <span className="flex items-center gap-1"><Star size={10} className="fill-[#A57CC6] text-[#A57CC6]" /> {item.tmdb?.vote_average || '4.5'}</span>
 <span>[ {Math.floor(Math.random() * 20 + 2)}M+ V ]</span>
 </div>
 </div>
 </div>
 );
};

export const MovieCardSkeleton = () => {
 return (
 <div className="bg-[#FAF8F5] rounded-none border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] flex flex-col relative w-full aspect-[4/5] md:aspect-[3/4]">
 <div className="absolute inset-0 bg-[#FAF8F5] flex items-center justify-center rounded-none">
 <div className="w-8 h-8 border-4 border-[#311B56]/20 border-t-[#311B56] rounded-full animate-spin"></div>
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
 const items = getApiItems(data);
 if (isApiSuccess(data) && items.length > 0) {
 setMovies(prev => [...prev, ...items]);
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
 <section id="explore-section" className="mt-6 bg-[#FAF8F5] p-6 max-md:p-4 border-y-[3px] border-[#311B56] shadow-[0_8px_0_#311B56]">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-[1.5rem] md:text-[1.8rem] font-black text-[#311B56] tracking-[0.18em] uppercase font-mono">[ EXPLORE ]</h2>
 <span className="pixel-badge text-[0.72rem] cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] transition-transform">VIEW ALL <span className="text-[0.6rem]">▶</span></span>
 </div>
 
 <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-none px-1">
 {sortedGenres.map(g => (
 <button 
 key={g.slug}
 className={`px-5 py-2 rounded-none border-[3px] border-[#311B56] font-bold text-[0.85rem] whitespace-nowrap transition-all uppercase tracking-widest font-mono shadow-[3px_3px_0px_#311B56] ${currentTabSlug === g.slug ? 'bg-[#311B56] text-[#FAF8F5] translate-y-[2px] translate-x-[2px] shadow-none' : 'bg-[#FAF8F5] text-[#311B56] hover:bg-[#311B56]/10'}`}
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
 <div className="text-center py-15 text-[#311B56] font-black text-[1.1rem] font-mono tracking-widest uppercase">
 <Loader2 size={28} className="animate-spin inline-block mr-3 text-[#311B56] align-middle" /> LOADING...
 </div>
 )}
 <div ref={observerTarget} className="h-2.5 w-full"></div>
 </section>
 );
};
