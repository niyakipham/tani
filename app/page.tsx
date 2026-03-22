'use client';

import React, { useEffect, Suspense } from 'react';
import { useAppContext } from '@/lib/store';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { HeroPlayer } from '@/components/HeroPlayer';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ContinueWatching } from '@/components/ContinueWatching';
import { ExploreSection } from '@/components/ExploreSection';
import { SidePanel } from '@/components/SidePanel';
import { OnboardingModal } from '@/components/OnboardingModal';
import { ScanModal } from '@/components/ScanModal';
import { StoryModal } from '@/components/StoryModal';
import { NotificationModal } from '@/components/NotificationModal';
import { WatchPartyPanel } from '@/components/WatchPartyPanel';

const MainContent = () => {
  const { theme, currentMovieSlug, setCurrentMovieSlug } = useAppContext();

  useEffect(() => {
    if (!currentMovieSlug) {
      // Fetch initial movie
      fetch('https://ophim1.com/v1/api/tim-kiem?keyword=overlord')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && data.data.items.length > 0) {
            setCurrentMovieSlug(data.data.items[0].slug);
          } else {
            fetch('https://ophim1.com/v1/api/danh-sach/hoat-hinh?page=1')
              .then(res => res.json())
              .then(data => {
                if (data.status === 'success' && data.data.items.length > 0) {
                  setCurrentMovieSlug(data.data.items[0].slug);
                }
              });
          }
        });
    }
  }, [currentMovieSlug, setCurrentMovieSlug]);

  return (
    <div className={`min-h-screen w-full flex opacity-100 transition-opacity duration-500 bg-[#F8FAFC] dark:bg-[#07080B] text-black dark:text-white font-sans`}>
      <Sidebar />
      <main className="ml-[100px] max-lg:ml-0 flex-1 flex flex-col min-h-screen relative w-[calc(100%-100px)] max-lg:w-full max-lg:pb-[100px]">
        <Header />
        <div className="pt-[100px] md:px-10 pb-[60px] max-w-[1600px] mx-auto flex flex-col gap-6 w-full max-md:pt-[86px] max-md:px-0 max-md:pb-[80px] max-md:gap-4">
          <HeroPlayer />
          <HeroCarousel />
          <ContinueWatching />
          <ExploreSection />
        </div>
      </main>
      <BottomNav />
      <SidePanel />
      <WatchPartyPanel />
      <OnboardingModal />
      <ScanModal />
      <StoryModal />
      <NotificationModal />
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#07080B]"></div>}>
      <MainContent />
    </Suspense>
  );
}
