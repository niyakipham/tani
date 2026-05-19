'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Link2, Loader2, CheckCircle2, AlertCircle, FileText, Trash2, Plus } from 'lucide-react';
import { useMusicContext, MusicTrack } from '@/lib/musicStore';

const NEO_COLORS: Record<string, string> = {
  purple: '#B28DFF',
  ocean:  '#6EE7B7',
  rose:   '#FFA6C9',
  forest: '#86EFAC',
  sunset: '#FDBA74',
  mono:   '#D4D4D4',
};

type ResolveStatus = 'idle' | 'resolving' | 'done' | 'error';
type TrackState = { url: string; status: 'pending' | 'loading' | 'success' | 'error'; track?: MusicTrack; error?: string };

export const AddTxtModal = () => {
  const { isAddTxtOpen, setIsAddTxtOpen, addTracks, colorTheme } = useMusicContext();
  const accentColor = NEO_COLORS[colorTheme] || NEO_COLORS.purple;

  const [mode, setMode] = useState<'file' | 'paste'>('file');
  const [pasteText, setPasteText] = useState('');
  const [trackStates, setTrackStates] = useState<TrackState[]>([]);
  const [status, setStatus] = useState<ResolveStatus>('idle');
  const [isDragOver, setIsDragOver] = useState(false);

  const parseUrls = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.txt')) {
      alert('Chỉ hỗ trợ file .txt nhé Hoàng!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const urls = parseUrls(text);
      setTrackStates(urls.map(url => ({ url, status: 'pending' })));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handlePaste = () => {
    const urls = parseUrls(pasteText);
    setTrackStates(urls.map(url => ({ url, status: 'pending' })));
  };

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.trim().match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const resolveAll = async () => {
    if (trackStates.length === 0) return;
    setStatus('resolving');

    const CHUNK_SIZE = 3;
    const updated = [...trackStates];

    for (let i = 0; i < updated.length; i += CHUNK_SIZE) {
      const chunk = updated.slice(i, i + CHUNK_SIZE);

      for (let j = i; j < Math.min(i + CHUNK_SIZE, updated.length); j++) {
        updated[j] = { ...updated[j], status: 'loading' };
      }
      setTrackStates([...updated]);

      const chunkResults = await Promise.all(
        chunk.map(async (ts) => {
          const videoId = extractYouTubeId(ts.url);
          if (!videoId) return null;

          try {
            const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            if (!res.ok) return null;
            const data = await res.json();
            
            return {
              id: `track_${videoId}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              title: data.title || 'Unknown Title',
              artist: data.author_name || 'Unknown Artist',
              thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              youtubeId: videoId,
              duration: 0,
              addedAt: new Date().toISOString(),
            } as MusicTrack;
          } catch {
            return null;
          }
        })
      );

      for (let j = 0; j < chunk.length; j++) {
        const idx = i + j;
        const resolved = chunkResults[j];
        if (resolved) {
          updated[idx] = { ...updated[idx], status: 'success', track: resolved };
        } else {
          updated[idx] = { ...updated[idx], status: 'error', error: 'Không tìm thấy hoặc lỗi mạng' };
        }
      }
      setTrackStates([...updated]);
    }

    setStatus('done');
  };

  const handleAddAll = () => {
    const successTracks = trackStates
      .filter(ts => ts.status === 'success' && ts.track)
      .map(ts => ts.track!);
    addTracks(successTracks);
    handleClose();
  };

  const handleClose = () => {
    setIsAddTxtOpen(false);
    setTrackStates([]);
    setPasteText('');
    setStatus('idle');
    setMode('file');
  };

  const removeTrackState = (index: number) => {
    setTrackStates(prev => prev.filter((_, i) => i !== index));
  };

  const successCount = trackStates.filter(ts => ts.status === 'success').length;
  const errorCount = trackStates.filter(ts => ts.status === 'error').length;

  return (
    <AnimatePresence>
      {isAddTxtOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000]"
            style={{ background: 'rgba(49,27,86,0.6)', backdropFilter: 'blur(2px)' }}
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[85vh] bg-[#FAF8F5] border-4 border-[#311B56] shadow-[8px_8px_0px_#311B56] flex flex-col z-[3001]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b-4 border-[#311B56] bg-white">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-[#311B56]">📄 Thêm Nhạc từ .TXT</h2>
                <p className="text-xs font-bold opacity-70 mt-1 uppercase tracking-widest text-[#311B56]">Mỗi dòng = 1 link YouTube</p>
              </div>
              <motion.button
                onClick={handleClose}
                className="p-2 border-2 border-[#311B56] shadow-[2px_2px_0px_#311B56] bg-white text-[#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} strokeWidth={3} />
              </motion.button>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-4 p-5 pb-0 bg-[#FAF8F5]">
              {(['file', 'paste'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-3 border-2 border-[#311B56] text-sm font-black uppercase tracking-widest transition-all"
                  style={{
                    background: mode === m ? accentColor : 'white',
                    boxShadow: mode === m ? 'none' : '2px 2px 0px #311B56',
                    transform: mode === m ? 'translate(2px, 2px)' : 'none',
                    color: '#311B56',
                  }}
                >
                  {m === 'file' ? '📁 Upload File' : '📋 Dán Link'}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {trackStates.length === 0 ? (
                <>
                  {mode === 'file' ? (
                    <div
                      className="border-4 border-dashed border-[#311B56] bg-white p-10 flex flex-col items-center gap-4 cursor-pointer transition-all"
                      style={{
                        background: isDragOver ? accentColor : 'white',
                      }}
                      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => {
                        const inp = document.createElement('input');
                        inp.type = 'file';
                        inp.accept = '.txt';
                        inp.onchange = e => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleFileUpload(file);
                        };
                        inp.click();
                      }}
                    >
                      <div className="w-20 h-20 border-4 border-[#311B56] flex items-center justify-center shadow-[4px_4px_0px_#311B56] bg-white">
                        <Upload size={36} className="text-[#311B56]" />
                      </div>
                      <div className="text-center text-[#311B56]">
                        <div className="font-black text-lg uppercase tracking-widest">Kéo thả hoặc click để chọn file</div>
                        <div className="text-xs font-bold opacity-70 mt-2 uppercase tracking-widest">Hỗ trợ file .txt</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <textarea
                        className="w-full p-4 text-sm font-bold font-mono outline-none border-4 border-[#311B56] resize-none bg-white focus:bg-gray-50 text-[#311B56] shadow-inner"
                        style={{ minHeight: 200 }}
                        placeholder={`https://www.youtube.com/watch?v=...\nhttps://youtu.be/...\n# Dòng bắt đầu bằng # sẽ bị bỏ qua`}
                        value={pasteText}
                        onChange={e => setPasteText(e.target.value)}
                      />
                      <motion.button
                        onClick={handlePaste}
                        disabled={!pasteText.trim()}
                        className="py-4 border-2 border-[#311B56] font-black uppercase tracking-widest flex items-center justify-center gap-3 text-[#311B56] shadow-[4px_4px_0px_#311B56] disabled:opacity-50 disabled:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#311B56]"
                        style={{ background: pasteText.trim() ? accentColor : '#E5E5E5' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus size={20} strokeWidth={3} /> Phân tích Links
                      </motion.button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Status Summary */}
                  {status !== 'idle' && (
                    <div className="flex gap-3 text-[#311B56]">
                      <div className="flex items-center gap-2 px-4 py-2 border-2 border-[#311B56] bg-white text-sm font-black uppercase shadow-[2px_2px_0px_#311B56]">
                        <Loader2 size={16} className={status === 'resolving' ? 'animate-spin' : ''} />
                        {trackStates.filter(ts => ts.status !== 'pending').length} / {trackStates.length}
                      </div>
                      {successCount > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 border-2 border-[#22c55e] bg-white text-sm font-black uppercase text-[#22c55e] shadow-[2px_2px_0px_#22c55e]">
                          <CheckCircle2 size={16} /> {successCount} OK
                        </div>
                      )}
                      {errorCount > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 border-2 border-[#ef4444] bg-white text-sm font-black uppercase text-[#ef4444] shadow-[2px_2px_0px_#ef4444]">
                          <AlertCircle size={16} /> {errorCount} Lỗi
                        </div>
                      )}
                    </div>
                  )}

                  {/* Track List */}
                  <div className="flex flex-col gap-3">
                    {trackStates.map((ts, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 p-3 border-2 border-[#311B56] bg-white shadow-[2px_2px_0px_#311B56]"
                      >
                        {/* Thumbnail or Icon */}
                        <div className="w-12 h-12 border-2 border-[#311B56] overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                          {ts.track?.thumbnail ? (
                            <img src={ts.track.thumbnail} alt="" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                          ) : (
                            ts.status === 'loading' ? (
                              <Loader2 size={20} className="animate-spin text-[#311B56]" />
                            ) : ts.status === 'error' ? (
                              <AlertCircle size={20} className="text-[#ef4444]" />
                            ) : (
                              <Link2 size={20} className="text-[#311B56]" />
                            )
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black truncate uppercase tracking-tight text-[#311B56]">
                            {ts.track?.title || ts.url}
                          </div>
                          <div className="text-xs font-bold opacity-70 truncate text-[#311B56]">
                            {ts.track?.artist || (ts.status === 'error' ? ts.error : ts.url)}
                          </div>
                        </div>

                        {/* Status icon */}
                        <div className="shrink-0 flex items-center gap-3">
                          {ts.status === 'success' && <CheckCircle2 size={20} className="text-[#22c55e]" strokeWidth={3} />}
                          {ts.status === 'error' && <AlertCircle size={20} className="text-[#ef4444]" strokeWidth={3} />}
                          {ts.status === 'loading' && <Loader2 size={20} className="animate-spin text-[#311B56]" strokeWidth={3} />}
                          
                          <motion.button
                            onClick={() => removeTrackState(i)}
                            className="p-2 border-2 border-transparent hover:border-[#ef4444] text-[#ef4444] transition-all bg-white"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t-4 border-[#311B56] flex gap-4 bg-white">
              {trackStates.length > 0 && status === 'idle' && (
                <motion.button
                  onClick={resolveAll}
                  className="flex-1 py-4 border-2 border-[#311B56] text-[#311B56] font-black uppercase tracking-widest shadow-[4px_4px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#311B56] flex items-center justify-center gap-3"
                  style={{ background: accentColor }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileText size={20} /> Tải thông tin ({trackStates.length} bài)
                </motion.button>
              )}

              {status === 'resolving' && (
                <div className="flex-1 py-4 border-2 border-[#311B56] font-black uppercase tracking-widest shadow-[4px_4px_0px_#311B56] flex items-center justify-center gap-3 opacity-60 bg-gray-100 text-[#311B56]">
                  <Loader2 size={20} className="animate-spin" /> Đang tải...
                </div>
              )}

              {status === 'done' && successCount > 0 && (
                <motion.button
                  onClick={handleAddAll}
                  className="flex-1 py-4 border-2 border-[#22c55e] text-[#22c55e] font-black uppercase tracking-widest shadow-[4px_4px_0px_#22c55e] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#22c55e] flex items-center justify-center gap-3 bg-green-50"
                  whileTap={{ scale: 0.95 }}
                >
                  <CheckCircle2 size={20} strokeWidth={3} /> Thêm {successCount} bài
                </motion.button>
              )}

              <motion.button
                onClick={handleClose}
                className="px-8 py-4 border-2 border-[#311B56] bg-white text-[#311B56] font-black uppercase tracking-widest shadow-[4px_4px_0px_#311B56] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#311B56]"
                whileTap={{ scale: 0.95 }}
              >
                Đóng
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
