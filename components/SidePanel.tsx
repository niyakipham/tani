'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { X, Heart, History, Download, Trash, User, Bookmark } from 'lucide-react';

export const SidePanel = () => {
  const { isSidePanelOpen, closeSidePanel, sidePanelTab, favorites, history, downloads, removeFromList, userProfile, setCurrentMovieSlug } = useAppContext();

  const getTabData = () => {
    switch (sidePanelTab) {
    case 'fav': return { data: favorites, emptyMsg: 'Kho phim trống.', icon: <Heart size={20} className="fill-current" />, title: '[ YÊU THÍCH ]' };
    case 'history': return { data: history, emptyMsg: 'Chưa có lịch sử.', icon: <History size={20} />, title: '[ LỊCH SỬ ]' };
    case 'download': return { data: downloads, emptyMsg: 'Chưa có phim tải về.', icon: <Download size={20} />, title: '[ TẢI XUỐNG ]' };
    default: return { data: [], emptyMsg: '', icon: <Bookmark size={20} className="fill-current" />, title: '[ THƯ VIỆN ]' };
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
      <div
        className={`fixed inset-0 bg-[var(--terminal-bg-2)]/60 z-[2000] backdrop-blur-sm transition-opacity duration-300 ${isSidePanelOpen ? 'block opacity-100' : 'hidden opacity-0'}`}
        onClick={closeSidePanel}
      ></div>
      <aside
        className={`fixed top-0 right-0 w-[400px] max-md:w-full h-screen bg-[var(--terminal-panel)] border-l border-[var(--terminal-border-strong)] z-[2001] transform transition-transform duration-400 flex flex-col shadow-[-8px_0_24px_rgba(0,0,0,0.42)] ${isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-[var(--terminal-border)]">
          <div className="text-[1.1rem] font-black text-[var(--terminal-green)] flex items-center gap-3 font-mono tracking-widest uppercase">
            {icon} {title}
          </div>
          <div
            className="text-[1.2rem] text-[var(--terminal-ink)] bg-[var(--terminal-bg-2)] cursor-pointer transition-all p-2 rounded-[14px] border border-[var(--terminal-border)] hover:bg-[var(--terminal-border-soft)] hover:text-[var(--terminal-green)]"
            onClick={closeSidePanel}
          >
            <X size={20} />
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 border-b border-[var(--terminal-border)]">
          <div className="w-14 h-14 rounded-[16px] border border-[var(--terminal-border)] overflow-hidden flex items-center justify-center bg-[var(--terminal-bg-2)] shrink-0">
            {userProfile?.avatar ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover grayscale contrast-125" /> : <User size={32} className="text-[var(--terminal-muted)]" />}
          </div>
          <div>
            <div className="font-black text-[1.1rem] text-[var(--terminal-ink)] uppercase tracking-wide">{userProfile?.name || 'GUEST USER'}</div>
            <div className="text-[0.8rem] text-[var(--terminal-muted)] font-mono font-bold">[ THÀNH VIÊN PREMIUM ]</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {data.length === 0 ? (
            <div className="text-center text-[var(--terminal-muted)] py-15 px-5 text-[0.95rem] font-bold font-mono uppercase tracking-widest">
              <div className="text-5xl mb-4 opacity-50 flex justify-center"><Bookmark size={48} className="text-[var(--terminal-green)]" /></div>
              [ {emptyMsg} ]
            </div>
          ) : (
            data.map((item, index) => (
              <div
                key={`${item.slug}-${index}`}
                className="flex gap-4 p-3 rounded-[18px] bg-[var(--terminal-bg-2)]/60 border border-[var(--terminal-border)] mb-4 transition-all cursor-pointer relative group hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(126,247,199,0.06)]"
                onClick={() => handleItemClick(item.slug)}
              >
                <div className="w-16 h-[90px] rounded-[14px] border border-[var(--terminal-border)] overflow-hidden shrink-0">
                  <img
                    src={item.thumb_url.startsWith('http') ? item.thumb_url : `https://img.ophim.live/uploads/movies/${item.thumb_url}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x90/07130f/7ef7c7'; }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center gap-1.5 overflow-hidden">
                  <div className="text-base font-black text-[var(--terminal-ink)] line-clamp-2 leading-[1.2] uppercase">{item.name}</div>
                  {item.epName && <div className="text-[0.85rem] text-[var(--terminal-green)] font-mono font-bold whitespace-nowrap overflow-hidden text-ellipsis">[ EP {item.epName} ]</div>}
                  {item.time && <div className="text-[0.75rem] text-[var(--terminal-muted)] font-mono">{item.time}</div>}
                </div>
                <button
                  className="absolute top-3 right-3 w-8 h-8 rounded-full border border-[var(--terminal-border)] bg-[var(--terminal-bg-2)]/80 text-red-300 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    const listName = sidePanelTab === 'fav' ? 'favorites' : sidePanelTab === 'download' ? 'downloads' : 'history';
                    removeFromList(listName, index);
                  }}
                >
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
