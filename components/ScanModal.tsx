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

 // Simulate scanning process
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
 setStatus('[ ĐÃ DỪNG. ĐANG CHUẨN BỊ FILE TẢI XUỐNG... ]');
 setTimeout(() => {
 setIsScanModalOpen(false);
 alert(`Đã lưu tạm ${scannedCount} phim dưới dạng ${scanFormat.toUpperCase()}`);
 }, 1000);
 };

 return (
 <div className="fixed inset-0 bg-[#311B56]/80 z-[3000] backdrop-blur-sm flex items-center justify-center p-4">
 <div className="bg-[#FAF8F5] border-4 border-[#311B56] rounded-none p-10 max-w-[500px] w-[90%] shadow-[12px_12px_0px_#311B56] relative overflow-hidden">
 <h3 className="text-[1.8rem] font-black font-mono tracking-widest uppercase mb-6 text-[#311B56] flex items-center gap-3">
 <Database size={28} className="fill-current" /> [ QUÉT DỮ LIỆU ]
 </h3>
 
 {!isScanning ? (
 <div>
 <p className="text-[#311B56]/80 font-mono font-bold mb-8 text-[0.95rem] leading-relaxed">[ Hệ thống sẽ quét toàn bộ danh sách phim từ trang 1 đến trang cuối để lấy thông tin. Vui lòng chọn định dạng lưu: ]</p>
 <div className="flex flex-col gap-4">
 <button className="bg-[#311B56] text-[#FAF8F5] border-2 border-[#311B56] py-3.5 px-6 rounded-none text-[1.1rem] font-black font-mono tracking-widest uppercase cursor-pointer transition-all w-full flex items-center justify-center gap-2 shadow-[4px_4px_0px_#311B56] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#311B56] hover:bg-[#FAF8F5] hover:text-[#311B56]" onClick={() => startScan('json')}>
 <FileCode size={20} className="font-bold" /> [ TẢI JSON ]
 </button>
 <button className="bg-[#FAF8F5] text-[#311B56] border-2 border-[#311B56] py-3.5 px-6 rounded-none text-[1.1rem] font-black font-mono tracking-widest uppercase cursor-pointer transition-all w-full flex items-center justify-center gap-2 shadow-[4px_4px_0px_#311B56] hover:bg-[#311B56] hover:text-[#FAF8F5] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#311B56]" onClick={() => startScan('csv')}>
 <FileSpreadsheet size={20} className="font-bold" /> [ TẢI CSV ]
 </button>
 <button className="bg-transparent border-none py-3.5 px-6 rounded-none text-base font-bold font-mono tracking-widest uppercase cursor-pointer transition-all w-full text-[#311B56]/60 hover:text-[#311B56] hover:bg-[#311B56]/5" onClick={handleClose}>
 [ HỦY ]
 </button>
 </div>
 </div>
 ) : (
 <div>
 <p className="text-[#311B56]/80 font-mono font-bold mb-4 text-[0.9rem]">[ Vui lòng không đóng trình duyệt trong quá trình này. ]</p>
 <div className="w-full h-4 bg-[#FAF8F5] border-2 border-[#311B56] rounded-none mb-6 relative">
 <div className="h-full bg-[#311B56] transition-all duration-300 relative" style={{ width: `${progress}%` }}>
 <div className="absolute inset-0 w-full h-full opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #FAF8F5 10px, #FAF8F5 20px)' }}></div>
 </div>
 </div>
 <div className="text-[#311B56] font-black font-mono uppercase tracking-widest mb-2 text-[0.9rem]">{status}</div>
 <div className="text-[#311B56]/80 font-mono font-bold text-[0.8rem] mb-8">[ ĐÃ QUÉT: {scannedCount} PHIM ]</div>
 
 <button className="bg-[#FAF8F5] border-2 border-[#311B56] py-3.5 px-6 rounded-none text-base font-black font-mono tracking-widest uppercase cursor-pointer transition-all w-full flex items-center justify-center gap-2 text-[#311B56] shadow-[4px_4px_0px_#311B56] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#311B56] hover:bg-[#311B56] hover:text-[#FAF8F5]" onClick={stopScan}>
 <StopCircle size={20} className="font-bold" /> [ DỪNG & LƯU TẠM ]
 </button>
 </div>
 )}
 </div>
 </div>
 );
};
