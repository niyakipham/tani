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
    <div className="fixed inset-0 bg-[#F4F7FB] dark:bg-[#13141C] z-[4000] flex flex-col h-[100dvh]">
      <div className="absolute top-0 left-0 w-full p-6 md:px-10 flex justify-between items-center z-[4010] bg-gradient-to-b from-[#13141C]/90 dark:from-[#13141C]/90 from-white/95 to-transparent">
        <div className="text-[1.8rem] font-black tracking-[-1px] text-black dark:text-white">T-STORY</div>
        <button className="text-[#808191] bg-black/5 dark:bg-white/5 rounded-full w-12 h-12 flex items-center justify-center transition-all cursor-pointer border-none hover:bg-[#FF4757] hover:text-white" onClick={() => setIsStoryModeOpen(false)}>
          <X size={24} className="font-bold" />
        </button>
      </div>

      <div className="flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none" ref={containerRef} onScroll={handleScroll}>
        {stories.length === 0 ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="w-12 h-12 border-4 border-white/20 border-t-[#00D1F5] rounded-full animate-spin"></div>
          </div>
        ) : (
          stories.map((story, idx) => (
            <div key={`${story.slug}-${idx}`} className="relative w-full h-[100dvh] snap-start flex items-center justify-center overflow-hidden pt-[100px] px-8 pb-8 max-lg:p-0">
              <div className="flex gap-8 w-full max-w-[1300px] h-full max-h-[850px] bg-[#252836] dark:bg-[#252836] bg-black rounded-[40px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] max-lg:block max-lg:w-full max-lg:h-full max-lg:max-h-none max-lg:rounded-none max-lg:p-0 max-lg:shadow-none">
                
                <div className="flex-[1.8] rounded-[20px] overflow-hidden bg-[#13141C] dark:bg-[#13141C] bg-black relative max-lg:w-full max-lg:h-full max-lg:rounded-none">
                  <div className="absolute inset-0 flex items-center justify-center z-0 bg-[#13141C] dark:bg-[#13141C] bg-black">
                    <div className="w-10 h-10 border-4 border-white/10 border-t-[#00D1F5] rounded-full animate-spin"></div>
                  </div>
                  <iframe src={story.link} allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full border-none absolute inset-0 z-10"></iframe>
                </div>

                <div className="flex-1 min-w-[360px] flex flex-col gap-5 overflow-hidden relative py-4 max-lg:absolute max-lg:inset-0 max-lg:pointer-events-none max-lg:justify-end max-lg:p-0">
                  <div className="hidden max-lg:block absolute inset-0 bg-gradient-to-t from-[#13141C]/95 dark:from-[#13141C]/95 from-black/95 to-transparent z-[1] h-[80%] top-auto"></div>
                  
                  <div className="flex flex-col gap-4 shrink-0 relative z-[2] max-lg:p-8 max-lg:pr-[90px] max-lg:pb-10 max-lg:pointer-events-auto max-lg:gap-3">
                    <h3 className="text-[2.2rem] max-lg:text-[1.8rem] font-black text-white leading-[1.25] line-clamp-2">{story.name}</h3>
                    <p className="text-base max-lg:text-[0.9rem] text-[#808191] max-lg:text-white/70 line-clamp-4 leading-[1.7] max-lg:mb-2">{story.content}</p>
                    <div className="flex items-center gap-3 self-start max-lg:w-full">
                      <button className="flex-1 bg-[#3B82F6] text-white border-none py-3.5 px-8 max-lg:px-4 max-lg:py-3 rounded-full font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:bg-[#2563EB]" onClick={() => handleWatchFull(story.slug)}>
                        <Play size={20} className="fill-current" /> Xem Full
                      </button>
                      <button className="flex-1 bg-[#353945] text-white border-none py-3.5 px-6 max-lg:px-4 max-lg:py-3 rounded-full font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:bg-white/20" onClick={() => handleMarkComplete(story)} title="Đánh dấu đã xem">
                        <CheckCircle size={20} /> <span className="max-lg:text-[0.9rem]">Đã xem</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-center mt-2 relative z-[2] max-lg:absolute max-lg:right-4 max-lg:bottom-[100px] max-lg:flex-col max-lg:gap-6 max-lg:pointer-events-auto">
                    <button className={`flex items-center gap-2.5 border-none py-3 px-5 rounded-full cursor-pointer transition-all font-bold max-lg:flex-col max-lg:p-0 max-lg:bg-transparent max-lg:gap-1.5 ${story.isLiked ? 'bg-[#FF4757]/10 text-[#FF4757]' : 'bg-[#353945] text-white hover:bg-white/20'}`} onClick={() => toggleFavorite(story)}>
                      <div className="max-lg:bg-white/10 max-lg:backdrop-blur-md max-lg:rounded-full max-lg:w-[52px] max-lg:h-[52px] max-lg:flex max-lg:items-center max-lg:justify-center max-lg:text-white max-lg:transition-transform max-lg:hover:scale-110">
                        <Heart size={24} className={story.isLiked ? 'fill-current' : ''} />
                      </div>
                      <span className="max-lg:text-[0.8rem] max-lg:font-semibold">Thích</span>
                    </button>
                    <button className="hidden max-lg:flex flex-col items-center gap-1.5 border-none p-0 bg-transparent cursor-pointer transition-all font-bold text-white" onClick={() => setShowEpisodes(!showEpisodes)}>
                      <div className="bg-white/10 backdrop-blur-md rounded-full w-[52px] h-[52px] flex items-center justify-center transition-transform hover:scale-110">
                        <List size={24} className="font-bold" />
                      </div>
                      <span className="text-[0.8rem] font-semibold">Tập phim</span>
                    </button>
                    <button className="flex items-center gap-2.5 bg-[#353945] text-white border-none py-3 px-5 rounded-full cursor-pointer transition-all font-bold hover:bg-white/20 max-lg:flex-col max-lg:p-0 max-lg:bg-transparent max-lg:gap-1.5" onClick={() => alert("Đã copy link phim vào khay nhớ tạm!")}>
                      <div className="max-lg:bg-white/10 max-lg:backdrop-blur-md max-lg:rounded-full max-lg:w-[52px] max-lg:h-[52px] max-lg:flex max-lg:items-center max-lg:justify-center max-lg:text-white max-lg:transition-transform max-lg:hover:scale-110">
                        <Share2 size={24} className="fill-current" />
                      </div>
                      <span className="max-lg:text-[0.8rem] max-lg:font-semibold">Chia sẻ</span>
                    </button>
                  </div>
                  
                  <div className={`flex-1 flex flex-col bg-[#13141C] dark:bg-[#13141C] bg-white rounded-[20px] overflow-hidden p-5 mt-2 max-lg:absolute max-lg:bottom-0 max-lg:left-0 max-lg:w-full max-lg:h-[60vh] max-lg:bg-[#252836] max-lg:z-[4100] max-lg:rounded-t-[32px] max-lg:rounded-b-none max-lg:p-6 max-lg:pointer-events-auto transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${showEpisodes ? 'max-lg:translate-y-0' : 'max-lg:translate-y-full'}`}>
                    <div className="flex justify-between items-center mb-4 text-black dark:text-white font-extrabold text-[1.2rem]">
                      <h4>Danh Sách Tập</h4>
                      <button className="hidden max-lg:flex text-white bg-white/10 p-2.5 rounded-full cursor-pointer items-center justify-center border-none" onClick={() => setShowEpisodes(false)}>
                        <X size={20} className="font-bold" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2.5 content-start pr-2 custom-scrollbar">
                      {story.episodes.map((ep: any, epIdx: number) => (
                        <button 
                          key={ep.slug}
                          className={`px-1 py-3 rounded-xl text-[0.9rem] font-black transition-all block text-center whitespace-nowrap overflow-hidden text-ellipsis w-full ${epIdx === story.currentEpIndex ? 'bg-[#3B82F6] text-white shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-105 z-[2]' : 'bg-[#1A1C23] dark:bg-[#1A1C23] bg-[#F8FAFC] border border-transparent text-[#808191] hover:bg-[#353945] dark:hover:bg-[#353945] hover:bg-[#E2E8F0] hover:text-black dark:hover:text-white hover:-translate-y-0.5'}`}
                          title={ep.name}
                          onClick={() => {
                            const newStories = [...stories];
                            newStories[idx].currentEpIndex = epIdx;
                            newStories[idx].link = ep.link_embed;
                            setStories(newStories);
                          }}
                        >
                          {ep.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden max-lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-[0.8rem] font-semibold items-center gap-1 z-[3] pointer-events-none animate-bounce">
                <ChevronUp size={16} className="font-bold" /> Vuốt xem tiếp
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
