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
 <section className="mt-6 p-6 max-md:p-4 border border-[#7ef7c7]/12 rounded-[28px] w-full overflow-hidden bg-[linear-gradient(180deg,rgba(8,17,15,0.96),rgba(11,20,18,0.92))] shadow-[0_18px_42px_rgba(0,0,0,0.22)]">
 <h2 className="text-[1.5rem] md:text-[1.8rem] font-black text-[#ebfff9] tracking-tight uppercase font-mono mb-4 flex items-center justify-between">
 [ CONTINUE WATCHING ] <span className="text-[0.8rem] text-[#7ef7c7] font-bold cursor-pointer hover:underline flex items-center gap-1 md:hidden">VIEW ALL <span className="text-[0.6rem]">▶</span></span>
 </h2>
 
 <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none scroll-smooth px-1">
 {recentHistory.map((item, idx) => (
 <div 
 key={`${item.slug}-${idx}`}
 className="snap-start shrink-0 w-[260px] md:w-[320px] overflow-hidden transition-all cursor-pointer flex flex-col relative group select-none rounded-[22px] border border-[#7ef7c7]/10 bg-[#091613] shadow-[0_18px_34px_rgba(0,0,0,0.22)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(126,247,199,0.08)]"
 onClick={() => {
 setCurrentMovieSlug(item.slug);
 window.scrollTo({ top: 0, behavior: 'smooth' });
 }}
 >
 <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#07130f] border-b border-[#7ef7c7]/10">
 <img 
 src={item.snapshot || `https://img.ophim.live/uploads/movies/${item.thumb_url}`} 
 alt={item.name} 
 className="w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:scale-110" 
 onError={(e) => { (e.target as HTMLImageElement).src = `https://img.ophim.live/uploads/movies/${item.thumb_url}`; }} 
 />
 
 <div className="absolute inset-0 bg-[#7ef7c7]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10 pointer-events-none"></div>
 
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-75 group-hover:scale-100 z-[20] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
 <div className="w-12 h-12 bg-[#07130f]/90 rounded-full flex items-center justify-center border border-[#7ef7c7]/40 shadow-[0_0_24px_rgba(126,247,199,0.18)]">
 <Play size={20} className="fill-[#7ef7c7] text-[#7ef7c7] ml-0.5" />
 </div>
 </div>
 
 <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#07130f]/60 z-20 border-t border-[#7ef7c7]/15">
 <div 
 className="h-full bg-[#7ef7c7]" 
 style={{ width: `${item.progress || 0}%` }}
 ></div>
 </div>
 </div>
 
 <div className="w-full p-3 bg-[#091613] flex flex-col z-10">
 <div className="text-[1rem] md:text-[1.05rem] font-black text-[#ebfff9] leading-tight line-clamp-1 uppercase tracking-wide">
 {item.name}
 </div>
 <div className="text-[0.8rem] text-[#9abeb2] mt-1 font-bold flex items-center gap-2 font-mono">
 <span className="text-[#7ef7c7]">[ EP {item.epName} ]</span>
 <span className="w-1 h-1 bg-[#7ef7c7]/50 rounded-full"></span>
 <span>{item.progress ? `${Math.round(item.progress)}%` : '0%'}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </section>
 );
};
