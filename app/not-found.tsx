import Link from 'next/link';

export default function NotFound() {
 return (
 <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center font-mono selection:bg-[#311B56]/20">
 
 <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700 w-full max-w-[800px]">
 
 {/* Custom 404 Typography */}
 <div className="flex items-center justify-center select-none w-full">
 <span className="text-[10rem] md:text-[16rem] font-black leading-none text-[#311B56] tracking-tighter drop-shadow-[4px_4px_0px_rgba(49,27,86,0.3)] -mr-[1rem] md:-mr-[2.5rem] relative z-0">
 4
 </span>
 
 <div className="w-[8rem] h-[8rem] md:w-[13rem] md:h-[13rem] relative shrink-0 z-10 mt-4 md:mt-8">
 <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[4px_4px_0px_rgba(49,27,86,0.3)]">
 {/* Outer stroke ghost/bubble shape */}
 <path 
 d="M 28 32 A 36 36 0 1 1 30 83 C 25 85 20 92 18 95 C 20 85 20 70 20 65" 
 fill="none" 
 stroke="#311B56" 
 strokeWidth="15" 
 strokeLinecap="square" 
 strokeLinejoin="miter" 
 />
 
 {/* Left eye */}
 <rect x="36" y="42" width="10" height="22" fill="#311B56" />
 {/* Right eye */}
 <rect x="54" y="42" width="10" height="22" fill="#311B56" />
 </svg>
 </div>
 
 <span className="text-[10rem] md:text-[16rem] font-black leading-none text-[#311B56] tracking-tighter drop-shadow-[4px_4px_0px_rgba(49,27,86,0.3)] -ml-[1rem] md:-ml-[2.5rem] relative z-0">
 4
 </span>
 </div>

 {/* Subtitle */}
 <p className="text-[#311B56] font-bold text-[1.05rem] md:text-[1.2rem] mt-[-1rem] md:mt-[-2rem] mb-2 tracking-widest uppercase">
 [ PAGE NOT FOUND ]
 </p>

 {/* Button */}
 <Link 
 href="/" 
 className="px-8 py-3 bg-[#FAF8F5] text-[#311B56] border-2 border-[#311B56] rounded-none font-bold text-[0.95rem] shadow-[4px_4px_0px_#311B56] hover:shadow-[6px_6px_0px_#311B56] hover:bg-[#311B56] hover:text-[#FAF8F5] hover:-translate-y-1 hover:-translate-x-1 transition-all uppercase tracking-widest"
 >
 [ BACK TO HOME ]
 </Link>
 </div>
 
 </div>
 );
}
