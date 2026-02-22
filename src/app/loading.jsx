// ⚡ PERFORMANCE FIX: No external image fetch during loading.
// The original loading.jsx fetched a Cloudinary image during the splash —
// this added an extra network round-trip on mobile BEFORE the page painted.
// Replaced with a pure CSS/inline SVG logo that renders instantly.

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950 to-slate-950" />
      
      <div className="relative flex flex-col items-center gap-8">
        {/* ⚡ Pure CSS Logo — no network request, instant render */}
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          {/* Outer ping ring */}
          <div className="absolute inset-0 rounded-full border-2 border-red-600/30 animate-ping" style={{ animationDuration: '3000ms' }} />
          
          {/* Logo circle — pure CSS, zero network cost */}
          <div className="w-full h-full rounded-full border-4 border-[#8B1A1A] bg-slate-900 shadow-[0_0_50px_rgba(139,26,26,0.5)] flex items-center justify-center animate-pulse">
            {/* Inline SVG cross icon — no external fetch */}
            <svg
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16"
              aria-hidden="true"
            >
              {/* Cross */}
              <rect x="35" y="10" width="10" height="60" rx="3" fill="#8B1A1A" />
              <rect x="15" y="28" width="50" height="10" rx="3" fill="#8B1A1A" />
              {/* Subtle glow layer */}
              <rect x="35" y="10" width="10" height="60" rx="3" fill="white" opacity="0.08" />
              <rect x="15" y="28" width="50" height="10" rx="3" fill="white" opacity="0.08" />
            </svg>
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center">
          <h2 className="text-white font-black tracking-[0.5em] text-xl uppercase">
            H.O.T
          </h2>
          <div className="h-1 w-12 bg-red-600 rounded-full mt-2 animate-bounce" />
        </div>

        {/* Subtitle */}
        <div className="mt-4 text-center">
          <h2 className="text-white font-black text-2xl tracking-[0.3em] uppercase">BUSIA H.O.T</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Transforming Lives...</p>
        </div>
      </div>
    </div>
  );
}