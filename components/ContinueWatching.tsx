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
    <section className="mt-4 bg-white dark:bg-[#252836] rounded-[40px] p-10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] shadow-[0_20px_40px_rgba(18,38,63,0.05)] max-md:p-6 max-md:mx-4 max-md:rounded-3xl">
      <h2 className="text-[1.8rem] max-md:text-[1.4rem] font-black text-black dark:text-white tracking-[-0.5px] mb-8 max-md:mb-5 flex items-center gap-3 after:content-['➔'] after:text-[1.4rem] after:text-[#808191] after:ml-2">
        Tiếp Tục Xem
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-md:gap-4">
        {recentHistory.map((item, idx) => (
          <div 
            key={`${item.slug}-${idx}`}
            className="bg-transparent rounded-xl overflow-hidden transition-all cursor-pointer flex flex-col relative group hover:-translate-y-2"
            onClick={() => {
              setCurrentMovieSlug(item.slug);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#1A1C23] dark:bg-[#1A1C23] bg-[#F8FAFC] rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_20px_rgba(0,0,0,0.3)] shadow-[0_10px_20px_rgba(0,0,0,0.03)]">
              <img 
                src={`https://img.ophim.live/uploads/movies/${item.thumb_url}`} 
                alt={item.name} 
                className="w-full h-full object-cover transition-all duration-800 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105" 
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x170/1F2937/00D1F5'; }} 
              />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-400 group-hover:opacity-100 z-10"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-80 w-12 h-12 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-[1.5rem] opacity-0 transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-[0_4px_15px_rgba(59,130,246,0.5)] group-hover:opacity-100 group-hover:scale-100 z-20">
                <Play size={20} className="fill-current ml-1" />
              </div>
              
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/50 z-20">
                <div 
                  className="h-full bg-[#3B82F6] rounded-r-full" 
                  style={{ width: `${item.progress || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="w-full pt-3 flex flex-col z-10">
              <div className="text-[1rem] font-bold text-black dark:text-white leading-[1.4] line-clamp-1">
                {item.name}
              </div>
              <div className="text-[0.8rem] text-[#808191] mt-1 font-medium">
                Tập {item.epName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
