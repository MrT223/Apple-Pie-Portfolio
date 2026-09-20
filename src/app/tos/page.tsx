import type { Metadata } from "next";
import { ApplePeel, AppleSplit, DecorativeStars } from "@/components/AppleAnimations";
import ToSAccordion from "./ToSAccordion";

export const metadata: Metadata = {
  title: "🍎 Terms of Service — Commission Rules",
  description: "Commission Terms of Service. Please read before ordering. コミッションの利用規約",
};

const TOS_SECTIONS = [
  {
    title: "🍎 General / Tổng quan",
    content: [
      "Bằng việc đặt commission, bạn đồng ý với tất cả các điều khoản dưới đây.",
      "Tôi có quyền từ chối bất kỳ commission nào mà không cần giải thích lý do.",
      "Giá cả có thể thay đổi tùy theo mức độ phức tạp — sẽ thông báo trước khi bắt đầu.",
      "Vui lòng cung cấp tài liệu tham khảo rõ ràng (reference) khi đặt commission.",
    ],
  },
  {
    title: "💰 Payment / Thanh toán",
    content: [
      "Thanh toán 100% trước khi bắt đầu vẽ.",
      "Phương thức thanh toán: chuyển khoản ngân hàng / Momo / PayPal.",
      "Không hoàn tiền sau khi đã bắt đầu sketch — trừ trường hợp tôi không thể hoàn thành.",
      "Giá đã niêm yết trên trang Pricing. Phụ phí nếu có sẽ được thông báo rõ.",
    ],
  },
  {
    title: "🎨 Process / Quy trình",
    content: [
      "Sau khi thanh toán, tôi sẽ gửi sketch để bạn xác nhận trước khi tiếp tục.",
      "Bạn được chỉnh sửa lớn (major revision) 1 lần ở giai đoạn sketch.",
      "Chỉnh sửa nhỏ (minor revision) miễn phí 2 lần ở giai đoạn hoàn thiện.",
      "Chỉnh sửa bổ sung ngoài số lần cho phép sẽ tính phụ phí.",
      "Thời gian hoàn thành: 3-7 ngày làm việc (có thể lâu hơn nếu queue đông).",
    ],
  },
  {
    title: "📋 Usage Rights / Quyền sử dụng",
    content: [
      "Bạn ĐƯỢC: sử dụng cá nhân, đăng lên social media (kèm credit), in ấn cho bản thân.",
      "Bạn KHÔNG ĐƯỢC: tuyên bố là tác phẩm của mình, sử dụng cho mục đích thương mại (trừ khi đã thỏa thuận), bán lại, dùng cho AI training.",
      "Tôi giữ quyền đăng tác phẩm lên portfolio và social media của mình.",
      "Commercial use license có thể thỏa thuận riêng với phụ phí.",
    ],
  },
  {
    title: "✋ Will Draw / Won't Draw",
    content: [
      "✅ SẼ VẼ: OC, fanart, couple, group (phụ phí), light NSFW (tùy trường hợp), kemonomimi, mecha nhẹ.",
      "❌ KHÔNG VẼ: NSFW nặng, hate art, nội dung chính trị, bạo lực quá mức, bất kỳ nội dung vi phạm pháp luật.",
      "Nếu không chắc, hãy hỏi tôi trước khi đặt order nhé!",
    ],
  },
  {
    title: "🔄 Cancellation / Hủy đơn",
    content: [
      "Hủy đơn trước khi bắt đầu sketch → hoàn 100%.",
      "Hủy sau khi đã nhận sketch → không hoàn tiền.",
      "Nếu tôi hủy đơn vì lý do cá nhân → hoàn 100%.",
      "Deadline bạn yêu cầu phải hợp lý, rush order sẽ tính phụ phí 30-50%.",
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
