import type { Metadata } from "next";
import { ApplePeel, AppleSplit, DecorativeStars } from "@/components/AppleAnimations";
import ToSAccordion from "./ToSAccordion";

export const metadata: Metadata = {
  title: "🍎 Terms of Service — Commission Rules",
  description: "Commission Terms of Service. Please read before ordering. コミッションの利用規約",
};

const TOS_SECTIONS = [
  {
    title: "🍎 I. Về Commission",
    content: [
      "CỌC 30% sau khi chốt slot - wl, THANH TOÁN full tiền comm sau khi nhận được sketch.",
      "Quá 2 ngày không cọc = tự động huỷ slot.",
      "Thêm character: +100% giá gốc.",
      "Phương thức thanh toán: Bank / Momo (Vui lòng chụp bill lại sau khi thanh toán).",
      "Deadline 4 tháng, có thể lâu hơn nếu xảy ra vấn đề phát sinh.",
      "Phí sửa hoàn toàn miễn phí trước khi chốt sketch. Sửa sau sketch (line) và final sẽ tính thêm phí (hoặc không nếu lỗi nằm ở artist).",
      "Không nhận vẽ: background, pose quá khó, người già, người thật, furry, mecha, mật độ chi tiết cao.",
      "Phí details sẽ được thương lượng giữa artist và khách hàng.",
      "Phí thương mại: ×3 | Private: ×1.5.",
    ],
  },
  {
    title: "👤 II. Về Khách Hàng",
    content: [
      "Gửi đầy đủ brief. Có thể tả nhưng vui lòng kèm hình ảnh chi tiết.",
      "Nếu khách hàng gửi brief muộn hoặc sát deadline, artist có quyền thương lượng lại deadline (ít nhất 15 ngày).",
      "Được phép trì hoãn tiền comm trong 1 tuần. Nếu quá 1 tuần, artist có quyền lên bài cân nhắc giao dịch.",
      "Được phép sửa trực tiếp lên tranh, không cần hỏi lại artist.",
      "Nếu hủy slot sau khi đã cọc, khách hàng sẽ mất toàn bộ tiền cọc.",
      "🚫 NGHIÊM CẤM FEED CHO A.I.",
    ],
  },
  {
    title: "🎨 III. Về Artist",
    content: [
      "Được phép mang tranh CMS làm sample trừ khi khách đã trả phí private.",
      "Có quyền từ chối nếu đơn quá khả năng.",
      "CMS nếu quá deadline nhưng vẫn chưa có sketch, sẽ phải refund 100% tiền cọc cho khách.",
    ],
  },
];

export default function ToSPage() {
  return (
    <div className="page-enter relative min-h-screen pb-16">
      {/* Header */}
      <header className="relative pt-10 pb-8 text-center overflow-hidden">
        <div className="absolute inset-0 gingham-bg opacity-25" />

        <div className="relative z-10 px-4">
          <h1 className="font-[family-name:var(--font-family-display)] text-3xl sm:text-4xl text-apple-red text-shadow-cute mb-2">
            Terms of Service
          </h1>
          <p className="text-[#4A2810]/70 text-sm sm:text-base font-semibold">✿ 利用規約 ✿</p>
          <p className="text-[#4A2810] text-sm sm:text-base font-medium mt-3 max-w-sm mx-auto leading-relaxed bg-white/70 backdrop-blur-sm py-1.5 px-4 rounded-full border border-apple-red/10 shadow-xs">
            Vui lòng đọc kỹ trước khi đặt commission nhé! 🍎
          </p>
        </div>

        <div className="absolute -bottom-px left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 400 20" className="w-full block" preserveAspectRatio="none">
            <path
              d="M0 20 L0 10 Q100 0 200 10 Q300 20 400 10 L400 20Z"
              fill="#FFFDF9"
            />
          </svg>
        </div>
      </header>

      {/* Apple peel side decoration */}
      <div className="hidden md:block fixed left-4 top-1/3 opacity-20">
        <ApplePeel animate />
      </div>

      {/* Content */}
      <div className="relative px-4 sm:px-5 py-6">
        <DecorativeStars count={3} />
        <ToSAccordion sections={TOS_SECTIONS} />
      </div>

      {/* Divider */}
      <div className="my-4">
        <AppleSplit animate />
      </div>

      {/* Contact section */}
      <section className="px-4 sm:px-5 pb-12">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-apple-red/15 shadow-sm text-center">
          <h2 className="font-bold text-[#4A2810] text-lg sm:text-xl mb-2 flex items-center justify-center gap-2">
            <span>💌</span> Bạn Đã Sẵn Sàng?
          </h2>
          <p className="text-[#4A2810]/75 text-sm sm:text-base leading-relaxed mb-6 font-medium">
            Sau khi đọc kỹ điều khoản, hãy xem bảng giá để chọn gói vẽ phù hợp nhé!
          </p>
          <a
            href="/pricing"
            className="
              inline-flex items-center justify-center gap-2.5 px-8 py-3.5
              bg-apple-red text-white font-extrabold text-base rounded-full
              shadow-lg shadow-apple-red/25 hover:shadow-xl hover:shadow-apple-red/30
              hover:bg-apple-red-dark active:scale-95
              transition-all duration-300 cursor-pointer
            "
          >
            <span>🍎</span>
            <span>Xem Bảng Giá Commission</span>
          </a>
        </div>
      </section>

      <div className="safe-bottom" />
    </div>
  );
}
