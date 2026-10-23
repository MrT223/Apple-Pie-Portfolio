"use client";

import React, { useState, useRef } from "react";
import { SiteSettings, DEFAULT_SETTINGS, GalleryImage, PricingItem, ToSSection } from "@/lib/defaultData";
import { useSettings } from "@/lib/useSettings";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

type TabKey = "gallery" | "pricing" | "notes" | "tos" | "about";

/**
 * Resize image via HTML5 Canvas before upload as described in
 * DATABASE_API_ARCHITECTURE_GUIDE.md Section 7.2
 */
async function resizeImageBeforeUpload(file: File, maxW = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((maxW / w) * h);
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Không thể khởi tạo Canvas context"));
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas export toBlob thất bại"));
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Lỗi đọc dữ liệu ảnh"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Lỗi FileReader"));
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboardModal({
  isOpen,
  onClose,
  token,
}: AdminDashboardModalProps) {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<TabKey>("gallery");
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadTargetRef = useRef<number | null>(null);

  // Sync internal state with context settings on open
  React.useEffect(() => {
    if (isOpen) {
      setFormData(settings);
      setNotification(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  // Upload handler for sample images
  const handleTriggerUpload = (index: number) => {
    currentUploadTargetRef.current = index;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetIdx = currentUploadTargetRef.current;
    if (!file || targetIdx === null) return;

    setUploadingIndex(targetIdx);
    try {
      // 1. Resize via HTML5 Canvas (Section 7.2)
      const compressedBlob = await resizeImageBeforeUpload(file, 1200);

      // 2. Prepare upload payload
      const uploadForm = new FormData();
      uploadForm.append("file", compressedBlob, file.name);
      uploadForm.append("name", `sample-${targetIdx + 1}-${Date.now()}.jpg`);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadForm,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Tải ảnh lên thất bại");
      }

      // 3. Update formData state
      const updatedGallery = [...formData.gallery_images];
      updatedGallery[targetIdx] = {
        ...updatedGallery[targetIdx],
        src: data.url,
      };
      setFormData({ ...formData, gallery_images: updatedGallery });
      showToast(`Đã tải lên và thay ảnh mẫu #${targetIdx + 1}!`);
    } catch (err: unknown) {
      console.error(err);
      showToast(err instanceof Error ? err.message : "Lỗi khi upload ảnh", "error");
    } finally {
      setUploadingIndex(null);
      currentUploadTargetRef.current = null;
    }
  };

  // Save all changes to database & server
  const handleSaveAll = async () => {
    setIsSaving(true);
    setNotification(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Lỗi lưu cấu hình");
      }

      // Update client context & cache
      updateSettings(formData);
      await refreshSettings();

      showToast("💾 Đã lưu thay đổi vào Database thành công!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Lỗi khi lưu dữ liệu", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (confirm("Bạn có chắc chắn muốn đặt lại tất cả nội dung về mặc định ban đầu không?")) {
      setFormData(DEFAULT_SETTINGS);
      showToast("Đã khôi phục nội dung mặc định (hãy bấm Lưu để đồng bộ)");
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("apple_admin_token");
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
    >
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div
        className="w-full max-w-3xl max-h-[90vh] bg-[#FFFDF9] rounded-3xl border-3 border-apple-red/30 shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-white border-b-2 border-apple-red/15 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🍎</span>
            <div>
              <h2 className="font-extrabold text-[#4A2810] text-lg sm:text-xl flex items-center gap-2">
                Bảng Quản Trị Artist
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-apple-red-50 text-apple-red border border-apple-red/20">
                  ADMIN
                </span>
              </h2>
              <p className="text-xs text-[#4A2810]/60 font-medium">
                Tự do thay ảnh, đổi giá, cập nhật điều khoản và About Me
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              title="Đăng xuất"
            >
              🚪 Đăng xuất
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-apple-red-50 text-apple-red hover:bg-apple-red hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-cream/40 border-b border-apple-red/10 px-4 py-2 flex items-center gap-2 overflow-x-auto flex-shrink-0 scrollbar-none">
          {[
            { key: "gallery", label: "🖼️ Ảnh Sample", count: formData.gallery_images.length },
            { key: "pricing", label: "💰 Bảng Giá" },
            { key: "notes", label: "📝 Lưu Ý Giá", count: formData.pricing_notes.length },
            { key: "tos", label: "📜 Điều Khoản", count: formData.tos_sections.length },
            { key: "about", label: "🍎 About Me" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5
                ${activeTab === tab.key
                  ? "bg-apple-red text-white shadow-sm shadow-apple-red/30 scale-102"
                  : "bg-white text-[#4A2810] border border-apple-red/10 hover:border-apple-red/30"
                }
              `}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === tab.key ? "bg-white text-apple-red" : "bg-apple-red-50 text-apple-red"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {notification && (
            <div
              className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between border ${
                notification.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              <span>{notification.text}</span>
              <button
                onClick={() => setNotification(null)}
                className="opacity-60 hover:opacity-100 ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: GALLERY IMAGES */}
          {activeTab === "gallery" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-[#4A2810] text-base">
                    Quản Lý 5 Ảnh Sample (Tranh Mẫu)
                  </h3>
                  <p className="text-xs text-[#4A2810]/70">
                    Ảnh mẫu hiển thị tại mục Art Gallery ở trang chủ. Canvas tự động nén tối ưu trước khi lưu.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {formData.gallery_images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="bg-white rounded-2xl p-4 border-2 border-apple-red/15 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-xs"
                  >
                    {/* Image preview */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-cream border border-apple-red/20 flex-shrink-0 relative">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 space-y-2 w-full">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#4A2810]/70 mb-1">
                          Tên bức tranh / Chú thích (Alt text)
                        </label>
                        <input
                          type="text"
                          value={img.alt}
                          onChange={(e) => {
                            const copy = [...formData.gallery_images];
                            copy[idx] = { ...copy[idx], alt: e.target.value };
                            setFormData({ ...formData, gallery_images: copy });
                          }}
                          className="w-full px-3 py-1.5 rounded-xl border border-apple-red/20 text-xs sm:text-sm font-semibold text-[#4A2810] focus:border-apple-red focus:outline-hidden bg-cream/20"
                          placeholder="Tên tác phẩm..."
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#4A2810]/70 mb-1">
                          Link ảnh (URL hoặc Tải ảnh mới lên)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={img.src}
                            onChange={(e) => {
                              const copy = [...formData.gallery_images];
                              copy[idx] = { ...copy[idx], src: e.target.value };
                              setFormData({ ...formData, gallery_images: copy });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-apple-red/20 text-xs text-[#4A2810] focus:border-apple-red focus:outline-hidden bg-cream/20"
                            placeholder="https://... hoặc data:image..."
                          />
                          <button
                            type="button"
                            onClick={() => handleTriggerUpload(idx)}
                            disabled={uploadingIndex === idx}
                            className="px-3.5 py-1.5 bg-apple-red-50 text-apple-red hover:bg-apple-red hover:text-white rounded-xl text-xs font-bold border border-apple-red/25 whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {uploadingIndex === idx ? "⏳ Đang nén..." : "📁 Tải ảnh lên"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PRICING TABLE */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              {/* Normal Style */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-apple-red/15 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍎</span>
                  <h4 className="font-extrabold text-[#4A2810] text-base">
                    Gói Normal Style (5 Hạng Mục)
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-apple-red/15 text-[#4A2810]/70 uppercase text-[11px]">
                        <th className="py-2 px-2">Hạng mục</th>
                        <th className="py-2 px-2">Sketch</th>
                        <th className="py-2 px-2">Lineart</th>
                        <th className="py-2 px-2">Full Color</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-apple-red/10">
                      {formData.pricing_normal.map((row, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-2 font-bold text-[#4A2810]">
                            <input
                              type="text"
                              value={row.type}
                              onChange={(e) => {
                                const copy = [...formData.pricing_normal];
                                copy[idx] = { ...copy[idx], type: e.target.value };
                                setFormData({ ...formData, pricing_normal: copy });
                              }}
                              className="w-24 sm:w-28 px-2 py-1 rounded-lg border border-apple-red/15 text-xs font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="text"
                              value={row.sketch}
                              onChange={(e) => {
                                const copy = [...formData.pricing_normal];
                                copy[idx] = { ...copy[idx], sketch: e.target.value };
                                setFormData({ ...formData, pricing_normal: copy });
                              }}
                              className="w-24 sm:w-28 px-2 py-1 rounded-lg border border-emerald-200 text-emerald-800 text-xs font-semibold"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="text"
                              value={row.line}
                              onChange={(e) => {
                                const copy = [...formData.pricing_normal];
                                copy[idx] = { ...copy[idx], line: e.target.value };
                                setFormData({ ...formData, pricing_normal: copy });
                              }}
                              className="w-24 sm:w-28 px-2 py-1 rounded-lg border border-rose-200 text-apple-red text-xs font-semibold"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="text"
                              value={row.full}
                              onChange={(e) => {
                                const copy = [...formData.pricing_normal];
                                copy[idx] = { ...copy[idx], full: e.target.value };
                                setFormData({ ...formData, pricing_normal: copy });
                              }}
                              className="w-24 sm:w-28 px-2 py-1 rounded-lg border border-amber-300 text-amber-900 text-xs font-bold"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chibi Style */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-leaf-green/25 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍏</span>
                  <h4 className="font-extrabold text-[#4A2810] text-base">
                    Gói Chibi Style (3 Hạng Mục)
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-leaf-green/20 text-[#4A2810]/70 uppercase text-[11px]">
                        <th className="py-2 px-2">Hạng mục</th>
                        <th className="py-2 px-2">Sketch</th>
                        <th className="py-2 px-2">Lineart</th>
                        <th className="py-2 px-2">Full Color</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-leaf-green/10">
                      {formData.pricing_chibi.map((row, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-2 font-bold text-[#4A2810]">
                            <input
                              type="text"
                              value={row.type}
                              onChange={(e) => {
                                const copy = [...formData.pricing_chibi];
                                copy[idx] = { ...copy[idx], type: e.target.value };
                                setFormData({ ...formData, pricing_chibi: copy });
                              }}
                              className="w-24 sm:w-28 px-2 py-1 rounded-lg border border-leaf-green/20 text-xs font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="text"
                              value={row.sketch}
                              onChange={(e) => {
                                const copy = [...formData.pricing_chibi];
                                copy[idx] = { ...copy[idx], sketch: e.target.value };
                                setFormData({ ...formData, pricing_chibi: copy });
                              }}
                              className="w-24 sm:w-28 px-2 py-1 rounded-lg border border-emerald-200 text-emerald-800 text-xs font-semibold"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="text"
                              value={row.line}
                              onChange={(e) => {
                                const copy = [...formData.pricing_chibi];
                                copy[idx] = { ...copy[idx], line: e.target.value };
                                setFormData({ ...formData, pricing_chibi: copy });
                              }}
                              className="w-24 sm:w-28 px-2 py-1 rounded-lg border border-rose-200 text-apple-red text-xs font-semibold"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="text"
                              value={row.full}
                              onChange={(e) => {
                                const copy = [...formData.pricing_chibi];
                                copy[idx] = { ...copy[idx], full: e.target.value };
                                setFormData({ ...formData, pricing_chibi: copy });
                              }}
                              className="w-24 sm:w-28 px-2 py-1 rounded-lg border border-amber-300 text-amber-900 text-xs font-bold"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chibi YCH */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-star-pink/40 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌟</span>
                  <h4 className="font-extrabold text-[#4A2810] text-base">
                    Gói Chibi YCH
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4A2810]/70 mb-1">
                      Tiêu đề gói
                    </label>
                    <input
                      type="text"
                      value={formData.pricing_ych.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing_ych: { ...formData.pricing_ych, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-apple-red/20 text-xs font-bold text-[#4A2810]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#4A2810]/70 mb-1">
                      Giá tiền
                    </label>
                    <input
                      type="text"
                      value={formData.pricing_ych.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing_ych: { ...formData.pricing_ych, price: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-apple-red/20 text-xs font-bold text-apple-red"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#4A2810]/70 mb-1">
                      Mô tả phụ
                    </label>
                    <input
                      type="text"
                      value={formData.pricing_ych.subtitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing_ych: { ...formData.pricing_ych, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-apple-red/20 text-xs text-[#4A2810]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#4A2810]/70 mb-1">
                      Ghi chú tính giá
                    </label>
                    <input
                      type="text"
                      value={formData.pricing_ych.note}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing_ych: { ...formData.pricing_ych, note: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-apple-red/20 text-xs text-[#4A2810]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-[#4A2810] text-base">
                    📝 Nội Dung Lưu Ý Trong Bảng Giá
                  </h3>
                  <p className="text-xs text-[#4A2810]/70">
                    Các dòng ghi chú hiển thị ở dưới cùng của trang Commission Price.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      pricing_notes: [...formData.pricing_notes, "Ghi chú mới..."],
                    });
                  }}
                  className="px-3 py-1.5 bg-apple-red text-white text-xs font-bold rounded-xl hover:bg-apple-red-dark cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span>+</span> Thêm dòng
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.pricing_notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-apple-red/15"
                  >
                    <span className="text-apple-red text-sm">🍎</span>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => {
                        const copy = [...formData.pricing_notes];
                        copy[idx] = e.target.value;
                        setFormData({ ...formData, pricing_notes: copy });
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-apple-red/20 text-xs sm:text-sm text-[#4A2810] font-medium focus:border-apple-red focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = formData.pricing_notes.filter((_, i) => i !== idx);
                        setFormData({ ...formData, pricing_notes: copy });
                      }}
                      className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Xóa dòng này"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TERMS OF SERVICE (ToS) */}
          {activeTab === "tos" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-[#4A2810] text-base">
                    📜 Nội Dung Các Mục Điều Khoản (ToS)
                  </h3>
                  <p className="text-xs text-[#4A2810]/70">
                    Các mục điều khoản hợp đồng được xếp accordion ở trang Terms of Service.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSection: ToSSection = {
                      title: "✨ Mục Điều Khoản Mới",
                      content: ["Quy định đầu tiên..."],
                    };
                    setFormData({
                      ...formData,
                      tos_sections: [...formData.tos_sections, newSection],
                    });
                  }}
                  className="px-3 py-1.5 bg-apple-red text-white text-xs font-bold rounded-xl hover:bg-apple-red-dark cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span>+</span> Thêm mục
                </button>
              </div>

              <div className="space-y-5">
                {formData.tos_sections.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-apple-red/20 space-y-3.5 shadow-xs"
                  >
                    {/* Section title & delete */}
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-[#4A2810]/70 mb-1">
                          Tiêu đề mục #{sIdx + 1}
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const copy = [...formData.tos_sections];
                            copy[sIdx] = { ...copy[sIdx], title: e.target.value };
                            setFormData({ ...formData, tos_sections: copy });
                          }}
                          className="w-full px-3 py-1.5 rounded-xl border border-apple-red/20 text-sm font-bold text-apple-red focus:border-apple-red focus:outline-hidden"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Xóa toàn bộ mục "${section.title}"?`)) {
                            const copy = formData.tos_sections.filter((_, i) => i !== sIdx);
                            setFormData({ ...formData, tos_sections: copy });
                          }
                        }}
                        className="mt-5 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Xóa mục
                      </button>
                    </div>

                    {/* Section items */}
                    <div className="space-y-2 pt-2 border-t border-apple-red/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#4A2810]">
                          Các điều khoản con:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...formData.tos_sections];
                            copy[sIdx] = {
                              ...copy[sIdx],
                              content: [...copy[sIdx].content, "Điều khoản mới..."],
                            };
                            setFormData({ ...formData, tos_sections: copy });
                          }}
                          className="text-[11px] font-bold text-apple-red hover:underline cursor-pointer"
                        >
                          + Thêm điều khoản
                        </button>
                      </div>

                      {section.content.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <span className="text-apple-red text-xs mt-2.5">✦</span>
                          <textarea
                            rows={2}
                            value={bullet}
                            onChange={(e) => {
                              const copy = [...formData.tos_sections];
                              const newContent = [...copy[sIdx].content];
                              newContent[bIdx] = e.target.value;
                              copy[sIdx] = { ...copy[sIdx], content: newContent };
                              setFormData({ ...formData, tos_sections: copy });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-apple-red/15 text-xs sm:text-sm text-[#4A2810] font-medium focus:border-apple-red focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...formData.tos_sections];
                              copy[sIdx] = {
                                ...copy[sIdx],
                                content: copy[sIdx].content.filter((_, i) => i !== bIdx),
                              };
                              setFormData({ ...formData, tos_sections: copy });
                            }}
                            className="mt-1 w-6 h-6 rounded-md bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                            title="Xóa dòng"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ABOUT ME */}
          {activeTab === "about" && (
            <div className="bg-white rounded-2xl p-5 border-2 border-apple-red/15 space-y-4">
              <div>
                <h3 className="font-extrabold text-[#4A2810] text-base">
                  🍎 Nội Dung Mục About Me
                </h3>
                <p className="text-xs text-[#4A2810]/70">
                  Phần giới thiệu bản thân nằm ở dưới phòng tranh ở trang chủ.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#4A2810]/70 mb-1">
                    Lời chào đầu (Greeting)
                  </label>
                  <input
                    type="text"
                    value={formData.about_me.greeting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about_me: { ...formData.about_me, greeting: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-apple-red/20 text-sm font-bold text-apple-red focus:border-apple-red focus:outline-hidden bg-cream/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#4A2810]/70 mb-1">
                    Đoạn giới thiệu chính (Intro)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.about_me.intro}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about_me: { ...formData.about_me, intro: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-apple-red/20 text-xs sm:text-sm text-[#4A2810] font-medium leading-relaxed focus:border-apple-red focus:outline-hidden bg-cream/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#4A2810]/70 mb-1">
                    Đoạn kết / Kêu gọi (Outro)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.about_me.outro}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about_me: { ...formData.about_me, outro: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-apple-red/20 text-xs sm:text-sm text-[#4A2810] font-medium leading-relaxed focus:border-apple-red focus:outline-hidden bg-cream/20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="bg-white border-t-2 border-apple-red/15 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-bold text-[#4A2810]/70 hover:text-apple-red underline cursor-pointer"
          >
            ↺ Đặt lại mặc định
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#4A2810] hover:bg-cream cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-6 py-2.5 bg-apple-red text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-apple-red/25 hover:bg-apple-red-dark hover:shadow-xl active:scale-98 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
