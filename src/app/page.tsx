import HeroSection from "@/components/HeroSection";
import GalleryGrid from "@/components/GalleryGrid";
import { AppleSplit } from "@/components/AppleAnimations";

export default function Home() {
  return (
    <div className="page-enter pb-16">
      {/* Hero */}
      <HeroSection />

      {/* Apple split divider */}
      <div className="my-4">
        <AppleSplit animate />
      </div>

      {/* Gallery */}
      <GalleryGrid />

      {/* About section */}
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
              こんにちは！ Welcome to my little apple garden~ 🍎
            </p>
            <p>
              Tôi là họa sĩ minh họa kỹ thuật số (digital artist), đam mê vẽ nhân vật cute, OC và fanart! Phong cách của tôi ngọt ngào, rực rỡ và lấy cảm hứng từ các loại hoa quả bốn mùa 🌸
            </p>
            <p className="text-[#4A2810]/80">
              Hãy dạo xem phòng tranh nhỏ của tôi và tham khảo bảng giá nếu bạn muốn đặt vẽ nhé!
            </p>
          </div>

          {/* Decorative bottom */}
          <div className="flex justify-center mt-8 gap-3 opacity-60 text-base">
            {["🍎", "⭐", "🍏", "✿", "🍎"].map((e, i) => (
              <span key={i}>{e}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom padding for safe area */}
      <div className="safe-bottom" />
    </div>
  );
}
