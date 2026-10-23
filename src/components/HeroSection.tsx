"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppleBlossoms, HeartApple, RotatingStars } from "./AppleAnimations";
import AdminPasswordModal from "./AdminPasswordModal";

const JAPANESE_QUOTES = [
  "天上天下唯我独尊",
  "敵が次の手を予測できるなら、動かなければいい。",
  "おしっこをしても必ずうんちが出るわけじゃないが、うんちをする時は必ずおしっこが出る。",
];

// Secret sequence to trigger admin mode
// Order: #OC / Character -> #fanart -> #illustration -> #chibi cute
const SECRET_SEQUENCE = [
  "OC / Character",
  "fanart",
  "illustration",
  "chibi cute",
];

export default function HeroSection() {
  const router = useRouter();
  const [quote, setQuote] = useState(JAPANESE_QUOTES[0]);

  // Secret admin trigger state
  const [seqStep, setSeqStep] = useState(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Admin Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * JAPANESE_QUOTES.length);
    setQuote(JAPANESE_QUOTES[randomIndex]);
  }, []);

  const handleTagClick = (tag: string) => {
    // Clear existing timer
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    // Set 8-second reset timer in case clicks are interrupted
    resetTimerRef.current = setTimeout(() => {
      setSeqStep(0);
    }, 8000);

    const expectedTag = SECRET_SEQUENCE[seqStep];

    if (tag === expectedTag) {
      const nextStep = seqStep + 1;
      if (nextStep === SECRET_SEQUENCE.length) {
        // Correct sequence completed!
        setSeqStep(0);
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

        // If already authenticated in this browser session, go straight to /admin
        if (typeof window !== "undefined" && sessionStorage.getItem("apple_admin_token")) {
          router.push("/admin");
          return;
        }

        // Otherwise open password prompt
        setIsPasswordModalOpen(true);
      } else {
        setSeqStep(nextStep);
      }
    } else if (tag === SECRET_SEQUENCE[0]) {
      // If clicked the first tag in sequence, restart at step 1
      setSeqStep(1);
    } else {
      // Wrong tag
      setSeqStep(0);
    }
  };

  const handleAuthSuccess = () => {
    setIsPasswordModalOpen(false);
    // Transport to the full-page Admin Dashboard!
    router.push("/admin");
  };

  return (
    <>
      <section
        id="hero"
        className="relative min-h-[72vh] flex flex-col items-center justify-center overflow-hidden pt-12 pb-10"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 plaid-bg opacity-30" />

        {/* Rotating white stars in background */}
        <RotatingStars />

        {/* Apple blossoms */}
        <AppleBlossoms count={12} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md mx-auto animate-[fade-in-up_0.8s_ease-out_forwards]">
          {/* Apple avatar frame */}
          <div className="relative mb-6">
            {/* Gingham circle frame */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full gingham-bg p-1.5 shadow-xl animate-[pulse-gentle_3s_ease-in-out_infinite]">
              <div className="w-full h-full rounded-full bg-cream flex items-center justify-center overflow-hidden border-2 border-white relative">
                <Image
                  src="/avt.jpg"
                  alt="Artist Avatar"
                  fill
                  sizes="(max-width: 768px) 128px, 144px"
                  className="object-cover"
                  priority
                />
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
            <p
              className="text-sm text-[#4A2810]/70 font-medium min-h-[1.25rem] transition-opacity duration-300"
              suppressHydrationWarning
            >
              {quote}
            </p>
          </div>

          {/* Tags with Secret Easter Egg Trigger
              Note: Absolutely NO visual cues, active scale, sound or animation on click!
              Kept clean and indistinguishable from normal tags. */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-8">
            {["illustration", "OC / Character", "fanart", "chibi cute"].map((tag) => (
              <span
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-4 py-1.5 text-xs sm:text-sm font-bold rounded-full bg-apple-red-50 text-apple-red border border-apple-red/25 shadow-xs hover:bg-apple-red hover:text-white transition-colors duration-300 cursor-default select-none active:bg-apple-red-50 active:text-apple-red"
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
      </section>

      {/* Admin Password Modal - Secret Gateway */}
      <AdminPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
