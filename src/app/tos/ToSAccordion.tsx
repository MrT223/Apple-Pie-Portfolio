"use client";

import React, { useState } from "react";

interface ToSSection {
  title: string;
  content: string[];
}

export default function ToSAccordion({ sections }: { sections: ToSSection[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`
              rounded-2xl border-2 transition-all duration-300 overflow-hidden
              ${isOpen
                ? "bg-white border-apple-red/30 shadow-md shadow-apple-red/5"
                : "bg-white/90 border-amber-900/10 hover:border-apple-red/20 hover:bg-white shadow-sm"
              }
            `}
          >
            {/* Header */}
            <button
              id={`tos-section-${index}`}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors duration-200 cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="font-bold text-base sm:text-lg text-[#4A2810] tracking-wide flex items-center gap-2">
                {section.title}
              </span>
              <span
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  transition-all duration-300 flex-shrink-0
                  ${isOpen
                    ? "bg-apple-red-50 text-apple-red rotate-180 scale-110"
                    : "bg-cream text-warm-brown/60"
                  }
                `}
              >
                ▼
              </span>
            </button>

            {/* Content */}
            <div
              className={`
                transition-all duration-300 ease-in-out
                ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}
              `}
            >
              <div className="px-5 pb-5 pt-1 border-t border-apple-red/10 space-y-3.5 bg-apple-red-50/20">
                {section.content.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-[15px] sm:text-base leading-loose text-[#4A2810] font-medium"
                  >
                    <span className="text-apple-red mt-1.5 flex-shrink-0 text-xs">✦</span>
                    <p className="flex-1">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
