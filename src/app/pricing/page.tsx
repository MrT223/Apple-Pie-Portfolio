import type { Metadata } from "next";
import PricingTable from "@/components/PricingTable";
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

        {/* Wave bottom */}
        <div className="absolute -bottom-px left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 400 20" className="w-full block" preserveAspectRatio="none">
            <path
              d="M0 20 L0 10 Q100 0 200 10 Q300 20 400 10 L400 20Z"
              fill="#FFFDF9"
            />
          </svg>
        </div>
      </header>

      {/* Apple peel side decoration (desktop) */}
      <div className="hidden md:block fixed left-4 top-1/2 -translate-y-1/2 opacity-20">
        <ApplePeel animate />
      </div>
      <div className="hidden md:block fixed right-4 top-1/2 -translate-y-1/2 opacity-20 scale-x-[-1]">
        <ApplePeel animate />
      </div>

      {/* Main content */}
      <div className="relative px-4 sm:px-5 py-6">
        <DecorativeStars count={4} />
        <PricingTable />
      </div>

      {/* Additional info */}
      <div className="my-6">
        <AppleSplit animate />
      </div>

      <section className="px-4 sm:px-5 pb-12">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-apple-red/15 shadow-sm relative overflow-hidden">
          {/* Tape */}
          <div className="absolute -top-1 left-8 w-12 h-5 bg-star-pink/30 rotate-[-3deg] rounded-sm" />

          <h2 className="font-extrabold text-[#4A2810] text-lg sm:text-xl mb-5 flex items-center gap-2.5">
            <span className="text-xl">📝</span> Lưu ý quan trọng
          </h2>

          <ul className="space-y-3.5 text-[15px] sm:text-base text-[#4A2810] font-medium leading-loose">
            {[
              "Giá có thể thay đổi tùy mức độ phức tạp của thiết kế nhân vật",
              "Thanh toán 100% trước khi bắt đầu vẽ sketch",
              "Thời gian hoàn thành: 3-7 ngày làm việc (không tính cuối tuần)",
              "Số lượng slot giới hạn mỗi đợt mở order",
              "Có thể yêu cầu thêm background / phụ kiện / props với phụ phí",
            ].map((note, i) => (
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

      <div className="safe-bottom" />
    </div>
  );
}
