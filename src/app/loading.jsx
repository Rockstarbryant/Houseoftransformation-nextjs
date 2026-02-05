export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950 to-slate-950" />
      
      <div className="relative flex flex-col items-center gap-8">
        {/* Animated Logo Container */}
        <div className="relative w-64 h-64 md:w-48 md:h-48 animate-pulse">
          {/* Outer Ring Animation */}
          <div className="absolute inset-0 rounded-full border-2 border-red-600/30 animate-ping duration-[3000ms]" />
          
          <img 
            src="https://res.cloudinary.com/dcu8uuzrs/image/upload/v1768895135/church-gallery/jy2zygpn8zqqddq7aqjv.jpg" 
            alt="HOT Logo" 
            className="w-full h-full object-cover rounded-full border-4 border-[#8B1A1A] shadow-[0_0_50px_rgba(139,26,26,0.5)]"
          />
        </div>

        {/* Loading Text Animation */}
        <div className="flex flex-col items-center">
          <h2 className="text-white font-black tracking-[0.5em] text-xl uppercase">
            H.O.T
          </h2>
          <div className="h-1 w-12 bg-red-600 rounded-full mt-2 animate-bounce" />
        </div>
        {/* Text Fade-In */}
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <h2 className="text-white font-black text-2xl tracking-[0.3em] uppercase">BUSIA H.O.T</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Transforming Lives...</p>
        </div>
      </div>
    </div>
  );
}