'use client';

import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useAppContext } from '@/lib/store';

export const HeroCarousel = () => {
  const { setCurrentMovieSlug } = useAppContext();
  const [movies, setMovies] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch('https://ophim1.com/v1/api/danh-sach/phim-bo?page=1')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data.items.length > 0) {
          setMovies(data.data.items.slice(0, 5));
          setActiveIndex(2); // Start in middle element
        }
      });
  }, []);

  if (movies.length === 0) return null;

  return (
    <div className="relative w-full py-6 md:py-10 flex flex-col items-center justify-center overflow-hidden bg-transparent">
      <div className="text-center mb-6 md:mb-10 z-10 w-full px-4">
        <h2 className="text-[#3B82F6] font-black text-lg md:text-2xl tracking-[0.3em] uppercase drop-shadow-sm dark:drop-shadow-lg">
          Dòng Chảy Phim Mới
        </h2>
        <h1 className="text-black dark:text-white font-black text-3xl md:text-5xl tracking-tighter uppercase mt-2 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          Tuyệt Phẩm 2026
        </h1>
      </div>

      <div className="relative w-full max-w-[1000px] h-[350px] md:h-[450px] flex items-center justify-center perspective-[1200px]">
        {movies.map((movie, index) => {
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);
          const isCenter = offset === 0;
          
          let transform = '';
          let opacity = 1;
          let zIndex = 10 - absOffset;

          if (isCenter) {
            transform = `translateX(0) scale(1) translateZ(40px) rotateY(0deg)`;
            opacity = 1;
          } else if (offset === -1) {
            transform = `translateX(-45%) scale(0.8) translateZ(0px) rotateY(25deg)`;
            opacity = 0.8;
          } else if (offset === 1) {
            transform = `translateX(45%) scale(0.8) translateZ(0px) rotateY(-25deg)`;
            opacity = 0.8;
          } else if (offset === -2) {
             transform = `translateX(-80%) scale(0.6) translateZ(-50px) rotateY(35deg)`;
             opacity = 0.4;
          } else if (offset === 2) {
             transform = `translateX(80%) scale(0.6) translateZ(-50px) rotateY(-35deg)`;
             opacity = 0.4;
          } else {
             transform = `translateX(${offset < 0 ? '-120%' : '120%'}) scale(0.5) opacity-0`;
             opacity = 0;
          }

          return (
            <div 
              key={movie.slug}
              className="absolute w-[200px] md:w-[280px] aspect-[2/3] transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] cursor-pointer rounded-[1.5rem] md:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] group"
              style={{
                transform,
                opacity,
                zIndex,
                backgroundImage: `url(https://img.ophim.live/uploads/movies/${movie.thumb_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => {
                if (isCenter) {
                  setCurrentMovieSlug(movie.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setActiveIndex(index);
                }
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent rounded-[1.5rem] md:rounded-[2rem] transition-opacity duration-300 pointer-events-none ${isCenter ? 'opacity-90' : 'opacity-40 group-hover:opacity-60'}`}></div>
              
              {isCenter && (
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 pb-8 md:pb-10 text-center animate-in fade-in duration-500 delay-150 pointer-events-none">
                   <h3 className="text-white font-black text-xl md:text-2xl leading-tight drop-shadow-md px-2 line-clamp-2">{movie.name}</h3>
                   <div className="w-12 h-12 md:w-14 md:h-14 mt-4 bg-[#3B82F6] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-transform group-hover:scale-110 pointer-events-auto">
                     <Play className="text-white ml-1 w-5 h-5 md:w-6 md:h-6" fill="white" />
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    
      <div className="flex gap-2.5 z-10 mt-6 md:mt-10">
        {movies.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-10 bg-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-2 bg-black/20 dark:bg-white/30 hover:bg-black/40 dark:hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};
