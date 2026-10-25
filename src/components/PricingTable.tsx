"use client";

import React, { useState } from "react";
import { WobbleApple } from "./AppleAnimations";
import { useSettings } from "@/lib/useSettings";
import { PricingItem, YCHPricing } from "@/lib/defaultData";

type PricingCategory = "normal" | "chibi" | "ych";

const tabs: { key: PricingCategory; label: string; emoji: string }[] = [
  { key: "normal", label: "Normal Style", emoji: "🍎" },
  { key: "chibi", label: "Chibi Style", emoji: "🍏" },
  { key: "ych", label: "Chibi YCH", emoji: "🌟" },
];

export default function PricingTable() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<PricingCategory>("normal");

  const normalPrices = settings.pricing_normal;
  const chibiPrices = settings.pricing_chibi;
  const ychPricing = settings.pricing_ych;

  return (
    <div className="max-w-lg mx-auto">
      {/* Tab navigation */}
      <div className="flex justify-center gap-2.5 sm:gap-3 mb-8" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              relative px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold
              transition-all duration-300 active:scale-95 cursor-pointer shadow-xs
              ${activeTab === tab.key
                ? "bg-apple-red text-white shadow-md shadow-apple-red/30 scale-105"
                : "bg-white text-[#4A2810] border-2 border-apple-red/15 hover:border-apple-red/35"
              }
            `}
          >
            <span className="mr-1.5">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pricing content */}
      <div className="animate-[fade-in-up_0.3s_ease-out_forwards]" key={activeTab}>
        {activeTab === "normal" && <NormalPricingCards prices={normalPrices} />}
        {activeTab === "chibi" && <ChibiPricingCards prices={chibiPrices} />}
        {activeTab === "ych" && <YCHPricingCard pricing={ychPricing} />}
      </div>
    </div>
  );
}

function NormalPricingCards({ prices }: { prices: PricingItem[] }) {
  return (
    <div className="space-y-4 sm:space-y-5">
      {prices.map((item, index) => (
        <div
          key={item.type + index}
          className="bg-white rounded-3xl border-2 border-apple-red/15 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300"
          style={{ animationDelay: `${index * 0.06}s` }}
        >
          {/* Type header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[#4A2810] text-lg sm:text-xl flex items-center gap-2.5 tracking-wide">
              <WobbleApple size={22} />
              {item.type}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl p-3.5 sm:p-4 text-center bg-rose-50/70 border border-rose-200/70 hover:border-rose-300 transition-colors">
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider block mb-1 text-rose-800">
                Lineart
              </span>
              <span className="text-base sm:text-lg font-extrabold text-apple-red block">
                {item.line}
              </span>
            </div>

            <div className="rounded-2xl p-3.5 sm:p-4 text-center bg-amber-100/60 border-2 border-amber-300 shadow-xs hover:border-amber-400 transition-colors">
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider block mb-1 text-amber-900">
                Full Color ✦
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#4A2810] block">
                {item.full}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChibiPricingCards({ prices }: { prices: PricingItem[] }) {
  return (
    <div className="space-y-4 sm:space-y-5">
      {prices.map((item, index) => (
        <div
          key={item.type + index}
          className="bg-white rounded-3xl border-2 border-leaf-green/25 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300"
          style={{ animationDelay: `${index * 0.06}s` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[#4A2810] text-lg sm:text-xl flex items-center gap-2.5 tracking-wide">
              <span className="text-2xl">🍏</span>
              {item.type}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl p-3.5 sm:p-4 text-center bg-emerald-50/70 border border-emerald-200/70 hover:border-emerald-300 transition-colors">
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider block mb-1 text-emerald-800">
                Lineart
              </span>
              <span className="text-base sm:text-lg font-extrabold text-leaf-green-dark block">
                {item.line}
              </span>
            </div>

            <div className="rounded-2xl p-3.5 sm:p-4 text-center bg-amber-100/60 border-2 border-amber-300 shadow-xs hover:border-amber-400 transition-colors">
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider block mb-1 text-amber-900">
                Full Color ✦
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#4A2810] block">
                {item.full}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function YCHPricingCard({ pricing }: { pricing: YCHPricing }) {
  return (
    <div className="bg-white rounded-3xl border-2 border-star-pink/40 p-6 sm:p-8 shadow-sm text-center">
      <div className="flex justify-center mb-5">
        <div className="w-20 h-20 rounded-full gingham-bg flex items-center justify-center shadow-md border-2 border-white">
          <span className="text-4xl">🌟</span>
        </div>
      </div>

      <h3 className="font-extrabold text-[#4A2810] text-xl sm:text-2xl mb-2 tracking-wide">
        {pricing.title}
      </h3>
      <p className="text-[#4A2810]/70 text-sm sm:text-base mb-6 font-medium">
        {pricing.subtitle}
      </p>

      <div className="inline-block bg-apple-red-50/80 border border-apple-red/20 rounded-3xl px-8 py-4 mb-6 shadow-xs">
        <span className="text-3xl sm:text-4xl font-extrabold text-apple-red block mb-1">
          {pricing.price}
        </span>
        <span className="text-[#4A2810]/75 text-sm font-semibold block">
          {pricing.unit}
        </span>
      </div>

      <div className="bg-cream/80 border border-apple-red/10 rounded-2xl p-4 text-sm sm:text-base text-[#4A2810] font-medium leading-relaxed max-w-xs mx-auto">
        <p className="flex items-center justify-center gap-2">
          <span className="text-apple-red">✿</span>
          {pricing.note}
          <span className="text-apple-red">✿</span>
        </p>
      </div>

      {/* Decorations */}
      <div className="flex justify-center mt-6 gap-4 opacity-50 text-base">
        <span className="text-star-pink animate-[sparkle_2s_ease-in-out_infinite]">✦</span>
        <span className="text-apple-red animate-[sparkle_2s_ease-in-out_0.5s_infinite]">🍎</span>
        <span className="text-star-pink animate-[sparkle_2s_ease-in-out_1s_infinite]">✦</span>
      </div>
    </div>
  );
}
