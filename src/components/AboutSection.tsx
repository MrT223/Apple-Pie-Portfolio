"use client";

import React from "react";
import { useSettings } from "@/lib/useSettings";

export default function AboutSection() {
  const { settings } = useSettings();
  const about = settings.about_me;

  return (
    <section id="about" className="px-4 sm:px-5 py-10">
      <div className="bg-white rounded-3xl p-7 sm:p-9 border-2 border-apple-red/15 shadow-sm relative overflow-hidden">
        {/* Tape decorations */}
        <div className="absolute -top-1 left-8 w-12 h-5 bg-leaf-green/40 rotate-[-5deg] rounded-sm" />
        <div className="absolute -top-1 right-10 w-12 h-5 bg-apple-red/35 rotate-[4deg] rounded-sm" />

        <h2 className="font-[family-name:var(--font-family-display)] text-2xl sm:text-3xl text-apple-red text-center mb-6 text-shadow-cute">
          About Me ✿
        </h2>

        <div className="text-[#4A2810] text-[15px] sm:text-base leading-loose text-center font-medium space-y-4">
          <p className="text-lg font-bold text-apple-red">
            {about.greeting}
          </p>
          <p className="whitespace-pre-line">
            {about.intro}
          </p>
          <p className="text-[#4A2810]/80 whitespace-pre-line">
            {about.outro}
          </p>

          <div className="pt-2">
            <a
              href={settings.contact_facebook || "https://www.facebook.com/p/%C4%90inh-H%C6%B0%C6%A1ng-61591273319002/"}
              target="_blank"
              rel="noopener noreferrer"
              id="about-facebook-cta"
              className="
                inline-flex items-center justify-center gap-2 px-6 py-2.5
                bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold text-sm rounded-full
                shadow-md shadow-[#1877F2]/25 hover:shadow-lg hover:shadow-[#1877F2]/30
                active:scale-95 transition-all duration-300 cursor-pointer
              "
            >
              <span>💬</span>
              <span>Nhắn Tin Với Artist Trên Facebook</span>
            </a>
          </div>
        </div>

        {/* Decorative bottom */}
        <div className="flex justify-center mt-8 gap-3 opacity-60 text-base">
          {["🍎", "⭐", "🍏", "✿", "🍎"].map((e, i) => (
            <span key={i}>{e}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
