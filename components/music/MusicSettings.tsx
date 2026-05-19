'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Palette, Trash2, Download, Upload, FileText, Edit3,
  Volume2, RefreshCcw, CheckCircle2, AlertCircle, Settings2,
} from 'lucide-react';
import { useMusicContext, ColorTheme } from '@/lib/musicStore';

const NEO_COLORS: Record<string, string> = {
  purple: '#B28DFF',
  ocean:  '#6EE7B7',
  rose:   '#FFA6C9',
  forest: '#86EFAC',
  sunset: '#FDBA74',
  mono:   '#D4D4D4',
};

const THEMES: { key: ColorTheme; label: string; color: string }[] = [
  { key: 'purple', label: 'PURPLE', color: '#B28DFF' },
  { key: 'ocean',  label: 'OCEAN',  color: '#6EE7B7' },
  { key: 'rose',   label: 'ROSE',   color: '#FFA6C9' },
  { key: 'forest', label: 'FOREST', color: '#86EFAC' },
  { key: 'sunset', label: 'SUNSET', color: '#FDBA74' },
  { key: 'mono',   label: 'MONO',   color: '#D4D4D4' },
];

export const MusicSettings = () => {
  const {
    isMusicSettingsOpen, setIsMusicSettingsOpen,
    colorTheme, setColorTheme,
    exportConfig, importConfig, clearAllData,
    tracks, playlists,
    volume, setVolume,
  } = useMusicContext();

  const accentColor = NEO_COLORS[colorTheme] || NEO_COLORS.purple;

  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [editingTxt, setEditingTxt] = useState('');
  const [isEditingTxt, setIsEditingTxt] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        importConfig(text);
        setImportStatus('success');
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleSyncTxt = () => {
    const lines = tracks.map(t => `https://www.youtube.com/watch?v=${t.youtubeId}`).join('\n');
    setEditingTxt(lines);
    setIsEditingTxt(true);
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
  };

  return (
    <AnimatePresence>
      {isMusicSettingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000]"
            style={{ background: 'rgba(49,27,86,0.6)', backdropFilter: 'blur(2px)' }}
            onClick={() => setIsMusicSettingsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[560px] md:max-h-[85vh] bg-[#FAF8F5] border-4 border-[#311B56] shadow-[8px_8px_0px_#311B56] flex flex-col z-[3001]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b-4 border-[#311B56] bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] flex items-center justify-center bg-white">
                  <Settings2 size={20} className="text-[#311B56]" />
                </div>
                <h2 className="font-black text-xl uppercase tracking-tight text-[#311B56]">Cài Đặt Nhạc</h2>
              </div>
              <motion.button
                onClick={() => setIsMusicSettingsOpen(false)}
                className="p-2 border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] bg-white text-[#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} strokeWidth={3} />
              </motion.button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-[#FAF8F5]">

              {/* Color Theme */}
              <section className="bg-white border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] p-5">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-[#311B56] pb-2">
                  <Palette size={20} className="text-[#311B56]" />
                  <h3 className="font-black text-lg uppercase tracking-widest text-[#311B56]">Màu Sắc</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {THEMES.map(t => (
                    <motion.button
                      key={t.key}
                      onClick={() => setColorTheme(t.key)}
                      className="relative p-3 flex flex-col items-center justify-center gap-2 border-2 border-[#311B56] transition-all bg-white"
                      style={{
                        boxShadow: colorTheme === t.key ? 'none' : '4px 4px 0px #311B56',
                        transform: colorTheme === t.key ? 'translate(4px, 4px)' : 'none',
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="w-10 h-10 border-2 border-[#311B56]" style={{ background: t.color }} />
                      <span className="text-xs font-black tracking-widest text-[#311B56]">{t.label}</span>
                      {colorTheme === t.key && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle2 size={16} className="text-[#311B56]" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Volume */}
              <section className="bg-white border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] p-5">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-[#311B56] pb-2">
                  <Volume2 size={20} className="text-[#311B56]" />
                  <h3 className="font-black text-lg uppercase tracking-widest text-[#311B56]">Âm Lượng</h3>
                  <span className="ml-auto text-lg font-black text-[#311B56] bg-gray-100 px-2 border-2 border-[#311B56]">{volume}%</span>
                </div>
                <div className="relative h-6 border-2 border-[#311B56] cursor-pointer bg-white">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  />
                  <div className="h-full border-r-2 border-[#311B56] transition-all" style={{ width: `${volume}%`, background: accentColor }} />
                </div>
              </section>

              {/* Config Management */}
              <section className="bg-white border-2 border-[#311B56] shadow-[4px_4px_0px_#311B56] p-5">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-[#311B56] pb-2">
                  <RefreshCcw size={20} className="text-[#311B56]" />
                  <h3 className="font-black text-lg uppercase tracking-widest text-[#311B56]">Dữ Liệu & Cấu Hình</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {/* Export JSON */}
                  <motion.button
                    onClick={exportConfig}
                    className="flex items-center gap-4 p-4 border-2 border-[#311B56] bg-white shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 border-2 border-[#311B56] flex items-center justify-center bg-[#FAF8F5]">
                      <Download size={20} className="text-[#311B56]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-black uppercase tracking-tight text-[#311B56]">Tải Config (JSON)</div>
                      <div className="text-xs font-bold opacity-70 text-[#311B56]">
                        {tracks.length} bài · {playlists.length} playlist
                      </div>
                    </div>
                  </motion.button>

                  {/* Import JSON */}
                  <motion.button
                    onClick={() => importFileRef.current?.click()}
                    className="flex items-center gap-4 p-4 border-2 border-[#311B56] bg-white shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 border-2 border-[#311B56] flex items-center justify-center bg-[#FAF8F5]">
                      <Upload size={20} className="text-[#311B56]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-black uppercase tracking-tight text-[#311B56]">Khôi phục Config</div>
                      <div className="text-xs font-bold opacity-70 text-[#311B56]">Tải lên file JSON backup</div>
                    </div>
                    {importStatus === 'success' && <CheckCircle2 size={24} className="text-[#22c55e]" />}
                    {importStatus === 'error' && <AlertCircle size={24} className="text-[#ef4444]" />}
                  </motion.button>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ''; }}
                  />

                  {/* Sync / Edit .txt */}
                  <motion.button
                    onClick={handleSyncTxt}
                    className="flex items-center gap-4 p-4 border-2 border-[#311B56] bg-white shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 border-2 border-[#311B56] flex items-center justify-center bg-[#FAF8F5]">
                      <Edit3 size={20} className="text-[#311B56]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-black uppercase tracking-tight text-[#311B56]">Danh sách URLs (.TXT)</div>
                      <div className="text-xs font-bold opacity-70 text-[#311B56]">Xem & Copy list nhạc hiện tại</div>
                    </div>
                    <FileText size={20} className="text-[#311B56]" />
                  </motion.button>
                </div>
              </section>

              {/* Edit TXT Modal inline */}
              <AnimatePresence>
                {isEditingTxt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-3 p-4 border-2 border-[#311B56] bg-white shadow-[4px_4px_0px_#311B56]">
                      <div className="text-sm font-black uppercase tracking-widest text-[#311B56]">
                        Link YouTube ({tracks.length} bài)
                      </div>
                      <textarea
                        value={editingTxt}
                        onChange={e => setEditingTxt(e.target.value)}
                        rows={8}
                        className="w-full p-3 text-xs font-bold font-mono outline-none border-2 border-[#311B56] resize-none bg-[#FAF8F5] focus:bg-white text-[#311B56] shadow-inner"
                      />
                      <div className="flex gap-3">
                        <motion.button
                          onClick={() => {
                            navigator.clipboard.writeText(editingTxt);
                          }}
                          className="flex-1 py-3 border-2 border-[#311B56] text-sm font-black uppercase tracking-widest shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-[#311B56]"
                          style={{ background: accentColor }}
                          whileTap={{ scale: 0.97 }}
                        >
                          Copy Hết
                        </motion.button>
                        <motion.button
                          onClick={() => setIsEditingTxt(false)}
                          className="px-6 py-3 border-2 border-[#311B56] bg-white text-[#311B56] text-sm font-black uppercase tracking-widest shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                          whileTap={{ scale: 0.97 }}
                        >
                          Đóng
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Danger Zone */}
              <section className="bg-red-50 border-2 border-[#ef4444] shadow-[4px_4px_0px_#ef4444] p-5">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-[#ef4444] pb-2">
                  <Trash2 size={20} className="text-[#ef4444]" />
                  <h3 className="font-black text-lg uppercase tracking-widest text-[#ef4444]">Vùng Nguy Hiểm</h3>
                </div>

                {!showClearConfirm ? (
                  <motion.button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full flex items-center justify-center gap-3 p-4 border-2 border-[#ef4444] bg-white text-[#ef4444] shadow-[2px_2px_0px_#ef4444] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    whileTap={{ scale: 0.97 }}
                  >
                    <Trash2 size={18} />
                    <span className="text-sm font-black uppercase tracking-widest">Xóa toàn bộ nhạc</span>
                  </motion.button>
                ) : (
                  <div className="flex flex-col gap-4 p-4 border-2 border-[#ef4444] bg-white">
                    <div className="text-sm font-black uppercase text-center text-[#ef4444]">
                      Hoàng có chắc không? Sẽ bay hết sạch đó! 😰
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        onClick={handleClearData}
                        className="flex-1 py-3 border-2 border-[#ef4444] bg-[#ef4444] text-white text-sm font-black uppercase tracking-widest shadow-[2px_2px_0px_#ef4444] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        whileTap={{ scale: 0.97 }}
                      >
                        Xóa Đi
                      </motion.button>
                      <motion.button
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 py-3 border-2 border-[#311B56] bg-white text-[#311B56] text-sm font-black uppercase tracking-widest shadow-[2px_2px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        whileTap={{ scale: 0.97 }}
                      >
                        Thôi Bỏ
                      </motion.button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
