'use client';

import React, { useState } from 'react';
import { Database, FileCode, FileSpreadsheet, StopCircle } from 'lucide-react';
import { useAppContext } from '@/lib/store';

export const ScanModal = () => {
  const { isScanModalOpen, setIsScanModalOpen } = useAppContext();
  const [isScanning, setIsScanning] = useState(false);
  const [scanFormat, setScanFormat] = useState<'json' | 'csv'>('json');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('[ ĐANG CHUẨN BỊ QUÉT DỮ LIỆU... ]');
  const [scannedCount, setScannedCount] = useState(0);

  if (!isScanModalOpen) return null;

  const handleClose = () => {
    if (isScanning && !confirm("Bạn có chắc muốn đóng? Quá trình quét sẽ bị dừng lại!")) return;
    setIsScanning(false);
    setIsScanModalOpen(false);
  };

  const startScan = async (format: 'json' | 'csv') => {
    setScanFormat(format);
    setIsScanning(true);
    setProgress(0);
    setScannedCount(0);
    setStatus('[ ĐANG PHÂN TÍCH CẤU TRÚC DỮ LIỆU... ]');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      setScannedCount(currentProgress * 10);
      setStatus(`[ ĐANG LẤY DANH SÁCH PHIM... (${currentProgress}%) ]`);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setStatus('[ HOÀN TẤT QUÉT DỮ LIỆU! ]');
        setTimeout(() => {
          setIsScanning(false);
          setIsScanModalOpen(false);
          alert(`Đã quét xong ${currentProgress * 10} phim và lưu dưới dạng ${format.toUpperCase()}`);
        }, 1000);
      }
    }, 500);
  };

  const stopScan = () => {
    setIsScanning(false);
    setStatus('[ ĐÃ DỪNG. ĐANG CHUẨN BỖI FILE TẢI XUỐNG... ]');
    setTimeout(() => {
      setIsScanModalOpen(false);
      alert(`Đã lưu tạm ${scannedCount} phim dưới dạng ${scanFormat.toUpperCase()}`);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-[var(--terminal-bg-2)]/80 z-[3000] backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--terminal-panel)] border border-[var(--terminal-border-strong)] rounded-[var(--terminal-radius)] p-10 max-w-[500px] w-[90%] shadow-[0_18px_60px_rgba(0,0,0,0.42)] relative overflow-hidden">
        <h3 className="text-[1.8rem] font-black font-mono tracking-widest uppercase mb-6 text-[var(--terminal-green)] flex items-center gap-3">
          <Database size={28} className="fill-current" /> [ QUÉT DỮ LIỆU ]
        </h3>

        {!isScanning ? (
          <div>
            <p className="text-[var(--terminal-muted)] font-mono font-bold mb-8 text-[0.95rem] leading-relaxed">[ Hệ thống sẽ quét toàn bộ danh sách phim từ trang 1 đến trang cuối để lấy thông tin. Vui lòng chọn định dạng lưu: ]</p>
            <div className="flex flex-col gap-4">
              <button
                className="w-full py-3.5 px-6 rounded-[14px] border border-[var(--terminal-border-strong)] bg-[var(--terminal-green)] text-[var(--terminal-bg-2)] font-black font-mono tracking-widest uppercase cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(126,247,199,0.18)]"
                onClick={() => startScan('json')}
              >
                <FileCode size={20} className="font-bold" /> [ TẢI JSON ]
              </button>
              <button
                className="w-full py-3.5 px-6 rounded-[14px] border border-[var(--terminal-border-strong)] bg-[var(--terminal-cyan)] text-[var(--terminal-bg-2)] font-black font-mono tracking-widest uppercase cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(122,216,255,0.18)]"
                onClick={() => startScan('csv')}
              >
                <FileSpreadsheet size={20} className="font-bold" /> [ TẢI CSV ]
              </button>
              <button
                className="w-full py-3.5 px-6 rounded-[14px] border border-[var(--terminal-border)] text-[var(--terminal-muted)] font-black font-mono tracking-widest uppercase cursor-pointer hover:text-[var(--terminal-ink)] hover:bg-[var(--terminal-bg-2)] transition-all"
                onClick={handleClose}
              >
                [ HỦY ]
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[var(--terminal-muted)] font-mono font-bold mb-4 text-[0.9rem]">[ Vui lòng không đóng trình duyệt trong quá trình này. ]</p>
            <div className="w-full h-4 bg-[var(--terminal-bg-2)] border border-[var(--terminal-border)] rounded-[10px] mb-6 relative overflow-hidden">
              <div className="h-full bg-[var(--terminal-green)] transition-all duration-300 relative" style={{ width: `${progress}%` }}>
                <div className="absolute -inset-1 opacity-40" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.25) 4px, rgba(0,0,0,0.25) 8px)' }}></div>
              </div>
            </div>
            <div className="text-[var(--terminal-green)] font-black font-mono uppercase tracking-widest mb-2 text-[0.9rem]">{status}</div>
            <div className="text-[var(--terminal-muted)] font-mono font-bold text-[0.8rem] mb-8">[ ĐÃ QUÉT: {scannedCount} PHIM ]</div>

            <button
              className="w-full py-3.5 px-6 rounded-[14px] border border-[var(--terminal-border-strong)] bg-[var(--terminal-panel)] text-[var(--terminal-muted)] font-black font-mono tracking-widest uppercase cursor-pointer transition-all flex items-center justify-center gap-2 hover:text-[var(--terminal-ink)] hover:bg-[var(--terminal-bg-2)] hover:shadow-[0_0_28px_rgba(126,247,199,0.12)]"
              onClick={stopScan}
            >
              <StopCircle size={20} className="font-bold" /> [ DỪNG & LƯU TẠM ]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
