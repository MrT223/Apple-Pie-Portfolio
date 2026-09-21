"use client";

import React from "react";
import Image from "next/image";
import { AppleBlossoms, HeartApple } from "./AppleAnimations";

const JAPANESE_QUOTES = [
  "天上天下唯我独尊",
  "敵が次の手を予測できるなら、動かなければいい。",
  "おしっこをしても必ずうんちが出るわけじゃないが、うんちをする時は必ずおしっこが出る。",
];

export default function HeroSection() {
  const [quote, setQuote] = React.useState(JAPANESE_QUOTES[0]);

  React.useEffect(() => {
    const randomIndex = Math.floor(Math.random() * JAPANESE_QUOTES.length);
    setQuote(JAPANESE_QUOTES[randomIndex]);
  }, []);
  return (
    <section id="hero" className="relative min-h-[72vh] flex flex-col items-center justify-center overflow-hidden pt-12 pb-10">
      {/* Background pattern */}
      <div className="absolute inset-0 plaid-bg opacity-30" />

      {/* Apple blossoms */}
      <AppleBlossoms count={12} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md mx-auto animate-[fade-in-up_0.8s_ease-out_forwards]">
        {/* Apple avatar frame */}
        <div className="relative mb-6">
          {/* Gingham circle frame */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full gingham-bg p-1.5 shadow-xl animate-[pulse-gentle_3s_ease-in-out_infinite]">
            <div className="w-full h-full rounded-full bg-cream flex items-center justify-center overflow-hidden border-2 border-white relative">
              <Image src="/avt.jpg" alt="Artist Avatar" fill sizes="(max-width: 768px) 128px, 144px" className="object-cover" priority />
            </div>
          </div>

          {/* Decorative stickers */}
          <div className="absolute -top-2 -right-2 animate-[floating_4s_ease-in-out_infinite]">
            <HeartApple size={34} />
          </div>
          <div className="absolute -bottom-1 -left-3 text-2xl animate-[sway_3s_ease-in-out_infinite]">
            ⭐
          </div>
        </div>

        {/* Artist name */}
        <h1 className="font-[family-name:var(--font-family-display)] text-4xl sm:text-5xl text-apple-red text-shadow-cute mb-3">
          🍎 Apple Artist
        </h1>

        {/* Subtitle */}
        <div className="space-y-1 mb-6">
          <p className="text-base sm:text-lg text-[#4A2810] font-bold">
            ✿ Digital Illustrator ✿
          </p>
          <p className="text-sm text-[#4A2810]/70 font-medium min-h-[1.25rem] transition-opacity duration-300" suppressHydrationWarning>
            {quote}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-8">
          {["illustration", "OC / Character", "fanart", "chibi cute"].map((tag) => (
            <span
              key={tag}
              className="px-4 py-1.5 text-xs sm:text-sm font-bold rounded-full bg-apple-red-50 text-apple-red border border-apple-red/25 shadow-xs hover:bg-apple-red hover:text-white transition-colors duration-300 cursor-default"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/pricing"
          id="hero-cta"
          className="
            inline-flex items-center gap-3 px-8 py-3.5
            bg-apple-red text-white font-extrabold text-base rounded-full
            shadow-xl shadow-apple-red/30
            hover:bg-apple-red-dark hover:scale-105
            active:scale-95 transition-all duration-300
            cursor-pointer
          "
        >
          <span className="text-lg animate-[wobble_2s_ease-in-out_infinite]">🍎</span>
          <span>Xem Bảng Giá Commission</span>
        </a>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute -bottom-px left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 400 30" className="w-full block" preserveAspectRatio="none">
          <path
            d="M0 30 L0 15 Q50 0 100 15 Q150 30 200 15 Q250 0 300 15 Q350 30 400 15 L400 30Z"
            fill="#FFFDF9"
          />
        </svg>
      </div>
    </section>
  );
}
