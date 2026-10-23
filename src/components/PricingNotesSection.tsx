"use client";

import React from "react";
import { useSettings } from "@/lib/useSettings";

export default function PricingNotesSection() {
  const { settings } = useSettings();
  const notes = settings.pricing_notes || [];

  return (
    <section className="px-4 sm:px-5 pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-apple-red/15 shadow-sm relative overflow-hidden">
        {/* Tape */}
        <div className="absolute -top-1 left-8 w-12 h-5 bg-star-pink/30 rotate-[-3deg] rounded-sm" />

        <h2 className="font-extrabold text-[#4A2810] text-lg sm:text-xl mb-5 flex items-center gap-2.5">
          <span className="text-xl">📝</span> Lưu ý quan trọng
        </h2>

        <ul className="space-y-3.5 text-[15px] sm:text-base text-[#4A2810] font-medium leading-loose">
          {notes.map((note, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-apple-red mt-1 flex-shrink-0 text-base">🍎</span>
              <span className="flex-1">{note}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            id="pricing-order-cta"
            className="
              inline-flex items-center justify-center gap-2.5 px-8 py-3.5 w-full sm:w-auto
              bg-apple-red text-white font-extrabold text-base rounded-full
              shadow-lg shadow-apple-red/25 hover:shadow-xl hover:shadow-apple-red/30
              hover:bg-apple-red-dark active:scale-95
              transition-all duration-300 cursor-pointer
            "
          >
            <span>💌</span>
            <span>Đặt Commission Ngay</span>
          </a>
        </div>
      </div>
    </section>
  );
}
