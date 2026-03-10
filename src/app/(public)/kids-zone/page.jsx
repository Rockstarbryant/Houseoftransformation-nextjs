import React from 'react';

export default function RecompensePoster() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse 100% 80% at 50% 20%, #2e1a72 0%, #1a0e45 35%, #0d0720 100%)',
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* Background radial ambient light */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse 70% 50% at 55% 25%, rgba(120,60,220,0.35) 0%, transparent 65%)',
        }}
      />

      {/* ── Numbers block ── */}
      <div className="relative flex flex-col items-start" style={{ marginLeft: '-2rem', marginTop: '-2rem' }}>

        {/* ── STARBURST / LENS FLARE (top-right of "20") ── */}
        <div
          className="absolute z-30 pointer-events-none"
          style={{ top: '-18px', right: '-48px' }}
        >
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Soft glow rings */}
            <circle cx="70" cy="70" r="50" fill="rgba(255,200,100,0.07)" />
            <circle cx="70" cy="70" r="30" fill="rgba(255,220,150,0.12)" />
            <circle cx="70" cy="70" r="14" fill="rgba(255,240,200,0.3)" />
            <circle cx="70" cy="70" r="6"  fill="white" />
            {/* Long cross rays */}
            <line x1="70" y1="0"   x2="70" y2="140" stroke="white" strokeWidth="0.8" opacity="0.7" />
            <line x1="0"  y1="70"  x2="140" y2="70" stroke="white" strokeWidth="0.8" opacity="0.7" />
            {/* Shorter diagonal rays */}
            <line x1="30" y1="30"  x2="110" y2="110" stroke="white" strokeWidth="0.4" opacity="0.4" />
            <line x1="110" y1="30" x2="30"  y2="110" stroke="white" strokeWidth="0.4" opacity="0.4" />
            {/* Extra faint rays */}
            <line x1="70" y1="20"  x2="70"  y2="0"   stroke="rgba(255,160,60,0.6)" strokeWidth="1.5" />
            <line x1="70" y1="120" x2="70"  y2="140" stroke="rgba(255,160,60,0.6)" strokeWidth="1.5" />
            <line x1="20" y1="70"  x2="0"   y2="70"  stroke="rgba(255,160,60,0.6)" strokeWidth="1.5" />
            <line x1="120" y1="70" x2="140" y2="70"  stroke="rgba(255,160,60,0.6)" strokeWidth="1.5" />
            {/* Orange hot core */}
            <circle cx="70" cy="70" r="3" fill="#ff9900" />
          </svg>
        </div>

        {/* ── "20" in gold gradient ── */}
        <div
          style={{
            fontSize: 'clamp(7rem, 18vw, 13rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            background: 'linear-gradient(180deg, #ffe86a 0%, #f5a623 45%, #c84a00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative',
            zIndex: 10,
            marginLeft: '1rem',
          }}
        >
          20
        </div>

        {/* ── Teal / cyan swoosh between "0" and "2" of 26 ── */}
        {/* Positioned so it curves from bottom-right of "20" down-left to top of "26" */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 'clamp(4.5rem, 11vw, 8rem)',
            left: 'clamp(3rem, 7vw, 6rem)',
            zIndex: 20,
          }}
        >
          <svg
            viewBox="0 0 110 130"
            style={{ width: 'clamp(80px, 14vw, 120px)', height: 'clamp(90px, 15vw, 130px)' }}
          >
            <path
              d="M 95 5 C 90 40, 50 50, 15 110"
              stroke="#00d4d4"
              strokeWidth="18"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* ── "26" in white, much larger, overlapping ── */}
        <div
          className="relative"
          style={{
            fontSize: 'clamp(10rem, 26vw, 19rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: 'white',
            marginTop: 'clamp(-4rem, -9vw, -7rem)',
            marginLeft: 'clamp(1.5rem, 3.5vw, 3rem)',
            zIndex: 5,
            textShadow: '0 8px 40px rgba(0,0,0,0.9)',
          }}
        >
          <span className="relative inline-block">
            2
            {/* ── Medal hangs from the "2" ── */}
            <div
              className="absolute flex flex-col items-center"
              style={{
                bottom: 'clamp(-3.5rem, -7vw, -5.5rem)',
                left: '30%',
                zIndex: 25,
              }}
            >
              {/* Striped ribbon */}
              <div
                style={{
                  width: 'clamp(18px, 3vw, 28px)',
                  height: 'clamp(55px, 10vw, 85px)',
                  background: 'repeating-linear-gradient(180deg,#e74c3c 0%,#e74c3c 33%,#f0f0f0 33%,#f0f0f0 66%,#3498db 66%,#3498db 100%)',
                  borderRadius: '0 0 3px 3px',
                  boxShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                  transform: 'rotate(-4deg)',
                }}
              />
              {/* Gold medal */}
              <div
                style={{
                  width: 'clamp(50px, 9vw, 80px)',
                  height: 'clamp(50px, 9vw, 80px)',
                  background: 'radial-gradient(circle at 35% 32%, #fff8c8 0%, #d4af37 45%, #8a6327 100%)',
                  borderRadius: '50%',
                  border: 'clamp(3px,0.7vw,6px) solid #f9e596',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.7), inset 0 2px 6px rgba(255,255,200,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '-6px',
                }}
              >
                {/* Inner ring */}
                <div
                  style={{
                    width: '65%',
                    height: '65%',
                    border: '1px solid rgba(241,196,15,0.5)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Laurel wreath SVG */}
                  <svg viewBox="0 0 40 40" style={{ width: '70%', height: '70%', opacity: 0.85 }}>
                    <path d="M8 20 Q5 14 8 8 Q11 14 8 20Z" fill="#8a6327" />
                    <path d="M12 16 Q9 10 12 4 Q15 10 12 16Z" fill="#8a6327" />
                    <path d="M32 20 Q35 14 32 8 Q29 14 32 20Z" fill="#8a6327" />
                    <path d="M28 16 Q31 10 28 4 Q25 10 28 16Z" fill="#8a6327" />
                    <circle cx="20" cy="20" r="4" fill="#8a6327" opacity="0.6" />
                  </svg>
                </div>
              </div>
            </div>
          </span>
          <span>6</span>
        </div>
      </div>

      {/* ── Text Section ── */}
      <div
        className="flex flex-col items-center text-center"
        style={{
          marginTop: 'clamp(4rem, 12vw, 9rem)',
          position: 'relative',
          zIndex: 10,
          width: '100%',
          paddingBottom: '2rem',
        }}
      >
        {/* "THE YEAR OF" with divider lines */}
        <div className="flex items-center gap-3 mb-1" style={{ width: '90%', justifyContent: 'center' }}>
          <div style={{ flex: 1, maxWidth: '90px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4))' }} />
          <p
            style={{
              color: 'white',
              letterSpacing: '0.4em',
              fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
              fontWeight: 600,
              fontFamily: 'sans-serif',
            }}
          >
            THE YEAR OF
          </p>
          <div style={{ flex: 1, maxWidth: '90px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.4))' }} />
        </div>

        {/* "RECOMPENSE" — Gold gradient */}
        <h1
          style={{
            fontSize: 'clamp(2.8rem, 8vw, 6rem)',
            fontWeight: 900,
            background: 'linear-gradient(180deg, #ffe240 0%, #d4a017 55%, #8a5c10 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            lineHeight: 1,
            margin: 0,
          }}
        >
          Recompense
        </h1>

        {/* "(JEHOVAH GMOLAH)" */}
        <h2
          style={{
            color: 'white',
            fontSize: 'clamp(1rem, 3vw, 2rem)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            marginTop: '0.25rem',
            fontFamily: 'sans-serif',
          }}
        >
          (JEHOVAH GMOLAH)
        </h2>

        {/* Scripture badge */}
        <div
          style={{
            marginTop: 'clamp(0.8rem, 2vw, 1.5rem)',
            background: 'linear-gradient(90deg, #00c8c8 0%, #009a9a 100%)',
            padding: '6px 32px',
            borderRadius: '4px',
            borderBottom: '3px solid #006060',
            boxShadow: '0 4px 14px rgba(0,200,200,0.3)',
          }}
        >
          <p
            style={{
              color: 'white',
              fontWeight: 900,
              letterSpacing: '0.22em',
              fontSize: 'clamp(0.85rem, 2vw, 1.2rem)',
              fontFamily: 'sans-serif',
              margin: 0,
            }}
          >
            JEREMIAH 51:56
          </p>
        </div>
      </div>

      {/* ── Police / officer hat (bottom right) ── */}
      <div
        className="absolute pointer-events-none"
        style={{ bottom: 0, right: 0, opacity: 0.92 }}
      >
        <svg viewBox="0 0 120 140" width="110" height="130">
          {/* Hat brim */}
          <ellipse cx="60" cy="105" rx="55" ry="14" fill="#1a1a2e" />
          {/* Hat body */}
          <rect x="20" y="40" width="80" height="68" rx="6" fill="#1a1a2e" />
          {/* Hat top */}
          <ellipse cx="60" cy="40" rx="40" ry="10" fill="#111122" />
          {/* Band */}
          <rect x="20" y="88" width="80" height="14" fill="#0f0f1f" />
          {/* Badge */}
          <polygon points="60,72 65,82 76,82 67,89 70,100 60,93 50,100 53,89 44,82 55,82" fill="#d4af37" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}