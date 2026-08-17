'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Send, Sparkles, MessageSquareText, Loader2 } from 'lucide-react';
import { useAppContext } from '@/lib/store';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { SidePanel } from '@/components/SidePanel';
import { OnboardingModal } from '@/components/OnboardingModal';
import { ScanModal } from '@/components/ScanModal';
import { StoryModal } from '@/components/StoryModal';
import { NotificationModal } from '@/components/NotificationModal';
import { WatchPartyPanel } from '@/components/WatchPartyPanel';

type ChatMessage = {
  id: string;
  content: string;
  sender_name: string;
  room: string;
  created_at: string;
};

const ROOM_NAME = 'global';

function ChatContent() {
  const { userProfile } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(() => userProfile?.name || 'Bạn', [userProfile]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat?room=' + encodeURIComponent(ROOM_NAME), { cache: 'no-store' });
      if (!res.ok) throw new Error('Không thể tải tin nhắn');
      const data = await res.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const timer = window.setInterval(fetchMessages, 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: ROOM_NAME,
          sender_name: displayName,
          content: trimmed,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Không thể gửi tin nhắn');

      setInput('');
      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex opacity-100 transition-opacity duration-500 bg-[var(--terminal-bg)] text-[var(--terminal-ink)] font-sans">
      <Sidebar />
      <main className="ml-[100px] max-lg:ml-0 flex-1 flex flex-col min-h-screen relative w-[calc(100%-100px)] max-lg:w-full max-lg:pb-[100px] overflow-x-hidden bg-[var(--terminal-radial)]">
        <Header />
        <div className="pt-[100px] px-6 pb-[60px] max-w-[1200px] mx-auto flex flex-col gap-6 w-full max-md:pt-[86px] max-md:px-4 max-md:pb-[80px]">
          <section className="soft-card p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="pixel-badge mb-3">Community</div>
                <h1 className="text-3xl md:text-5xl font-black tracking-[-0.06em] leading-none text-[#ebfff9]">Chat chung</h1>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#7ef7c7]/20 bg-[#07130f] px-3 py-2 shadow-[0_0_20px_rgba(126,247,199,0.08)]">
                <Sparkles className="text-[#7ef7c7]" size={16} />
                <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#7ef7c7]">Live</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div ref={scrollRef} className="min-h-[420px] max-h-[520px] overflow-y-auto rounded-[24px] border border-[#7ef7c7]/10 bg-[#081915] p-4 md:p-5 shadow-[inset_0_0_24px_rgba(126,247,199,0.03)]">
                {loading ? (
                  <div className="flex h-full min-h-[320px] items-center justify-center text-[#9abeb2]">
                    <Loader2 className="animate-spin mr-2 text-[#7ef7c7]" size={18} />
                    Đang tải tin nhắn...
                  </div>
                ) : error ? (
                  <div className="flex h-full min-h-[320px] items-center justify-center text-red-300 font-medium">{error}</div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full min-h-[320px] items-center justify-center text-center text-[#9abeb2]">
                    <div>
                      <MessageSquareText size={28} className="mx-auto mb-3 opacity-80 text-[#7ef7c7]" />
                      <p className="font-semibold text-[#ebfff9]">Chưa có tin nhắn nào.</p>
                      <p className="text-sm mt-1">Hãy là người đầu tiên gửi lời chào.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMine = msg.sender_name === displayName;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-[22px] border px-4 py-3 ${
                            isMine
                              ? 'bg-[#7ef7c7] text-[#07130f] border-[#7ef7c7]'
                              : 'bg-[#0e201c] border-[#7ef7c7]/15 text-[#ebfff9]'
                          }`}>
                            <div className="mb-1 text-[11px] font-black uppercase tracking-[0.12em] opacity-80">
                              {msg.sender_name}
                            </div>
                            <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                              {msg.content}
                            </div>
                            <div className={`mt-2 text-[10px] uppercase tracking-[0.1em] opacity-70 ${isMine ? 'text-[#07130f]/70' : 'text-[#9abeb2]'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-end gap-3 rounded-[24px] border border-[#7ef7c7]/10 bg-[#0a1715] p-3 md:p-4 shadow-[0_0_20px_rgba(126,247,199,0.05)]">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={1}
                  placeholder="Nhắn gì đó cho cộng đồng..."
                  className="flex-1 resize-none border-none bg-transparent px-2 py-2 text-[15px] text-[#ebfff9] placeholder:text-[#9abeb2]/80 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7ef7c7] text-[#07130f] disabled:cursor-not-allowed disabled:opacity-50 transition-transform hover:scale-[1.03]"
                >
                  {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </section>
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
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-[var(--terminal-bg)]" /> }>
      <ChatContent />
    </Suspense>
  );
}
