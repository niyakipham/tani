'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { X, Heart, History, Download, Trash, User, Bookmark } from 'lucide-react';

export const SidePanel = () => {
  const { isSidePanelOpen, closeSidePanel, sidePanelTab, favorites, history, downloads, removeFromList, userProfile, setCurrentMovieSlug } = useAppContext();

  const getTabData = () => {
    switch (sidePanelTab) {
      case 'fav': return { data: favorites, emptyMsg: 'Kho phim trống.', icon: <Heart size={20} className="fill-current text-[#FF4757]" />, title: 'Phim Yêu Thích' };
      case 'history': return { data: history, emptyMsg: 'Chưa có lịch sử.', icon: <History size={20} className="fill-current text-[#FFD166]" />, title: 'Lịch Sử Xem' };
      case 'download': return { data: downloads, emptyMsg: 'Chưa có phim tải về.', icon: <Download size={20} className="fill-current text-[#00D1F5]" />, title: 'Đã Tải Xuống' };
      default: return { data: [], emptyMsg: '', icon: <Bookmark size={20} className="fill-current" />, title: 'Thư Viện' };
    }
  };

  const { data, emptyMsg, icon, title } = getTabData();

  const handleItemClick = (slug: string) => {
    setCurrentMovieSlug(slug);
    closeSidePanel();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 z-[2000] backdrop-blur-sm transition-opacity duration-300 ${isSidePanelOpen ? 'block opacity-100' : 'hidden opacity-0 dark:bg-black/60 bg-white/85'}`} onClick={closeSidePanel}></div>
      <aside className={`fixed top-0 right-0 w-[400px] max-md:w-full h-screen bg-white dark:bg-[#1A1C23] border-l border-black/5 dark:border-white/5 z-[2001] transform transition-transform duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.8)] shadow-none ${isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-black/5 dark:border-white/5">
          <div className="text-[1.1rem] font-black text-black dark:text-white flex items-center gap-3">
            {icon} {title}
          </div>
          <div className="text-[1.2rem] text-[#808191] cursor-pointer transition-all p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:text-black dark:hover:text-white hover:bg-[#FF4757] dark:hover:bg-[#FF4757]" onClick={closeSidePanel}>
            <X size={20} />
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 border-b border-black/5 dark:border-white/5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#3B82F6] to-[#00D1F5] shrink-0 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
            {userProfile?.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={32} className="text-white fill-current" />}
          </div>
          <div>
            <div className="font-black text-[1.1rem] text-black dark:text-white">{userProfile?.name || 'Guest User'}</div>
            <div className="text-[0.8rem] text-[#00D1F5] font-bold">Thành Viên Premium</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {data.length === 0 ? (
            <div className="text-center text-[#808191] py-15 px-5 text-[0.95rem] font-medium">
              <div className="text-5xl mb-4 opacity-50 flex justify-center"><Bookmark size={48} className="fill-current" /></div>
              {emptyMsg}
            </div>
          ) : (
            data.map((item, index) => (
              <div key={`${item.slug}-${index}`} className="flex gap-4 p-3 rounded-2xl bg-white dark:bg-[#252836] border border-transparent dark:border-transparent border-[#F8FAFC] mb-3 transition-all cursor-pointer relative group hover:bg-[#353945] dark:hover:bg-[#353945] hover:bg-[#F8FAFC] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_20px_rgba(0,0,0,0.03)]" onClick={() => handleItemClick(item.slug)}>
                <div className="w-16 h-[90px] rounded-xl overflow-hidden shrink-0">
                  <img src={item.thumb_url.startsWith('http') ? item.thumb_url : `https://img.ophim.live/uploads/movies/${item.thumb_url}`} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x90/1F2937/00D1F5'; }} />
                </div>
                <div className="flex-1 flex flex-col justify-center gap-1.5 overflow-hidden">
                  <div className="text-base font-bold text-black dark:text-white line-clamp-2 leading-[1.4]">{item.name}</div>
                  {item.epName && <div className="text-[0.85rem] text-[#3B82F6] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{item.epName}</div>}
                  {item.time && <div className="text-[0.75rem] text-[#808191]">{item.time}</div>}
                </div>
                <button className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-[#FF4757] hover:scale-110" onClick={(e) => { 
                  e.stopPropagation(); 
                  const listName = sidePanelTab === 'fav' ? 'favorites' : sidePanelTab === 'download' ? 'downloads' : 'history';
                  removeFromList(listName, index); 
                }}>
                  <Trash size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};
