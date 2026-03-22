'use client';

import React, { useEffect, Suspense } from 'react';
import { useAppContext } from '@/lib/store';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { HeroPlayer } from '@/components/HeroPlayer';
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
    <div className={`min-h-screen w-full flex opacity-100 transition-opacity duration-500 bg-[#F4F7FB] dark:bg-[#13141C] text-black dark:text-white font-sans`}>
      <Sidebar />
      <main className="ml-[100px] max-lg:ml-0 flex-1 flex flex-col min-h-screen relative w-[calc(100%-100px)] max-lg:w-full max-lg:pb-[90px]">
        <Header />
        <div className="pt-[100px] px-10 pb-[60px] max-w-[1600px] mx-auto flex flex-col gap-10 w-full max-md:pt-[86px] max-md:px-0 max-md:pb-[80px] max-md:gap-6">
          <HeroPlayer />
          <ContinueWatching />
          <ExploreSection />
        </div>
      </main>
      <MobileNav />
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
    <Suspense fallback={<div className="min-h-screen w-full bg-[#F4F7FB] dark:bg-[#13141C]"></div>}>
      <MainContent />
    </Suspense>
  );
}
