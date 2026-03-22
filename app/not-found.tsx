import Link from 'next/link';
import { Home, MapPinOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F111A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      {/* Hiệu ứng Phép màu dưới nền */}
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-[#3B82F6] mix-blend-screen mix-blend-plus-lighter filter blur-[150px] opacity-20 animate-pulse rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#EC4899] mix-blend-screen mix-blend-plus-lighter filter blur-[120px] opacity-20 rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-[650px] animate-in slide-in-from-bottom-12 fade-in duration-1000">
        <div className="relative w-32 h-32 md:w-36 md:h-36 bg-gradient-to-br from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_20px_50px_rgba(139,92,246,0.3)] group overflow-hidden">
          <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <MapPinOff size={68} className="text-white fill-current/20 transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]"></div>
        </div>
        
        <h1 className="text-[7rem] md:text-[9rem] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#EC4899] drop-shadow-sm mb-2">
          404
        </h1>
        
        <h2 className="text-[1.8rem] md:text-[2.2rem] font-black text-black dark:text-white mb-5 tracking-tight">
          Oops! Lạc Lối Giữa Không Gian...
        </h2>
        
        <p className="text-[1.05rem] md:text-[1.15rem] text-[#808191] mb-12 leading-relaxed max-w-[500px]">
          Có vẻ như thước phim bạn đang tìm kiếm đã bị cuốn vào hố đen vũ trụ, hoặc địa chỉ này chưa từng tồn tại trên bản đồ của T-ANIME đó ạ! 🌌🎬
        </p>
        
        <Link 
          href="/" 
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#3B82F6] text-white rounded-[1.25rem] font-black text-[1.1rem] shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:bg-[#2563EB] hover:shadow-[0_15px_40px_rgba(59,130,246,0.5)] transition-all hover:-translate-y-1 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2"><Home size={22} className="group-hover:animate-bounce" /> Lên Tàu Quay Về Nhà</span>
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </Link>
      </div>
    </div>
  );
}
