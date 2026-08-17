'use client';

import React from 'react';
import { X, Bell } from 'lucide-react';
import { useAppContext } from '@/lib/store';

type NotificationKey = 'newEpisodes' | 'recommendations' | 'systemUpdates';

const ToggleRow = ({
  label, desc, keyName, enabled, onToggle
}: { label: string; desc: string; keyName: NotificationKey; enabled: boolean; onToggle: (key: NotificationKey) => void }) => (
  <div
    className="flex items-center justify-between p-4 rounded-[16px] bg-[var(--terminal-bg-2)]/40 border border-[var(--terminal-border)] transition-all hover:bg-[var(--terminal-bg-2)]/70 cursor-pointer"
    onClick={() => onToggle(keyName)}
  >
    <div>
      <div className="text-[1.05rem] font-black font-mono uppercase tracking-wider text-[var(--terminal-green)]">{label}</div>
      <div className="text-[0.85rem] text-[var(--terminal-muted)] font-mono font-bold mt-1 uppercase">{desc}</div>
    </div>
    <div
      className={`w-12 h-6 border border-[var(--terminal-border-strong)] rounded-full p-0.5 transition-colors relative ${enabled ? 'bg-[var(--terminal-green)]' : 'bg-[var(--terminal-bg-2)]'}`}
    >
      <div className={`w-4 h-4 rounded-full border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] absolute top-[2px] transition-transform ${enabled ? 'left-[26px]' : 'left-[2px]'}`}></div>
    </div>
  </div>
);

export const NotificationModal = () => {
  const { isNotificationModalOpen, setIsNotificationModalOpen, notificationSettings, setNotificationSettings } = useAppContext();

  if (!isNotificationModalOpen) return null;

  const handleToggle = (key: keyof typeof notificationSettings) => {
    const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(newSettings);
    localStorage.setItem('tanime_notif_settings', JSON.stringify(newSettings));
  };

  return (
    <div className="fixed inset-0 bg-[var(--terminal-bg-2)]/80 z-[3000] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[var(--terminal-panel)] border border-[var(--terminal-border-strong)] rounded-[var(--terminal-radius)] shadow-[0_18px_60px_rgba(0,0,0,0.42)] flex flex-col w-full max-w-[500px]">
        <div className="p-8 border-b border-[var(--terminal-border)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] border border-[var(--terminal-border)] bg-[var(--terminal-bg-2)] shadow-[0_4px_16px_rgba(0,0,0,0.22)] flex items-center justify-center text-[var(--terminal-green)]">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="text-[1.4rem] font-black font-mono tracking-widest uppercase text-[var(--terminal-green)]">[ CÀI ĐẶT THÔNG BÁO ]</h2>
              <p className="text-[0.85rem] text-[var(--terminal-muted)] font-mono font-bold mt-1 uppercase">[ Tùy chỉnh thông báo bạn muốn nhận ]</p>
            </div>
          </div>
          <button
            className="w-10 h-10 rounded-[14px] border border-[var(--terminal-border)] bg-[var(--terminal-bg-2)] text-[var(--terminal-ink)] flex items-center justify-center transition-all hover:text-[var(--terminal-green)] hover:bg-[var(--terminal-border-soft)]"
            onClick={() => setIsNotificationModalOpen(false)}
          >
            <X size={20} className="font-bold" />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-6">
          <ToggleRow label="[ TẬP PHIM MỚI ]" desc="Thông báo khi có tập mới của phim đang theo dõi" keyName="newEpisodes" enabled={notificationSettings.newEpisodes} onToggle={handleToggle} />
          <ToggleRow label="[ GỢI Ý PHIM ]" desc="Nhận đề xuất phim dựa trên sở thích của bạn" keyName="recommendations" enabled={notificationSettings.recommendations} onToggle={handleToggle} />
          <ToggleRow label="[ CẬP NHẬT HỆ THỐNG ]" desc="Thông báo về tính năng mới và bảo trì" keyName="systemUpdates" enabled={notificationSettings.systemUpdates} onToggle={handleToggle} />
        </div>

        <div className="p-6 border-t border-[var(--terminal-border)] flex justify-end">
          <button
            className="px-8 py-3.5 rounded-[14px] border border-[var(--terminal-border-strong)] bg-[var(--terminal-green)] text-[var(--terminal-bg-2)] shadow-[0_0_24px_rgba(126,247,199,0.12)] hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(126,247,199,0.18)] transition-all font-black font-mono uppercase tracking-widest flex items-center gap-2"
            onClick={() => setIsNotificationModalOpen(false)}
          >
            <X size={20} className="font-bold" /> [ ĐÓNG ]
          </button>
        </div>
      </div>
    </div>
  );
};
