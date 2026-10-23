import type { Metadata } from "next";
import PricingTable from "@/components/PricingTable";
import PricingNotesSection from "@/components/PricingNotesSection";
import { ApplePeel, DecorativeStars, AppleSplit } from "@/components/AppleAnimations";

export const metadata: Metadata = {
  title: "🍎 Pricing — Commission Price List",
  description: "Commission pricing for digital illustrations. Normal, Chibi, and Chibi YCH options available. Check out the price list! コミッション料金表",
};

export default function PricingPage() {
  return (
    <div className="page-enter relative min-h-screen pb-16">
      {/* Header */}
      <header className="relative pt-10 pb-8 text-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 plaid-bg opacity-25" />

        <div className="relative z-10 px-4">
          <h1 className="font-[family-name:var(--font-family-display)] text-3xl sm:text-4xl text-apple-red text-shadow-cute mb-2">
            Commission Price
          </h1>
          <p className="text-[#4A2810]/70 text-sm sm:text-base font-semibold">✿ 料金表 ✿</p>
        </div>
      </header>

      {/* Apple peel side decoration (desktop) */}
      <div className="hidden md:block fixed left-4 top-1/2 -translate-y-1/2 opacity-20">
        <ApplePeel animate />
      </div>
      <div className="hidden md:block fixed right-4 top-1/2 -translate-y-1/2 opacity-20 scale-x-[-1]">
        <ApplePeel animate />
      </div>

      {/* Unified White Surface Layer (Wave top + White background below on same layer) */}
      <div className="relative bg-[#FFFDF9] z-10 px-4 sm:px-5 py-6">
        {/* Wave contour at the top of the white surface */}
        <div className="absolute -top-[19px] left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 400 20" className="w-full block" preserveAspectRatio="none">
            <path
              d="M0 20 L0 10 Q100 0 200 10 Q300 20 400 10 L400 20Z"
              fill="#FFFDF9"
            />
          </svg>
        </div>
        <DecorativeStars count={4} />
        <PricingTable />
      </div>

      {/* Additional info */}
      <div className="my-6">
        <AppleSplit animate />
      </div>

      {/* Dynamic pricing notes */}
      <PricingNotesSection />

      <div className="safe-bottom" />
    </div>
  );
}
