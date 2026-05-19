'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Music2, LayoutDashboard, Library, ListMusic, Settings2,
  Plus, Upload, ChevronRight,
} from 'lucide-react';
import { useMusicContext } from '@/lib/musicStore';
import { MusicDashboard } from '@/components/music/MusicDashboard';
import { MusicLibrary } from '@/components/music/MusicLibrary';
import { MusicPlayerBar } from '@/components/music/MusicPlayerBar';
import { MusicQueue } from '@/components/music/MusicQueue';
import { AddTxtModal } from '@/components/music/AddTxtModal';
import { CreatePlaylistModal } from '@/components/music/CreatePlaylistModal';
import { MusicPartyPanel } from '@/components/music/MusicPartyPanel';
import { MusicSettings } from '@/components/music/MusicSettings';
import { YouTubePlayer } from '@/components/music/YouTubePlayer';

const NEO_COLORS: Record<string, string> = {
  purple: '#B28DFF',
  ocean:  '#6EE7B7',
  rose:   '#FFA6C9',
  forest: '#86EFAC',
  sunset: '#FDBA74',
  mono:   '#D4D4D4',
};

type Tab = 'dashboard' | 'library' | 'playlist';

const NAV_ITEMS: { key: Tab; icon: React.ReactNode; label: string }[] = [
  { key: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { key: 'library',   icon: <Library size={20} />,         label: 'Thư Viện' },
  { key: 'playlist',  icon: <ListMusic size={20} />,       label: 'Playlist' },
];

const MusicPageContent = () => {
  const {
    colorTheme,
    setIsAddTxtOpen, setIsCreatePlaylistOpen, setIsMusicSettingsOpen,
    tracks,
  } = useMusicContext();

  const accentColor = NEO_COLORS[colorTheme] || NEO_COLORS.purple;
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] text-[#311B56] font-sans pb-[160px] md:pb-[90px]">
      {/* Left Sidebar */}
      <aside className="w-[220px] shrink-0 flex flex-col p-4 gap-4 sticky top-0 h-screen border-r-2 border-[#311B56] hidden md:flex bg-[#FAF8F5] z-[100]">
        
        {/* Logo */}
        <div className="flex items-center gap-3 p-2 border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] bg-white mb-2">
          <div className="w-10 h-10 flex items-center justify-center border-r-2 border-[#311B56]" style={{ background: accentColor }}>
            <Music2 size={20} className="text-[#311B56]" />
          </div>
          <div>
            <div className="font-black text-sm tracking-widest uppercase">Tani Music</div>
            <div className="text-xs font-bold opacity-70">{tracks.length} bài hát</div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-3">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-3 px-3 py-3 font-bold text-sm text-left w-full border-2 border-[#311B56] transition-all
                  ${isActive 
                    ? 'translate-x-[2px] translate-y-[2px] shadow-none' 
                    : 'shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                  }`}
                style={{ background: isActive ? accentColor : 'white' }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="text-[10px] font-black opacity-60 px-1 uppercase tracking-widest">Nhanh</div>
          {[
            { icon: <Plus size={16} />, label: 'Thêm file .TXT', action: () => setIsAddTxtOpen(true) },
            { icon: <Upload size={16} />, label: 'Tạo Playlist', action: () => setIsCreatePlaylistOpen(true) },
          ].map((a, i) => (
            <button
              key={i}
              onClick={a.action}
              className="flex items-center gap-2 px-3 py-2 font-bold text-xs text-left w-full border-2 border-transparent hover:border-[#311B56] hover:bg-white transition-all"
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>

        {/* Settings at bottom */}
        <div className="mt-auto">
          <button
            onClick={() => setIsMusicSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-3 border-2 border-[#311B56] bg-white font-bold text-sm w-full shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            <Settings2 size={20} />
            Cài đặt
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 p-4 sticky top-0 z-50 border-b-2 border-[#311B56] bg-[#FAF8F5]">
          <div className="w-8 h-8 flex items-center justify-center border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56]" style={{ background: accentColor }}>
            <Music2 size={16} className="text-[#311B56]" />
          </div>
          <span className="font-black text-sm tracking-widest uppercase">Tani Music</span>
          <div className="flex-1" />
          <button
            onClick={() => setIsMusicSettingsOpen(true)}
            className="p-2 border-2 border-[#311B56] bg-white shadow-[2px_2px_0px_#311B56] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Settings2 size={16} />
          </button>
        </div>

        {/* Mobile Mini Nav (above main BottomNav) */}
        <div className="md:hidden fixed top-[64px] left-0 right-0 z-[40] flex border-b-2 border-[#311B56] bg-[#FAF8F5] shadow-sm">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex-1 py-3 flex items-center justify-center gap-2 border-r-2 border-[#311B56] last:border-r-0 font-bold text-xs transition-colors`}
                style={{ background: isActive ? accentColor : 'transparent' }}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 md:p-8 md:pt-8 pt-[60px]"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm border-2 border-[#311B56] bg-white px-3 py-1.5 w-max shadow-[2px_2px_0px_#311B56]">
            <Music2 size={14} />
            <ChevronRight size={14} />
            <span className="font-bold uppercase tracking-widest" style={{ color: '#311B56' }}>
              {NAV_ITEMS.find(n => n.key === activeTab)?.label}
            </span>
          </div>

          {activeTab === 'dashboard' && <MusicDashboard />}
          {activeTab === 'library' && <MusicLibrary />}
          {activeTab === 'playlist' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-3xl font-black uppercase tracking-tight">Playlist</h2>
                <button
                  onClick={() => setIsCreatePlaylistOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#311B56] font-bold shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all w-max"
                  style={{ background: accentColor }}
                >
                  <Plus size={18} /> Tạo Playlist Mới
                </button>
              </div>
              
              <button
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="flex items-center gap-5 p-6 border-2 border-[#311B56] border-dashed bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="w-14 h-14 flex items-center justify-center border-2 border-[#311B56]" style={{ background: accentColor }}>
                  <ListMusic size={28} className="text-[#311B56]" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-black text-lg">Quản lý Playlist</div>
                  <div className="text-sm font-bold opacity-60">Thêm, sửa, xoá các playlist của bạn</div>
                </div>
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Global Music Components */}
      <YouTubePlayer />
      <MusicPlayerBar />
      <MusicQueue />
      <AddTxtModal />
      <CreatePlaylistModal />
      <MusicPartyPanel />
      <MusicSettings />
    </div>
  );
};

export default function MusicPage() {
  return <MusicPageContent />;
}
