import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-[#3B82F6]/20">
      
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700 w-full max-w-[800px]">
        
        {/* Custom 404 Typography */}
        <div className="flex items-center justify-center select-none w-full">
          <span className="text-[10rem] md:text-[16rem] font-bold leading-none bg-clip-text text-transparent bg-gradient-to-b from-[#2563EB] to-[#93C5FD] tracking-tighter drop-shadow-sm -mr-[1rem] md:-mr-[2.5rem] relative z-0">
            4
          </span>
          
          <div className="w-[8rem] h-[8rem] md:w-[13rem] md:h-[13rem] relative shrink-0 z-10 mt-4 md:mt-8">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
              <defs>
                <linearGradient id="iconGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#93C5FD" />
                </linearGradient>
              </defs>
              
              {/* Outer stroke ghost/bubble shape */}
              <path 
                d="M 28 32 A 36 36 0 1 1 30 83 C 25 85 20 92 18 95 C 20 85 20 70 20 65" 
                fill="none" 
                stroke="url(#iconGradient)" 
                strokeWidth="15" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              
              {/* Left eye */}
              <rect x="36" y="42" width="10" height="22" rx="5" fill="url(#iconGradient)" />
              {/* Right eye */}
              <rect x="54" y="42" width="10" height="22" rx="5" fill="url(#iconGradient)" />
            </svg>
          </div>
          
          <span className="text-[10rem] md:text-[16rem] font-bold leading-none bg-clip-text text-transparent bg-gradient-to-b from-[#2563EB] to-[#93C5FD] tracking-tighter drop-shadow-sm -ml-[1rem] md:-ml-[2.5rem] relative z-0">
            4
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-[#374151] font-medium text-[1.05rem] md:text-[1.2rem] mt-[-1rem] md:mt-[-2rem] mb-2 tracking-tight">
          Oops.. Something went wrong..
        </p>

        {/* Button */}
        <Link 
          href="/" 
          className="px-8 py-3 bg-[#3B82F6] text-white rounded-full font-medium text-[0.95rem] shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:bg-[#2563EB] hover:-translate-y-0.5 transition-all"
        >
          Back to Home
        </Link>
      </div>
    
    </div>
  );
}
