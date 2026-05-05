'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Heart, List, Share2, ChevronUp, CheckCircle } from 'lucide-react';
import { useAppContext } from '@/lib/store';

export const StoryModal = () => {
 const { isStoryModeOpen, setIsStoryModeOpen, favorites, toggleFavorite, setCurrentMovieSlug, addToHistory, updateHistoryProgress } = useAppContext();
 const [stories, setStories] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [showEpisodes, setShowEpisodes] = useState(false);
 const containerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (isStoryModeOpen && stories.length === 0) {
 loadMoreStories(3);
 }
 }, [isStoryModeOpen]);

 const loadMoreStories = async (count: number) => {
 if (isLoading) return;
 setIsLoading(true);
 try {
 const initRes = await fetch(`https://ophim1.com/v1/api/danh-sach/hoat-hinh?page=1`);
 const initData = await initRes.json();
 const totalPages = initData.data?.params?.pagination?.totalPages || 10;
 const randomPage = Math.floor(Math.random() * Math.min(totalPages, 50)) + 1;
 
 const listRes = await fetch(`https://ophim1.com/v1/api/danh-sach/hoat-hinh?page=${randomPage}`);
 const listData = await listRes.json();
 if (listData.status === 'success') {
 const items = listData.data.items.sort(() => 0.5 - Math.random()).slice(0, count);
 const newStories: any[] = [];
 for (const item of items) {
 const detailRes = await fetch(`https://ophim1.com/phim/${item.slug}`); 
 const detailData = await detailRes.json();
 if (detailData.status && detailData.episodes[0]?.server_data.length > 0) {
 const m = detailData.movie; 
 const eps = detailData.episodes[0].server_data; 
 const firstEpIndex = 0; 
 const firstEp = eps[firstEpIndex];
 
 newStories.push({ 
 slug: m.slug, name: m.name, content: m.content ? m.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : '', 
 thumb_url: m.thumb_url, poster_url: m.poster_url, link: firstEp.link_embed, isLiked: favorites.some(f => f.slug === m.slug),
 episodes: eps, currentEpIndex: firstEpIndex
 });
 }
 }
 setStories(prev => [...prev, ...newStories]);
 }
 } catch (error) {
 console.error(error);
 } finally {
 setIsLoading(false);
 }
 };

 const handleScroll = () => {
 if (containerRef.current) {
 const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
 if (scrollHeight - scrollTop <= clientHeight * 1.5) {
 loadMoreStories(2);
 }
 }
 };

 const handleWatchFull = (slug: string) => {
 setIsStoryModeOpen(false);
 setCurrentMovieSlug(slug);
 window.scrollTo({ top: 0, behavior: 'smooth' });
 };

 const handleMarkComplete = (story: any) => {
 const epName = story.episodes[story.currentEpIndex]?.name || '1';
 addToHistory(story, epName);
 updateHistoryProgress(story.slug, 100);
 alert(`Đã hoàn thành xuất sắc tập ${epName}! 🎉`);
 };

 if (!isStoryModeOpen) return null;

 return (
 <div className="fixed inset-0 bg-[#FAF8F5] z-[4000] flex flex-col h-[100dvh]">
 <div className="absolute top-0 left-0 w-full p-6 md:px-10 flex justify-between items-center z-[4010] bg-[#FAF8F5] border-b-2 border-[#311B56]">
 <div className="text-[1.8rem] font-black tracking-widest text-[#311B56] font-mono uppercase">[ T-STORY ]</div>
 <button className="text-[#FAF8F5] bg-[#311B56] border-2 border-[#311B56] rounded-none w-12 h-12 flex items-center justify-center transition-all cursor-pointer hover:bg-[#FAF8F5] hover:text-[#311B56] shadow-[4px_4px_0px_#311B56] hover:shadow-[2px_2px_0px_#311B56] hover:translate-y-[2px]" onClick={() => setIsStoryModeOpen(false)}>
 <X size={24} className="font-bold" />
 </button>
 </div>

 <div className="flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none bg-[#FAF8F5]" ref={containerRef} onScroll={handleScroll}>
 {stories.length === 0 ? (
 <div className="flex items-center justify-center w-full h-full">
 <div className="w-12 h-12 border-4 border-[#311B56]/20 border-t-[#311B56] rounded-none animate-spin"></div>
 </div>
 ) : (
 stories.map((story, idx) => (
 <div key={`${story.slug}-${idx}`} className="relative w-full h-[100dvh] snap-start flex items-center justify-center overflow-hidden pt-[100px] px-8 pb-8 max-lg:p-0">
 <div className="flex gap-8 w-full max-w-[1300px] h-full max-h-[850px] bg-[#FAF8F5] border-4 border-[#311B56] rounded-none p-6 shadow-[12px_12px_0px_#311B56] max-lg:block max-lg:w-full max-lg:h-full max-lg:max-h-none max-lg:rounded-none max-lg:p-0 max-lg:border-0 max-lg:shadow-none">
 
 <div className="flex-[1.8] rounded-none border-2 border-[#311B56] overflow-hidden bg-[#FAF8F5] relative max-lg:w-full max-lg:h-full max-lg:border-0 max-lg:border-b-2">
 <div className="absolute inset-0 flex items-center justify-center z-0 bg-[#FAF8F5]">
 <div className="w-10 h-10 border-4 border-[#311B56]/10 border-t-[#311B56] rounded-none animate-spin"></div>
 </div>
 <iframe src={story.link} allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full border-none absolute inset-0 z-10"></iframe>
 </div>

 <div className="flex-1 min-w-[360px] flex flex-col gap-5 overflow-hidden relative py-4 max-lg:absolute max-lg:inset-0 max-lg:pointer-events-none max-lg:justify-end max-lg:p-0">
 <div className="hidden max-lg:block absolute inset-0 bg-[#311B56]/95 z-[1] h-[80%] top-auto border-t-2 border-[#311B56]"></div>
 
 <div className="flex flex-col gap-4 shrink-0 relative z-[2] max-lg:p-8 max-lg:pr-[90px] max-lg:pb-10 max-lg:pointer-events-auto max-lg:gap-3">
 <h3 className="text-[2.2rem] max-lg:text-[1.8rem] font-black text-[#311B56] max-lg:text-[#FAF8F5] uppercase tracking-widest font-mono leading-[1.25] line-clamp-2">{story.name}</h3>
 <p className="text-base max-lg:text-[0.9rem] text-[#311B56]/80 max-lg:text-[#FAF8F5]/80 font-mono font-bold line-clamp-4 leading-[1.7] max-lg:mb-2">{story.content}</p>
 <div className="flex items-center gap-3 self-start max-lg:w-full">
 <button className="flex-1 bg-[#FAF8F5] text-[#311B56] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] py-3.5 px-8 max-lg:px-4 max-lg:py-3 rounded-none font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:bg-[#311B56] hover:text-[#FAF8F5] hover:shadow-[2px_2px_0px_#311B56] hover:translate-y-0.5" onClick={() => handleWatchFull(story.slug)}>
 <Play size={20} className="fill-current" /> [ XEM FULL ]
 </button>
 <button className="flex-1 bg-[#FAF8F5] text-[#311B56] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] py-3.5 px-6 max-lg:px-4 max-lg:py-3 rounded-none font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:bg-[#311B56] hover:text-[#FAF8F5] hover:shadow-[2px_2px_0px_#311B56] hover:translate-y-0.5" onClick={() => handleMarkComplete(story)} title="Đánh dấu đã xem">
 <CheckCircle size={20} /> <span className="max-lg:text-[0.9rem]">[ ĐÃ XEM ]</span>
 </button>
 </div>
 </div>
 
 <div className="flex gap-4 items-center mt-2 relative z-[2] max-lg:absolute max-lg:right-4 max-lg:bottom-[100px] max-lg:flex-col max-lg:gap-6 max-lg:pointer-events-auto">
 <button className={`flex items-center gap-2.5 border-2 border-[#311B56] py-3 px-5 rounded-none cursor-pointer transition-all font-bold max-lg:flex-col max-lg:p-0 max-lg:border-none max-lg:bg-transparent max-lg:gap-1.5 ${story.isLiked ? 'bg-[#311B56] text-[#FAF8F5] shadow-[4px_4px_0px_#311B56]' : 'bg-[#FAF8F5] text-[#311B56] shadow-[4px_4px_0px_#311B56] hover:bg-[#311B56] hover:text-[#FAF8F5]'}`} onClick={() => toggleFavorite(story)}>
 <div className="max-lg:bg-[#FAF8F5] max-lg:border-2 max-lg:border-[#311B56] max-lg:shadow-[4px_4px_0px_#311B56] max-lg:rounded-none max-lg:w-[52px] max-lg:h-[52px] max-lg:flex max-lg:items-center max-lg:justify-center max-lg:text-[#311B56] max-lg:transition-transform max-lg:hover:translate-y-1">
 <Heart size={24} className={story.isLiked ? 'fill-current' : ''} />
 </div>
 <span className="max-lg:text-[0.8rem] max-lg:font-mono max-lg:font-bold">[ THÍCH ]</span>
 </button>
 <button className="hidden max-lg:flex flex-col items-center gap-1.5 border-none p-0 bg-transparent cursor-pointer transition-all font-bold text-[#311B56]" onClick={() => setShowEpisodes(!showEpisodes)}>
 <div className="bg-[#FAF8F5] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] rounded-none w-[52px] h-[52px] flex items-center justify-center transition-transform hover:translate-y-1 hover:bg-[#311B56] hover:text-[#FAF8F5]">
 <List size={24} className="font-bold" />
 </div>
 <span className="text-[0.8rem] font-mono font-bold">[ TẬP PHIM ]</span>
 </button>
 <button className="flex items-center gap-2.5 bg-[#FAF8F5] text-[#311B56] border-2 border-[#311B56] py-3 px-5 rounded-none shadow-[4px_4px_0px_#311B56] cursor-pointer transition-all font-bold hover:bg-[#311B56] hover:text-[#FAF8F5] max-lg:flex-col max-lg:p-0 max-lg:border-none max-lg:bg-transparent max-lg:gap-1.5 max-lg:shadow-none" onClick={() => alert("Đã copy link phim vào khay nhớ tạm!")}>
 <div className="max-lg:bg-[#FAF8F5] max-lg:border-2 max-lg:border-[#311B56] max-lg:shadow-[4px_4px_0px_#311B56] max-lg:rounded-none max-lg:w-[52px] max-lg:h-[52px] max-lg:flex max-lg:items-center max-lg:justify-center max-lg:text-[#311B56] max-lg:transition-transform max-lg:hover:translate-y-1 max-lg:hover:bg-[#311B56] max-lg:hover:text-[#FAF8F5]">
 <Share2 size={24} className="fill-current" />
 </div>
 <span className="max-lg:text-[0.8rem] max-lg:font-mono max-lg:font-bold">[ CHIA SẺ ]</span>
 </button>
 </div>
 
 <div className={`flex-1 flex flex-col bg-[#FAF8F5] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] rounded-none overflow-hidden p-5 mt-2 max-lg:absolute max-lg:bottom-0 max-lg:left-0 max-lg:w-full max-lg:h-[60vh] max-lg:z-[4100] max-lg:p-6 max-lg:pointer-events-auto transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${showEpisodes ? 'max-lg:translate-y-0' : 'max-lg:translate-y-full'}`}>
 <div className="flex justify-between items-center mb-4 text-[#311B56] font-black font-mono tracking-widest uppercase text-[1.2rem]">
 <h4>[ DANH SÁCH TẬP ]</h4>
 <button className="hidden max-lg:flex text-[#FAF8F5] bg-[#311B56] border-2 border-[#311B56] p-2.5 rounded-none cursor-pointer items-center justify-center shadow-[4px_4px_0px_#311B56]" onClick={() => setShowEpisodes(false)}>
 <X size={20} className="font-bold" />
 </button>
 </div>
 <div className="flex-1 overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2.5 content-start pr-2 custom-scrollbar">
 {story.episodes.map((ep: any, epIdx: number) => (
 <button 
 key={ep.slug}
 className={`px-1 py-3 rounded-none border-2 text-[0.9rem] font-bold font-mono transition-all block text-center whitespace-nowrap overflow-hidden text-ellipsis w-full ${epIdx === story.currentEpIndex ? 'bg-[#311B56] text-[#FAF8F5] border-[#311B56] shadow-[2px_2px_0px_#FAF8F5] translate-y-[2px] z-[2]' : 'bg-[#FAF8F5] border-[#311B56] text-[#311B56] shadow-[4px_4px_0px_#311B56] hover:bg-[#311B56] hover:text-[#FAF8F5] hover:shadow-[2px_2px_0px_#311B56] hover:translate-y-[2px]'}`}
 title={ep.name}
 onClick={() => {
 const newStories = [...stories];
 newStories[idx].currentEpIndex = epIdx;
 newStories[idx].link = ep.link_embed;
 setStories(newStories);
 }}
 >
 [ EP {ep.name} ]
 </button>
 ))}
 </div>
 </div>
 </div>
 </div>
 <div className="hidden max-lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 text-[#311B56] bg-[#FAF8F5] border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] px-4 py-2 text-[0.8rem] font-black font-mono tracking-widest uppercase items-center gap-1 z-[3] pointer-events-none animate-bounce">
 <ChevronUp size={16} className="font-bold" /> [ VUỐT XEM TIẾP ]
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 );
};
