'use client';

import React, { useState } from 'react';
import { Check, User } from 'lucide-react';
import { useAppContext } from '@/lib/store';

const ALL_GENRES = [
  { name: 'Hành Động', slug: 'hanh-dong' }, { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Hài Hưỏc', slug: 'hai-huoc' }, { name: 'Cổ Trang', slug: 'co-trang' },
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
    <div className="fixed inset-0 bg-[var(--terminal-bg-2)]/60 z-[3000] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[var(--terminal-panel)] border border-[var(--terminal-border-strong)] rounded-[var(--terminal-radius)] p-8 md:p-10 max-w-[500px] w-[90%] text-center shadow-[0_18px_60px_rgba(0,0,0,0.42)]">
        <h2 className="text-[1.8rem] md:text-[2.2rem] font-black font-mono tracking-widest text-[var(--terminal-green)] uppercase mb-2">[ HỒ SƠ CỦA BẠN ]</h2>
        <p className="text-[var(--terminal-muted)] mb-8 text-[0.95rem] font-mono font-bold leading-[1.6]">[ Hãy cập nhật danh tính để chuẩn bị gia nhập rạp phim nhé! ]</p>

        <div className="flex flex-col items-center gap-5 mb-8">
          <div className="w-24 h-24 rounded-[18px] border border-[var(--terminal-border)] shadow-[0_0_24px_rgba(126,247,199,0.08)] overflow-hidden relative flex items-center justify-center bg-[var(--terminal-bg-2)] grayscale contrast-125">
            <img
              src={avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix'}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix'; }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 text-left">
          <input
            type="text"
            placeholder="[ NHẬP TÊN CỦA BẠN (BẮT BUỘC)... ]"
            className="w-full rounded-[14px] p-4 terminal-input placeholder:text-[var(--terminal-muted)] uppercase"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex items-center text-center text-[var(--terminal-muted)] font-black font-mono uppercase tracking-widest text-[0.85rem] my-4 w-full before:content-[''] before:flex-1 before:border-t before:border-[var(--terminal-border)] before:mx-4 after:content-[''] after:flex-1 after:border-t after:border-[var(--terminal-border)] after:mx-4">
            [ HOẶC URL ẢNH ]
          </div>
          <input
            type="text"
            placeholder="[ DÁN LINK ẢNH VÀO ĐÂY... ]"
            className="w-full rounded-[14px] p-4 terminal-input placeholder:text-[var(--terminal-muted)] uppercase"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>

        <button
          className="w-full mt-8 py-3.5 px-6 rounded-[14px] border border-[var(--terminal-border-strong)] bg-[var(--terminal-green)] text-[var(--terminal-bg-2)] font-black font-mono uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(126,247,199,0.18)] disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={!name.trim()}
          onClick={handleSave}
        >
          [ GIA NHẬP NGAY ] <Check size={24} className="font-bold" />
        </button>
      </div>
    </div>
  );
};
