import HeroSection from "@/components/HeroSection";
import GalleryGrid from "@/components/GalleryGrid";
import AboutSection from "@/components/AboutSection";
import { AppleSplit } from "@/components/AppleAnimations";

export default function Home() {
  return (
    <div className="page-enter pb-16">
      {/* Hero */}
      <HeroSection />

      {/* Unified White Surface Layer (Wave top + White background below on same layer) */}
      <div className="relative bg-[#FFFDF9] z-10">
        {/* Wave contour at the top of the white surface */}
        <div className="absolute -top-[29px] left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 400 30" className="w-full block" preserveAspectRatio="none">
            <path
              d="M0 30 L0 15 Q50 0 100 15 Q150 30 200 15 Q250 0 300 15 Q350 30 400 15 L400 30Z"
              fill="#FFFDF9"
            />
          </svg>
        </div>

        {/* Apple split divider */}
        <div className="my-4">
          <AppleSplit animate />
        </div>

        {/* Gallery */}
        <GalleryGrid />

        {/* Dynamic About section */}
        <AboutSection />
      </div>

      {/* Bottom padding for safe area */}
      <div className="safe-bottom" />
    </div>
  );
}
