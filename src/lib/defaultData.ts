export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

export interface PricingItem {
  type: string;
  sketch?: string;
  line: string;
  full: string;
}

export interface YCHPricing {
  title: string;
  subtitle: string;
  price: string;
  unit: string;
  note: string;
}

export interface ToSSection {
  title: string;
  content: string[];
}

export interface AboutMeData {
  greeting: string;
  intro: string;
  outro: string;
}

export interface SiteSettings {
  gallery_images: GalleryImage[];
  pricing_normal: PricingItem[];
  pricing_chibi: PricingItem[];
  pricing_ych: YCHPricing;
  pricing_notes: string[];
  tos_sections: ToSSection[];
  about_me: AboutMeData;
  gallery_version?: string;
}

export const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 1,
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='bg1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FCE4EC'/%3E%3Cstop offset='100%25' stop-color='%23FFCDD2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg1)'/%3E%3Ccircle cx='400' cy='280' r='140' fill='%23C0392B'/%3E%3Cellipse cx='360' cy='230' rx='25' ry='40' fill='%23E74C3C' opacity='0.7'/%3E%3Cpath d='M400 140 Q410 100 440 90' stroke='%238B4513' stroke-width='14' fill='none' stroke-linecap='round'/%3E%3Cpath d='M415 115 Q460 100 470 130 Q430 140 415 115Z' fill='%237D9B4E'/%3E%3Ctext x='400' y='480' font-family='sans-serif' font-size='28' font-weight='bold' fill='%234A2810' text-anchor='middle'%3E🍎 Little Apple Witch — Full Art%3C/text%3E%3Ctext x='400' y='520' font-family='sans-serif' font-size='18' fill='%23884422' text-anchor='middle'%3E✿ Sample 1 / Featured Artwork ✿%3C/text%3E%3C/svg%3E",
    alt: "Little Apple Witch — Full Art",
  },
  {
    id: 2,
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'%3E%3Cdefs%3E%3ClinearGradient id='bg2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23E8F5E9'/%3E%3Cstop offset='100%25' stop-color='%23C8E6C9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg2)'/%3E%3Ccircle cx='300' cy='360' r='130' fill='%237D9B4E'/%3E%3Cellipse cx='260' cy='310' rx='20' ry='35' fill='%23A8C97A' opacity='0.7'/%3E%3Cpath d='M300 230 Q310 190 340 180' stroke='%238B4513' stroke-width='12' fill='none' stroke-linecap='round'/%3E%3Cpath d='M315 205 Q360 190 370 220 Q330 230 315 205Z' fill='%235A7236'/%3E%3Ctext x='300' y='560' font-family='sans-serif' font-size='26' font-weight='bold' fill='%234A2810' text-anchor='middle'%3E🍏 Green Apple Maid%3C/text%3E%3Ctext x='300' y='600' font-family='sans-serif' font-size='18' fill='%23556B2F' text-anchor='middle'%3EChibi Style Commission%3C/text%3E%3C/svg%3E",
    alt: "Green Apple Maid — Chibi Style",
  },
  {
    id: 3,
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'%3E%3Cdefs%3E%3ClinearGradient id='bg3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FFF3E0'/%3E%3Cstop offset='100%25' stop-color='%23FFE0B2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg3)'/%3E%3Ccircle cx='300' cy='360' r='130' fill='%23E74C3C'/%3E%3Ccircle cx='300' cy='360' r='90' fill='%23FFF8E7'/%3E%3Cellipse cx='280' cy='360' rx='6' ry='14' fill='%238B4513'/%3E%3Cellipse cx='320' cy='360' rx='6' ry='14' fill='%238B4513'/%3E%3Ctext x='300' y='560' font-family='sans-serif' font-size='26' font-weight='bold' fill='%234A2810' text-anchor='middle'%3E✨ Sliced Apple OC%3C/text%3E%3Ctext x='300' y='600' font-family='sans-serif' font-size='18' fill='%23A0522D' text-anchor='middle'%3EHalf-Body Character%3C/text%3E%3C/svg%3E",
    alt: "Sliced Apple OC — Half-Body",
  },
  {
    id: 4,
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'%3E%3Cdefs%3E%3ClinearGradient id='bg4' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23F3E5F5'/%3E%3Cstop offset='100%25' stop-color='%23E1BEE7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg4)'/%3E%3Ccircle cx='300' cy='360' r='120' fill='%23C0392B'/%3E%3Ctext x='300' y='380' font-size='80' text-anchor='middle'%3E🌸%3C/text%3E%3Ctext x='300' y='560' font-family='sans-serif' font-size='26' font-weight='bold' fill='%234A2810' text-anchor='middle'%3E🍂 Autumn Blossom Tea%3C/text%3E%3Ctext x='300' y='600' font-family='sans-serif' font-size='18' fill='%236A1B9A' text-anchor='middle'%3EKnee-up Full Color%3C/text%3E%3C/svg%3E",
    alt: "Autumn Blossom Tea — Knee-up",
  },
  {
    id: 5,
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'%3E%3Cdefs%3E%3ClinearGradient id='bg5' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23E0F2F1'/%3E%3Cstop offset='100%25' stop-color='%23B2DFDB'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg5)'/%3E%3Ccircle cx='240' cy='360' r='90' fill='%23C0392B'/%3E%3Ccircle cx='360' cy='360' r='90' fill='%237D9B4E'/%3E%3Ctext x='300' y='380' font-size='60' text-anchor='middle'%3E💖%3C/text%3E%3Ctext x='300' y='560' font-family='sans-serif' font-size='26' font-weight='bold' fill='%234A2810' text-anchor='middle'%3E🌟 Twin Apples YCH%3C/text%3E%3Ctext x='300' y='600' font-family='sans-serif' font-size='18' fill='%2300695C' text-anchor='middle'%3ECouple Chibi Art%3C/text%3E%3C/svg%3E",
    alt: "Twin Apples YCH — Couple Chibi",
  },
];

export const DEFAULT_PRICING_NORMAL: PricingItem[] = [
  { type: "Headshot", line: "180.000₫", full: "380.000₫" },
  { type: "Chest-up", line: "230.000₫", full: "480.000₫" },
  { type: "Half-body", line: "300.000₫", full: "600.000₫" },
  { type: "Knee-up", line: "370.000₫", full: "750.000₫" },
  { type: "Full-body", line: "500.000₫", full: "1.000.000₫" },
];

export const DEFAULT_PRICING_CHIBI: PricingItem[] = [
  { type: "Headshot", line: "120.000₫", full: "180.000₫" },
  { type: "Half-body", line: "170.000₫", full: "300.000₫" },
  { type: "Full-body", line: "250.000₫", full: "500.000₫" },
];

export const DEFAULT_PRICING_YCH: YCHPricing = {
  title: "Chibi YCH",
  subtitle: "Your Character Here — Pose có sẵn theo chủ đề quả táo",
  price: "80.000₫",
  unit: "/ 1 nhân vật",
  note: "Tính theo số lượng nhân vật trong khung tranh",
};

export const DEFAULT_PRICING_NOTES: string[] = [
  "Giá có thể thay đổi tùy mức độ phức tạp của thiết kế nhân vật",
  "Thanh toán 100% trước khi bắt đầu vẽ sketch",
  "Thời gian hoàn thành: 3-7 ngày làm việc (không tính cuối tuần)",
  "Số lượng slot giới hạn mỗi đợt mở order",
  "Có thể yêu cầu thêm background / phụ kiện / props với phụ phí",
];

export const DEFAULT_TOS_SECTIONS: ToSSection[] = [
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

export const DEFAULT_ABOUT_ME: AboutMeData = {
  greeting: "こんにちは！ Welcome to my little apple garden~ 🍎",
  intro:
    "Tôi là họa sĩ minh họa kỹ thuật số (digital artist), đam mê vẽ nhân vật cute, OC và fanart! Phong cách của tôi ngọt ngào, rực rỡ và lấy cảm hứng từ các loại hoa quả bốn mùa 🌸",
  outro:
    "Hãy dạo xem phòng tranh nhỏ của tôi và tham khảo bảng giá nếu bạn muốn đặt vẽ nhé!",
};

export const DEFAULT_SETTINGS: SiteSettings = {
  gallery_images: DEFAULT_GALLERY_IMAGES,
  pricing_normal: DEFAULT_PRICING_NORMAL,
  pricing_chibi: DEFAULT_PRICING_CHIBI,
  pricing_ych: DEFAULT_PRICING_YCH,
  pricing_notes: DEFAULT_PRICING_NOTES,
  tos_sections: DEFAULT_TOS_SECTIONS,
  about_me: DEFAULT_ABOUT_ME,
  gallery_version: "1",
};
