"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Trang Chủ", icon: "🏠", emoji: "🍎" },
  { href: "/pricing", label: "Bảng Giá", icon: "💰", emoji: "🍏" },
  { href: "/tos", label: "Điều Khoản", icon: "📋", emoji: "🍎" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);

  return (
    <nav
      id="main-nav"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 shadow-2xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Lace top border */}
      <div className="relative">
        <div className="absolute -top-3 left-0 right-0 h-3 flex justify-center overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-3 rounded-b-full bg-cream border border-apple-red/20 mx-px flex-shrink-0"
              style={{ opacity: 0.9 }}
            />
          ))}
        </div>
      </div>

      <div className="bg-cream/95 backdrop-blur-md border-t-2 border-apple-red/20">
        <div className="flex items-center justify-around px-6 py-2.5 max-w-md mx-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase()}`}
                onClick={() => {
                  setTappedIndex(index);
                  setTimeout(() => setTappedIndex(null), 800);
                }}
                className={`
                  relative flex flex-col items-center gap-1 px-5 py-2 rounded-2xl
                  transition-all duration-300 min-w-[76px] cursor-pointer
                  ${isActive
                    ? "text-apple-red scale-105"
                    : "text-[#4A2810]/60 hover:text-[#4A2810]"
                  }
                `}
              >
                {/* Active indicator — apple shape behind */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-apple-red-50/70 border border-apple-red/15 -z-10 animate-[pulse-gentle_2s_ease-in-out_infinite]" />
                )}

                {/* Icon */}
                <span
                  className={`
                    relative text-2xl transition-transform duration-300
                    ${tappedIndex === index ? "animate-wobble" : ""}
                    ${isActive ? "scale-115" : ""}
                  `}
                >
                  {isActive ? item.emoji : item.icon}
                </span>

                {/* Label */}
                <span
                  className={`
                    text-xs font-bold tracking-wide transition-all duration-300
                    ${isActive ? "text-apple-red" : "text-[#4A2810]/70"}
                  `}
                >
                  {item.label}
                </span>

                {/* Active dot */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-apple-red mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
