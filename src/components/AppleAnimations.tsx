"use client";

import React, { useEffect, useState } from "react";

/* ============================================
   🍎 FALLING APPLES — Background rain effect
   ============================================ */
export function FallingApples({ count = 12 }: { count?: number }) {
  const [apples, setApples] = useState<
    { id: number; left: number; delay: number; duration: number; size: number; type: number }[]
  >([]);

  useEffect(() => {
    setApples(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 8,
        size: 16 + Math.random() * 20,
        type: Math.floor(Math.random() * 3), // 0=red, 1=green, 2=bitten
      }))
    );
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {apples.map((a) => (
        <svg
          key={a.id}
          className="absolute opacity-30"
          style={{
            left: `${a.left}%`,
            top: "-40px",
            width: a.size,
            height: a.size,
            animation: `falling ${a.duration}s linear ${a.delay}s infinite`,
          }}
          viewBox="0 0 100 100"
          fill="none"
        >
          {a.type === 0 && <AppleSVG color="#C0392B" />}
          {a.type === 1 && <AppleSVG color="#7D9B4E" />}
          {a.type === 2 && <BittenAppleSVG />}
        </svg>
      ))}
    </div>
  );
}

/* ============================================
   🍏 APPLE SVG — Basic apple shape
   ============================================ */
function AppleSVG({ color = "#C0392B" }: { color?: string }) {
  return (
    <>
      <path
        d="M50 15 C50 15, 55 5, 60 8 C65 11, 55 18, 50 15Z"
        fill="#5A7236"
      />
      <path
        d="M50 20 C30 18, 8 35, 10 60 C12 80, 30 95, 50 95 C70 95, 88 80, 90 60 C92 35, 70 18, 50 20Z"
        fill={color}
      />
      <ellipse cx="35" cy="45" rx="8" ry="12" fill="white" opacity="0.15" />
    </>
  );
}

/* ============================================
   🍎 BITTEN APPLE SVG
   ============================================ */
function BittenAppleSVG() {
  return (
    <>
      <path
        d="M50 15 C50 15, 55 5, 60 8 C65 11, 55 18, 50 15Z"
        fill="#5A7236"
      />
      <path
        d="M50 20 C30 18, 8 35, 10 60 C12 80, 30 95, 50 95 C70 95, 88 80, 90 60 C92 45, 85 35, 78 30 C72 27, 68 32, 72 40 C76 48, 80 42, 78 38 C88 35, 70 18, 50 20Z"
        fill="#C0392B"
      />
      <path
        d="M78 30 C72 27, 68 32, 72 40 C76 48, 80 42, 78 38"
        fill="#FFF8E7"
      />
    </>
  );
}

/* ============================================
   🌸 APPLE BLOSSOMS — Petal particles
   ============================================ */
export function AppleBlossoms({ count = 15 }: { count?: number }) {
  const [petals, setPetals] = useState<
    { id: number; left: number; delay: number; duration: number; size: number; rotation: number }[]
  >([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 8 + Math.random() * 6,
        size: 12 + Math.random() * 16,
        rotation: Math.random() * 360,
      }))
    );
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {petals.map((p) => (
        <svg
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-30px",
            width: p.size,
            height: p.size,
            animation: `blossom-fall ${p.duration}s linear ${p.delay}s infinite`,
            transform: `rotate(${p.rotation}deg)`,
          }}
          viewBox="0 0 40 40"
        >
          <ellipse cx="20" cy="15" rx="8" ry="14" fill="#FFB7C5" opacity="0.7" />
          <ellipse cx="14" cy="22" rx="8" ry="12" fill="#FFC1D0" opacity="0.6" transform="rotate(-30 14 22)" />
          <ellipse cx="26" cy="22" rx="8" ry="12" fill="#FFAABB" opacity="0.5" transform="rotate(30 26 22)" />
          <circle cx="20" cy="20" r="3" fill="#FFD700" opacity="0.8" />
        </svg>
      ))}
    </div>
  );
}

/* ============================================
   🍃 FLOATING LEAVES
   ============================================ */
export function FloatingLeaves({ count = 8 }: { count?: number }) {
  const [leaves, setLeaves] = useState<
    { id: number; left: number; delay: number; duration: number; size: number }[]
  >([]);

  useEffect(() => {
    setLeaves(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 10 + Math.random() * 8,
        size: 18 + Math.random() * 14,
      }))
    );
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {leaves.map((l) => (
        <svg
          key={l.id}
          className="absolute opacity-25"
          style={{
            left: `${l.left}%`,
            top: "-30px",
            width: l.size,
            height: l.size,
            animation: `blossom-fall ${l.duration}s linear ${l.delay}s infinite`,
          }}
          viewBox="0 0 60 60"
        >
          <path
            d="M30 5 C15 15, 5 30, 10 45 C15 55, 25 58, 30 55 C35 58, 45 55, 50 45 C55 30, 45 15, 30 5Z"
            fill="#7D9B4E"
            opacity="0.8"
          />
          <path d="M30 10 L30 50" stroke="#5A7236" strokeWidth="1.5" opacity="0.5" />
          <path d="M30 20 L20 30" stroke="#5A7236" strokeWidth="1" opacity="0.4" />
          <path d="M30 25 L40 35" stroke="#5A7236" strokeWidth="1" opacity="0.4" />
          <path d="M30 35 L22 42" stroke="#5A7236" strokeWidth="1" opacity="0.4" />
        </svg>
      ))}
    </div>
  );
}

/* ============================================
   ⭐ STAR SPARKLES — Hover decoration
   ============================================ */
export function StarSparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {[
        { top: "10%", left: "15%", delay: "0s", size: 14 },
        { top: "20%", left: "80%", delay: "0.3s", size: 10 },
        { top: "60%", left: "10%", delay: "0.6s", size: 12 },
        { top: "75%", left: "85%", delay: "0.9s", size: 8 },
        { top: "40%", left: "50%", delay: "1.2s", size: 16 },
      ].map((s, i) => (
        <svg
          key={i}
          className="absolute"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animation: `sparkle 1.5s ease-in-out ${s.delay} infinite`,
          }}
          viewBox="0 0 24 24"
        >
          <path
            d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5Z"
            fill="#E8A0A0"
          />
        </svg>
      ))}
    </div>
  );
}

/* ============================================
   🔪 APPLE SPLIT — Section Divider
   ============================================ */
export function AppleSplit({ animate = false }: { animate?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 py-6" aria-hidden="true">
      {/* Left half */}
      <svg
        className={animate ? "animate-[split-left_0.8s_ease-out_forwards]" : ""}
        width="40"
        height="48"
        viewBox="0 0 50 60"
      >
        <path
          d="M48 10 C48 10, 50 3, 48 5 M48 12 C35 10, 5 22, 8 40 C10 52, 28 58, 48 58 L48 12Z"
          fill="#C0392B"
        />
        <path
          d="M48 12 L48 58"
          stroke="#FFF8E7"
          strokeWidth="2"
        />
        <ellipse cx="40" cy="35" rx="4" ry="6" fill="#FFF8E7" opacity="0.6" />
        <circle cx="42" cy="38" r="2" fill="#8B4513" opacity="0.5" />
        <circle cx="44" cy="42" r="1.5" fill="#8B4513" opacity="0.4" />
      </svg>

      {/* Sparkle divider */}
      <div className="flex items-center gap-2 px-3">
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-apple-red opacity-30" />
        <svg width="12" height="12" viewBox="0 0 24 24" className="animate-sparkle">
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5Z" fill="#E8A0A0" />
        </svg>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-apple-red opacity-30" />
      </div>

      {/* Right half */}
      <svg
        className={animate ? "animate-[split-right_0.8s_ease-out_forwards]" : ""}
        width="40"
        height="48"
        viewBox="0 0 50 60"
      >
        <path
          d="M2 10 C2 10, 0 3, 2 5 M2 12 C15 10, 45 22, 42 40 C40 52, 22 58, 2 58 L2 12Z"
          fill="#C0392B"
        />
        <path
          d="M2 12 L2 58"
          stroke="#FFF8E7"
          strokeWidth="2"
        />
        <ellipse cx="12" cy="35" rx="4" ry="6" fill="#FFF8E7" opacity="0.6" />
        <circle cx="10" cy="38" r="2" fill="#8B4513" opacity="0.5" />
        <circle cx="8" cy="42" r="1.5" fill="#8B4513" opacity="0.4" />
      </svg>
    </div>
  );
}

/* ============================================
   🍎 APPLE BITE LOADER — Loading animation
   ============================================ */
export function AppleBiteLoader({ size = 60 }: { size?: number }) {
  return (
    <div
      className="animate-bite"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <path
          d="M50 15 C50 15, 55 5, 60 8 C65 11, 55 18, 50 15Z"
          fill="#5A7236"
        />
        <path
          d="M50 20 C30 18, 8 35, 10 60 C12 80, 30 95, 50 95 C70 95, 88 80, 90 60 C92 35, 70 18, 50 20Z"
          fill="#C0392B"
        />
        <ellipse cx="35" cy="45" rx="8" ry="12" fill="white" opacity="0.15" />
      </svg>
    </div>
  );
}

/* ============================================
   🍎 APPLE PEEL — Scroll decoration
   ============================================ */
export function ApplePeel({ animate = false }: { animate?: boolean }) {
  return (
    <svg
      width="60"
      height="200"
      viewBox="0 0 60 200"
      className={`${animate ? "animate-[peel-draw_3s_ease-in-out_forwards]" : ""}`}
      aria-hidden="true"
    >
      <path
        d="M30 10 C35 30, 45 40, 40 60 C35 80, 20 90, 25 110 C30 130, 45 140, 40 160 C35 180, 25 190, 30 195"
        fill="none"
        stroke="#C0392B"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1000"
        strokeDashoffset={animate ? undefined : "0"}
        style={{
          filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.1))",
        }}
      />
      {/* Peel thickness effect */}
      <path
        d="M30 10 C35 30, 45 40, 40 60 C35 80, 20 90, 25 110 C30 130, 45 140, 40 160 C35 180, 25 190, 30 195"
        fill="none"
        stroke="#FFF8E7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1000"
        strokeDashoffset={animate ? undefined : "0"}
        opacity="0.5"
      />
    </svg>
  );
}

/* ============================================
   🍎 WOBBLE APPLE — Interactive hover icon
   ============================================ */
export function WobbleApple({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`hover:animate-wobble cursor-pointer transition-transform ${className}`}
    >
      <AppleSVG color="#C0392B" />
    </svg>
  );
}

/* ============================================
   ❤️ HEART APPLE — Like animation
   ============================================ */
export function HeartApple({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="animate-[heart-beat_1.5s_ease-in-out_infinite]"
    >
      {/* Apple body */}
      <path
        d="M50 25 C30 23, 8 38, 10 60 C12 78, 30 90, 50 90 C70 90, 88 78, 90 60 C92 38, 70 23, 50 25Z"
        fill="#C0392B"
      />
      {/* Heart cutout */}
      <path
        d="M50 40 C50 35, 42 30, 38 35 C34 40, 38 48, 50 58 C62 48, 66 40, 62 35 C58 30, 50 35, 50 40Z"
        fill="#FFF8E7"
      />
      {/* Stem */}
      <path
        d="M50 20 C50 20, 55 10, 58 13 C61 16, 55 22, 50 20Z"
        fill="#5A7236"
      />
    </svg>
  );
}

/* ============================================
   🌟 DECORATIVE STARS — Scattered decoration
   ============================================ */
export function DecorativeStars({ count = 6 }: { count?: number }) {
  const [stars, setStars] = useState<
    { id: number; top: number; left: number; size: number; delay: number; opacity: number }[]
  >([]);

  useEffect(() => {
    setStars(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 8 + Math.random() * 12,
        delay: Math.random() * 3,
        opacity: 0.2 + Math.random() * 0.3,
      }))
    );
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {stars.map((s) => (
        <svg
          key={s.id}
          className="absolute"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `sparkle 2.5s ease-in-out ${s.delay}s infinite`,
          }}
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2 L14 9 L21 9 L15.5 13.5 L17.5 21 L12 16.5 L6.5 21 L8.5 13.5 L3 9 L10 9Z"
            fill="#E8A0A0"
          />
        </svg>
      ))}
    </div>
  );
}

/* ============================================
   🎀 RIBBON BANNER — Section title decoration
   ============================================ */
export function RibbonBanner({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Ribbon body */}
      <div className="relative bg-apple-red text-white px-8 py-2 font-bold font-[family-name:var(--font-family-display)] text-lg origin-left animate-[ribbon-unfurl_1s_ease-out_forwards]">
        {children}
        {/* Ribbon fold left */}
        <div className="absolute -left-2 top-0 w-0 h-0 border-t-[16px] border-t-apple-red-dark border-l-[8px] border-l-transparent" />
        <div className="absolute -left-2 bottom-0 w-0 h-0 border-b-[16px] border-b-apple-red-dark border-l-[8px] border-l-transparent" />
        {/* Ribbon fold right */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-l-[12px] border-l-apple-red" />
      </div>
    </div>
  );
}

/* ============================================
   ⭐ ROTATING WHITE STARS — Background ambient decoration
   ============================================ */
export function RotatingStars() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const stars = [
    // Band 1: Top Header & Corners (top: 2% - 14%)
    { id: 1, left: "5%", top: "3%", size: 26, spinDuration: 14, floatDuration: 5.5, floatDelay: 0, dir: "cw", type: 0, opacity: 1 },
    { id: 2, left: "22%", top: "5%", size: 18, spinDuration: 18, floatDuration: 6.2, floatDelay: 1.2, dir: "ccw", type: 2, opacity: 0.95 },
    { id: 3, left: "38%", top: "2%", size: 22, spinDuration: 16, floatDuration: 5.0, floatDelay: 0.8, dir: "cw", type: 1, opacity: 0.95 },
    { id: 4, right: "38%", top: "3%", size: 20, spinDuration: 15, floatDuration: 5.8, floatDelay: 2.1, dir: "ccw", type: 0, opacity: 1 },
    { id: 5, right: "22%", top: "6%", size: 18, spinDuration: 19, floatDuration: 6.5, floatDelay: 1.5, dir: "cw", type: 2, opacity: 0.95 },
    { id: 6, right: "5%", top: "4%", size: 28, spinDuration: 13, floatDuration: 5.2, floatDelay: 0.5, dir: "ccw", type: 1, opacity: 1 },
    { id: 7, left: "12%", top: "10%", size: 22, spinDuration: 17, floatDuration: 5.6, floatDelay: 1.7, dir: "cw", type: 0, opacity: 0.95 },
    { id: 8, right: "12%", top: "11%", size: 24, spinDuration: 21, floatDuration: 6.0, floatDelay: 0.9, dir: "ccw", type: 0, opacity: 1 },

    // Band 2: Beside Avatar (top: 15% - 30%)
    { id: 9, left: "4%", top: "17%", size: 30, spinDuration: 20, floatDuration: 6.4, floatDelay: 0.6, dir: "cw", type: 1, opacity: 1 },
    { id: 10, left: "18%", top: "20%", size: 20, spinDuration: 12, floatDuration: 5.1, floatDelay: 1.4, dir: "ccw", type: 2, opacity: 0.95 },
    { id: 11, right: "18%", top: "19%", size: 22, spinDuration: 16, floatDuration: 5.7, floatDelay: 2.3, dir: "cw", type: 0, opacity: 0.95 },
    { id: 12, right: "4%", top: "18%", size: 28, spinDuration: 22, floatDuration: 6.8, floatDelay: 1.1, dir: "ccw", type: 1, opacity: 1 },
    { id: 13, left: "8%", top: "26%", size: 24, spinDuration: 15, floatDuration: 5.3, floatDelay: 0.4, dir: "cw", type: 0, opacity: 0.95 },
    { id: 14, right: "8%", top: "27%", size: 26, spinDuration: 14, floatDuration: 5.9, floatDelay: 1.8, dir: "ccw", type: 2, opacity: 0.95 },

    // Band 3: Beside Artist Title & Subtitle (top: 31% - 48%)
    { id: 15, left: "4%", top: "34%", size: 28, spinDuration: 18, floatDuration: 6.1, floatDelay: 0.7, dir: "ccw", type: 1, opacity: 1 },
    { id: 16, left: "15%", top: "38%", size: 18, spinDuration: 13, floatDuration: 5.4, floatDelay: 2.0, dir: "cw", type: 0, opacity: 0.9 },
    { id: 17, right: "15%", top: "36%", size: 20, spinDuration: 17, floatDuration: 5.8, floatDelay: 1.3, dir: "ccw", type: 2, opacity: 0.95 },
    { id: 18, right: "4%", top: "35%", size: 30, spinDuration: 23, floatDuration: 6.6, floatDelay: 0.2, dir: "cw", type: 0, opacity: 1 },
    { id: 19, left: "7%", top: "44%", size: 22, spinDuration: 16, floatDuration: 5.5, floatDelay: 1.9, dir: "ccw", type: 2, opacity: 0.95 },
    { id: 20, right: "7%", top: "45%", size: 24, spinDuration: 19, floatDuration: 6.3, floatDelay: 0.5, dir: "cw", type: 1, opacity: 0.95 },

    // Band 4: Beside Japanese Quote & Tags (top: 49% - 66%)
    { id: 21, left: "4%", top: "52%", size: 30, spinDuration: 15, floatDuration: 5.2, floatDelay: 1.0, dir: "cw", type: 0, opacity: 1 },
    { id: 22, left: "16%", top: "56%", size: 20, spinDuration: 21, floatDuration: 6.5, floatDelay: 2.4, dir: "ccw", type: 1, opacity: 0.95 },
    { id: 23, right: "16%", top: "54%", size: 18, spinDuration: 14, floatDuration: 5.0, floatDelay: 0.8, dir: "cw", type: 0, opacity: 0.95 },
    { id: 24, right: "4%", top: "53%", size: 28, spinDuration: 20, floatDuration: 6.7, floatDelay: 1.6, dir: "ccw", type: 2, opacity: 1 },
    { id: 25, left: "8%", top: "62%", size: 24, spinDuration: 17, floatDuration: 5.6, floatDelay: 0.3, dir: "cw", type: 2, opacity: 0.95 },
    { id: 26, right: "8%", top: "63%", size: 26, spinDuration: 13, floatDuration: 6.2, floatDelay: 1.5, dir: "ccw", type: 1, opacity: 0.95 },

    // Band 5: Beside CTA Button (top: 67% - 80%)
    { id: 27, left: "4%", top: "70%", size: 28, spinDuration: 22, floatDuration: 6.0, floatDelay: 2.2, dir: "ccw", type: 1, opacity: 1 },
    { id: 28, left: "17%", top: "73%", size: 20, spinDuration: 16, floatDuration: 5.3, floatDelay: 0.7, dir: "cw", type: 0, opacity: 0.95 },
    { id: 29, right: "17%", top: "72%", size: 22, spinDuration: 18, floatDuration: 5.7, floatDelay: 1.7, dir: "ccw", type: 2, opacity: 0.95 },
    { id: 30, right: "4%", top: "71%", size: 30, spinDuration: 14, floatDuration: 6.4, floatDelay: 0.4, dir: "cw", type: 0, opacity: 1 },
    { id: 31, left: "9%", top: "79%", size: 24, spinDuration: 19, floatDuration: 5.8, floatDelay: 1.3, dir: "cw", type: 0, opacity: 0.95 },
    { id: 32, right: "9%", top: "78%", size: 26, spinDuration: 15, floatDuration: 6.1, floatDelay: 2.0, dir: "ccw", type: 1, opacity: 0.95 },

    // Band 6: Lower Area Above Wave (top: 81% - 89%)
    { id: 33, left: "6%", top: "85%", size: 26, spinDuration: 17, floatDuration: 5.5, floatDelay: 0.9, dir: "ccw", type: 2, opacity: 0.95 },
    { id: 34, left: "22%", top: "87%", size: 20, spinDuration: 13, floatDuration: 5.9, floatDelay: 1.8, dir: "cw", type: 0, opacity: 0.9 },
    { id: 35, right: "22%", top: "86%", size: 22, spinDuration: 16, floatDuration: 5.4, floatDelay: 0.6, dir: "ccw", type: 1, opacity: 0.95 },
    { id: 36, right: "6%", top: "85%", size: 28, spinDuration: 20, floatDuration: 6.3, floatDelay: 1.5, dir: "cw", type: 0, opacity: 1 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute"
          style={{
            left: s.left,
            right: s.right,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `star-float ${s.floatDuration}s ease-in-out ${s.floatDelay}s infinite`,
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              animation: `${s.dir === "cw" ? "spin-slow" : "spin-reverse"} ${s.spinDuration}s linear infinite`,
              filter:
                "drop-shadow(0 2px 8px rgba(192, 57, 43, 0.16)) drop-shadow(0 1px 3px rgba(74, 40, 16, 0.12)) drop-shadow(0 0 6px rgba(255, 255, 255, 0.95))",
            }}
          >
            {s.type === 0 && <StarFourPoint />}
            {s.type === 1 && <StarEightPoint />}
            {s.type === 2 && <StarFivePoint />}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ✦ 4-pointed curved anime twinkle star */
function StarFourPoint() {
  return (
    <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
      <path
        d="M30 3 C30 18, 42 30, 57 30 C42 30, 30 42, 30 57 C30 42, 18 30, 3 30 C18 30, 30 18, 30 3 Z"
        fill="#FFFFFF"
        stroke="rgba(180, 140, 115, 0.45)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="30" r="2.5" fill="#F8B4B4" />
    </svg>
  );
}

/* ✦ 8-pointed radiant sparkle star */
function StarEightPoint() {
  return (
    <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
      {/* 4 diagonal secondary points */}
      <path
        d="M30 13 C30 23, 37 30, 47 30 C37 30, 30 37, 30 47 C30 37, 23 30, 13 30 C23 30, 30 23, 30 13 Z"
        transform="rotate(45 30 30)"
        fill="#FFFFFF"
        opacity="0.95"
        stroke="rgba(180, 140, 115, 0.4)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* 4 main cardinal points */}
      <path
        d="M30 3 C30 18, 42 30, 57 30 C42 30, 30 42, 30 57 C30 42, 18 30, 3 30 C18 30, 30 18, 30 3 Z"
        fill="#FFFFFF"
        stroke="rgba(180, 140, 115, 0.5)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="30" r="2.5" fill="#F8B4B4" />
    </svg>
  );
}

/* ★ Cute kawaii 5-pointed star */
function StarFivePoint() {
  return (
    <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
      <path
        d="M30 5 L36.5 21.1 L53.8 22.3 L40.5 33.4 L44.7 50.2 L30 41 L15.3 50.2 L19.5 33.4 L6.2 22.3 L23.5 21.1 Z"
        fill="#FFFFFF"
        stroke="rgba(180, 140, 115, 0.45)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <ellipse cx="27" cy="24" rx="2.5" ry="3.5" fill="#F8B4B4" opacity="0.6" />
    </svg>
  );
}
