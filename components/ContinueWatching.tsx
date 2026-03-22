'use client';

import React from 'react';
import { Play } from 'lucide-react';
import { useAppContext } from '@/lib/store';

export const ContinueWatching = () => {
  const { history, setCurrentMovieSlug } = useAppContext();

  if (!history || history.length === 0) {
    return null;
  }

  // Filter out completed items and show up to 5 recent items
  const recentHistory = history.filter(item => (item.progress || 0) < 100).slice(0, 5);

  if (recentHistory.length === 0) {
    return null;
  }

  return (
    <section className="mt-2 bg-transparent p-6 max-md:p-4 max-md:pt-2 w-full overflow-hidden">
      <h2 className="text-[1.5rem] md:text-[1.8rem] font-bold text-white tracking-tight mb-4 flex items-center justify-between">
        Tiếp Tục Xem <span className="text-[0.8rem] text-[#808191] font-bold cursor-pointer hover:text-white flex items-center gap-1 md:hidden">Xem tất cả <span className="text-[0.6rem]">▶</span></span>
      </h2>
      
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none scroll-smooth">
        {recentHistory.map((item, idx) => (
          <div 
            key={`${item.slug}-${idx}`}
            className="snap-start shrink-0 w-[260px] md:w-[320px] bg-transparent rounded-[1.25rem] overflow-hidden transition-all cursor-pointer flex flex-col relative group hover:-translate-y-2 select-none"
            onClick={() => {
              setCurrentMovieSlug(item.slug);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#1A1C23] border border-white/5 rounded-[1.25rem] shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              <img 
                src={`https://img.ophim.live/uploads/movies/${item.thumb_url}`} 
                alt={item.name} 
                className="w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:scale-110" 
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x170/1F2937/00D1F5'; }} 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100 z-10 pointer-events-none"></div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-75 group-hover:scale-100 z-[20] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <Play size={20} className="fill-white text-white ml-0.5" />
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/50 z-20">
                <div 
                  className="h-full bg-[#E50914] rounded-r-full shadow-[0_0_10px_#E50914]" 
                  style={{ width: `${item.progress || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="w-full pt-3 flex flex-col z-10">
              <div className="text-[1rem] md:text-[1.05rem] font-bold text-white leading-tight line-clamp-1 drop-shadow-md">
                {item.name}
              </div>
              <div className="text-[0.8rem] text-[#808191] mt-1 font-bold flex items-center gap-2">
                <span className="text-[#E50914]">Tập {item.epName}</span>
                <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                <span>{item.progress ? `${Math.round(item.progress)}%` : '0%'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
