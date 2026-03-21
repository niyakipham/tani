'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useAppContext } from '@/lib/store';

const ALL_GENRES = [
  { name: 'Hành Động', slug: 'hanh-dong' }, { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Hài Hước', slug: 'hai-huoc' }, { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Tâm Lý', slug: 'tam-ly' }, { name: 'Hình Sự', slug: 'hinh-su' },
  { name: 'Chiến Tranh', slug: 'chien-tranh' }, { name: 'Thể Thao', slug: 'the-thao' },
  { name: 'Võ Thuật', slug: 'vo-thuat' }, { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu' }, { name: 'Khoa Học', slug: 'khoa-hoc' },
  { name: 'Kinh Dị', slug: 'kinh-di' }, { name: 'Âm Nhạc', slug: 'am-nhac' },
  { name: 'Thần Thoại', slug: 'than-thoai' }, { name: 'Tài Liệu', slug: 'tai-lieu' },
  { name: 'Gia Đình', slug: 'gia-dinh' }, { name: 'Chính kịch', slug: 'chinh-kich' },
  { name: 'Bí ẩn', slug: 'bi-an' }, { name: 'Học Đường', slug: 'hoc-duong' },
  { name: 'Kinh Điển', slug: 'kinh-dien' }, { name: 'Phim 18+', slug: 'phim-18' },
  { name: 'Short Drama', slug: 'short-drama' }
];

export const OnboardingModal = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, setUserProfile, setPreferences } = useAppContext();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());

  if (!isOnboardingOpen) return null;

  const handleToggleGenre = (slug: string) => {
    const newSet = new Set(selectedGenres);
    if (newSet.has(slug)) {
      newSet.delete(slug);
    } else {
      newSet.add(slug);
    }
    setSelectedGenres(newSet);
  };

  const handleSave = () => {
    const prefs = Array.from(selectedGenres);
    setPreferences(prefs);
    localStorage.setItem('tanime_prefs', JSON.stringify(prefs));

    const profile = {
      name: name.trim() || 'Guest User',
      avatar: avatar.trim() || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix'
    };
    setUserProfile(profile);
    localStorage.setItem('tanime_profile', JSON.stringify(profile));

    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-[#13141C]/90 dark:bg-[#13141C]/90 bg-white/85 z-[3000] backdrop-blur-[20px] flex items-center justify-center">
      <div className="bg-white dark:bg-[#252836] border border-black/5 dark:border-white/5 rounded-[40px] p-12 max-w-[500px] w-[90%] text-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] shadow-[0_20px_40px_rgba(18,38,63,0.05)] relative overflow-hidden">
        <h2 className="text-[2rem] font-black mb-3 tracking-[-1px] text-black dark:text-white"><span className="gradient-text">Diện Mạo Mới</span></h2>
        <p className="text-[#808191] mb-8 text-[0.95rem] leading-[1.6]">Chọn một ảnh đại diện thật chất để thể hiện cá tính và thiết lập hồ sơ của bạn nhé!</p>
        
        <div className="flex flex-col items-center gap-5 mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-[#353945] overflow-hidden relative bg-[#F4F7FB] dark:bg-[#13141C] flex items-center justify-center">
            <img src={avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix'} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix'; }} />
          </div>
        </div>

        <div className="flex flex-col gap-4 text-left">
          <input 
            type="text" 
            placeholder="Nhập tên của bạn (Bắt buộc)..." 
            className="w-full rounded-xl p-4 bg-[#F8FAFC] dark:bg-[#13141C] border border-black/5 dark:border-transparent text-black dark:text-white outline-none text-[15px] transition-all font-medium focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1A1C23] placeholder:font-normal placeholder:text-[#808191] dark:placeholder:text-[#808191]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex items-center text-center text-[#808191] text-[0.85rem] my-6 w-full font-semibold before:content-[''] before:flex-1 before:border-b before:border-white/5 dark:before:border-white/5 before:border-black/5 before:mx-4 after:content-[''] after:flex-1 after:border-b after:border-white/5 dark:after:border-white/5 after:border-black/5 after:mx-4">
            Hoặc dùng link ảnh
          </div>
          <input 
            type="text" 
            placeholder="Dán link ảnh vào đây..." 
            className="w-full rounded-xl p-4 bg-[#F8FAFC] dark:bg-[#13141C] border border-black/5 dark:border-transparent text-black dark:text-white outline-none text-[15px] transition-all font-medium focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1A1C23] placeholder:font-normal placeholder:text-[#808191] dark:placeholder:text-[#808191]"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>

        <button 
          className="bg-[#3B82F6] text-white border-none py-4 px-12 rounded-full text-base font-bold cursor-pointer transition-all w-full inline-flex items-center justify-center gap-3 shadow-[0_4px_15px_rgba(59,130,246,0.3)] mt-6 hover:-translate-y-0.5 hover:bg-[#2563EB] hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)] disabled:bg-[#353945] dark:disabled:bg-[#353945] disabled:bg-[#F1F5F9] disabled:text-[#808191] disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
          disabled={!name.trim()}
          onClick={handleSave}
        >
          Hoàn Tất <Check size={20} className="font-bold" />
        </button>
      </div>
    </div>
  );
};
