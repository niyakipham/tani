'use client';

import React, { useState } from 'react';
import { Database, FileCode, FileSpreadsheet, StopCircle } from 'lucide-react';
import { useAppContext } from '@/lib/store';

export const ScanModal = () => {
  const { isScanModalOpen, setIsScanModalOpen } = useAppContext();
  const [isScanning, setIsScanning] = useState(false);
  const [scanFormat, setScanFormat] = useState<'json' | 'csv'>('json');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Đang chuẩn bị quét dữ liệu...');
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
    setStatus('Đang phân tích cấu trúc dữ liệu...');

    // Simulate scanning process
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      setScannedCount(currentProgress * 10);
      setStatus(`Đang lấy danh sách phim... (${currentProgress}%)`);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setStatus('Hoàn tất quét dữ liệu!');
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
    setStatus('Đã dừng. Đang chuẩn bị file tải xuống...');
    setTimeout(() => {
      setIsScanModalOpen(false);
      alert(`Đã lưu tạm ${scannedCount} phim dưới dạng ${scanFormat.toUpperCase()}`);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-[#13141C]/90 dark:bg-[#13141C]/90 bg-white/85 z-[3000] backdrop-blur-[20px] flex items-center justify-center">
      <div className="bg-white dark:bg-[#252836] border border-black/5 dark:border-white/5 rounded-[40px] p-10 max-w-[500px] w-[90%] shadow-[0_20px_40px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] shadow-[0_20px_40px_rgba(18,38,63,0.05)] relative overflow-hidden">
        <h3 className="text-[1.8rem] font-black mb-3 text-black dark:text-white flex items-center gap-2"><Database size={28} className="fill-current" /> Quét Dữ Liệu</h3>
        
        {!isScanning ? (
          <div>
            <p className="text-[#808191] mb-8 text-[0.95rem]">Hệ thống sẽ quét toàn bộ danh sách phim từ trang 1 đến trang cuối để lấy thông tin. Vui lòng chọn định dạng lưu:</p>
            <div className="flex flex-col gap-4">
              <button className="bg-[#3B82F6] text-white border-none py-3.5 px-6 rounded-full text-[1.1rem] font-bold cursor-pointer transition-all w-full flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 hover:bg-[#2563EB]" onClick={() => startScan('json')}>
                <FileCode size={20} className="font-bold" /> Tải JSON
              </button>
              <button className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3.5 px-6 rounded-full text-[1.1rem] font-bold cursor-pointer transition-all w-full flex items-center justify-center gap-2 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10" onClick={() => startScan('csv')}>
                <FileSpreadsheet size={20} className="font-bold" /> Tải CSV
              </button>
              <button className="bg-transparent border-none py-3.5 px-6 rounded-full text-base font-bold cursor-pointer transition-all w-full text-[#808191] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={handleClose}>
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[#808191] mb-4 text-[0.9rem]">Vui lòng không đóng trình duyệt trong quá trình này.</p>
            <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-[#3B82F6] to-[#00D1F5] transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="text-[#00D1F5] font-bold mb-2 text-[0.9rem]">{status}</div>
            <div className="text-[#808191] text-[0.8rem] mb-8">Đã quét: {scannedCount} phim</div>
            
            <button className="bg-transparent border border-[#FF4757]/30 py-3.5 px-6 rounded-full text-base font-bold cursor-pointer transition-all w-full flex items-center justify-center gap-2 text-[#FF4757] hover:bg-[#FF4757]/10" onClick={stopScan}>
              <StopCircle size={20} className="font-bold" /> Dừng & Lưu Tạm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
