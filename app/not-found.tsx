import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--terminal-bg)] flex flex-col items-center justify-center p-6 text-center font-mono selection:bg-[#7ef7c7]/25">

      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700 w-full max-w-[800px]">

        {/* Terminal 404 mark */}
        <div className="flex items-center justify-center select-none w-full">
          <span className="text-[10rem] md:text-[16rem] font-black leading-none text-[var(--terminal-green)] tracking-tight drop-shadow-[0_0_30px_rgba(126,247,199,0.25)] -mr-[1rem] md:-mr-[2.5rem] relative z-0">
            4
          </span>

          <div className="w-[8rem] h-[8rem] md:w-[13rem] md:h-[13rem] relative shrink-0 z-10 mt-4 md:mt-8">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_30px_rgba(126,247,199,0.25)]">
              <path
                d="M 28 32 A 36 36 0 1 1 30 83 C 25 85 20 92 18 95 C 20 85 20 70 20 65"
                fill="none"
                stroke="var(--terminal-green)"
                strokeWidth="15"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              <rect x="36" y="42" width="10" height="22" fill="var(--terminal-green)" />
              <rect x="54" y="42" width="10" height="22" fill="var(--terminal-green)" />
            </svg>
          </div>

          <span className="text-[10rem] md:text-[16rem] font-black leading-none text-[var(--terminal-green)] tracking-tight drop-shadow-[0_0_30px_rgba(126,247,199,0.25)] -ml-[1rem] md:-ml-[2.5rem] relative z-0">
            4
          </span>
        </div>

        <div className="flex items-center gap-3 text-[var(--terminal-muted)]">
          <TriangleAlert size={24} className="text-[var(--terminal-cyan)]" />
          <span className="text-sm font-medium">[ PAGE NOT FOUND ]</span>
        </div>

        <Link
          href="/"
          className="px-8 py-3 bg-[var(--terminal-panel)] border border-[var(--terminal-border-strong)] text-[var(--terminal-green)] rounded-[var(--terminal-radius)] font-black text-[0.95rem] shadow-[0_8px_24px_rgba(0,0,0,0.22)] hover:translate-y-[-2px] hover:border-[#7ef7c7]/60 hover:shadow-[0_0_28px_rgba(126,247,199,0.22)] transition-all uppercase tracking-widest"
        >
          [ BACK TO HOME ]
        </Link>
      </div>

    </div>
  );
}
