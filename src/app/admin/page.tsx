"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  SiteSettings,
  DEFAULT_SETTINGS,
  ToSSection,
} from "@/lib/defaultData";
import { useSettings } from "@/lib/useSettings";
import ImageCropModal from "@/components/ImageCropModal";

type TabKey = "gallery" | "pricing" | "notes" | "tos" | "about";

/**
 * Resize image via HTML5 Canvas before upload (Section 7.2 of guide)
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
        if (!ctx) return reject(new Error("Không thể khởi tạo Canvas context"));
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas export blob thất bại"));
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Lỗi đọc file ảnh"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Lỗi FileReader"));
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const { settings, updateSettings, refreshSettings } = useSettings();

  const [token, setToken] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  // Login form state
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<TabKey>("gallery");
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [cropState, setCropState] = useState<{
    file: File;
    slotIndex: number;
    slotName: string;
    aspectRatio: number;
  } | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadTargetRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("apple_admin_token");
      if (stored) setToken(stored);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    // Tải cấu hình mới nhất từ server mỗi khi đăng nhập admin studio
    fetch(`/api/admin/settings?_t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.gallery_images) {
          setFormData(data);
          updateSettings(data);
        }
      })
      .catch((err) => console.warn("[Admin] Tải dữ liệu server thất bại:", err));
  }, [token, updateSettings]);

  useEffect(() => {
    if (settings && !hasChanges) {
      setFormData(settings);
    }
  }, [settings, hasChanges]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPassword.trim()) {
      setLoginError("Vui lòng nhập mật khẩu quản trị");
      return;
    }
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.message || "Mật khẩu quản trị không chính xác!");
        setIsLoggingIn(false);
        return;
      }

      sessionStorage.setItem("apple_admin_token", data.token);
      setToken(data.token);
      setLoginPassword("");
      setIsLoggingIn(false);
      showToast("Chào mừng Artist quay lại studio! 🍎");
    } catch {
      setLoginError("Không thể kết nối máy chủ");
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("apple_admin_token");
    setToken("");
    showToast("Đã đăng xuất khỏi trang quản trị");
  };

  // Upload handler for sample images
  const handleTriggerUpload = (index: number) => {
    currentUploadTargetRef.current = index;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetIdx = currentUploadTargetRef.current;
    if (!file || targetIdx === null) return;

    // Reset input để chọn lại cùng 1 file vẫn kích hoạt change
    e.target.value = "";

    // Mở modal cắt ảnh chuẩn theo tỉ lệ từng khung tranh
    setCropState({
      file,
      slotIndex: targetIdx,
      slotName: targetIdx === 0 ? "Slot #1 (Tranh Bìa Ngang 16:10)" : `Slot #${targetIdx + 1} (Tranh Dọc 3:4)`,
      aspectRatio: targetIdx === 0 ? 16 / 10 : 3 / 4,
    });
  };

  // Xử lý sau khi artist đã căn góc và xác nhận cắt ảnh
  const handleCropConfirm = async ({
    fullBlob,
    thumbBlob,
  }: {
    fullBlob: Blob;
    thumbBlob: Blob;
  }) => {
    if (!cropState) return;
    const targetIdx = cropState.slotIndex;
    const file = cropState.file;
    setCropState(null);
    setUploadingIndex(targetIdx);

    try {
      const oldImageSrc = formData.gallery_images[targetIdx]?.src || "";
      const oldThumbSrc = formData.gallery_images[targetIdx]?.thumb || "";

      const uploadForm = new FormData();
      uploadForm.append("file", fullBlob, file.name);
      uploadForm.append("thumbFile", thumbBlob, `thumb-${file.name}`);
      uploadForm.append("name", `sample-${targetIdx + 1}-${Date.now()}.jpg`);
      if (oldImageSrc) {
        uploadForm.append("oldUrl", oldImageSrc);
      }
      if (oldThumbSrc) {
        uploadForm.append("oldThumbUrl", oldThumbSrc);
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadForm,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Tải ảnh lên thất bại");
      }

      const updatedGallery = [...formData.gallery_images];
      updatedGallery[targetIdx] = {
        ...updatedGallery[targetIdx],
        src: data.url,
        thumb: data.thumbUrl || data.url,
      };
      setFormData({ ...formData, gallery_images: updatedGallery });
      setHasChanges(true);
      showToast(`Đã cắt & cập nhật ảnh mẫu #${targetIdx + 1}! Bấm 'Lưu Thay Đổi' để hoàn tất.`);
    } catch (err: unknown) {
      console.error(err);
      showToast(err instanceof Error ? err.message : "Lỗi upload ảnh", "error");
    } finally {
      setUploadingIndex(null);
      currentUploadTargetRef.current = null;
    }
  };

  // Save all settings to Database & local store
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

      const savedSettings = data.settings || {
        ...formData,
        gallery_version: data.version || Date.now().toString(),
      };

      updateSettings(savedSettings);
      setFormData(savedSettings);
      setHasChanges(false);
      showToast("💾 Đã lưu và đồng bộ toàn bộ dữ liệu thành công!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Lỗi lưu dữ liệu", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (confirm("Khôi phục toàn bộ nội dung về mặc định ban đầu?")) {
      setFormData(DEFAULT_SETTINGS);
      setHasChanges(true);
      showToast("Đã khôi phục dữ liệu mẫu. Hãy bấm 'Lưu Thay Đổi' để đồng bộ.");
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF4EB]">
        <div className="text-center space-y-3">
          <span className="text-4xl animate-bounce inline-block">🍎</span>
          <p className="font-bold text-[#4A2810]">Đang mở Studio Admin...</p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN (when not authenticated)
  if (!token) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden flex items-center justify-center bg-[#FAF4EB] px-4 py-8">
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-10 border-2 sm:border-3 border-apple-red/20 shadow-2xl relative overflow-hidden">
          {/* Decorative corner tapes */}
          <div className="absolute -top-1 left-8 w-12 sm:w-14 h-4 sm:h-5 bg-leaf-green/50 rotate-[-5deg] rounded-sm pointer-events-none" />
          <div className="absolute -top-1 right-8 w-12 sm:w-14 h-4 sm:h-5 bg-apple-red/40 rotate-[4deg] rounded-sm pointer-events-none" />

          <div className="text-center mb-6 sm:mb-8 pt-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-apple-red-50 border-2 border-apple-red/20 flex items-center justify-center text-3xl sm:text-4xl shadow-md animate-[pulse-gentle_3s_ease-in-out_infinite]">
              🍎
            </div>
            <h1 className="font-[family-name:var(--font-family-display)] text-2xl sm:text-4xl text-apple-red font-bold">
              Artist Studio
            </h1>
            <p className="text-xs sm:text-sm text-[#4A2810]/70 font-semibold mt-1">
              ✿ Trang Quản Trị Dành Riêng Cho Artist ✿
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#4A2810] mb-1.5 uppercase tracking-wider">
                Mật khẩu quản trị
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginError) setLoginError("");
                  }}
                  placeholder="Nhập mật khẩu bí mật..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl border-2 border-apple-red/25 focus:border-apple-red focus:outline-hidden text-sm sm:text-base font-semibold text-[#4A2810] bg-cream/20 transition-all pr-11 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-[#4A2810]/50 hover:text-apple-red p-1 cursor-pointer transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {loginError && (
                <p className="text-apple-red text-xs font-bold mt-2 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>{loginError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-apple-red text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-apple-red/30 hover:bg-apple-red-dark hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-70"
            >
              {isLoggingIn ? (
                <>
                  <span className="animate-spin text-base">⏳</span>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>🔓</span>
                  <span>Vào Trang Quản Trị</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-apple-red/10 text-center">
            <Link
              href="/"
              className="text-xs font-bold text-[#4A2810]/70 hover:text-apple-red transition-colors inline-flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Quay lại trang chủ phòng tranh</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // FULL-PAGE DEDICATED ADMIN DASHBOARD (STRICTLY CONSTRAINED TO VIEWPORT WIDTH)
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FAF4EB] flex flex-col">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Studio Header (Guaranteed NO Horizontal Overflow) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-apple-red/15 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-sm w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Logo & title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-apple-red-50 border border-apple-red/25 flex items-center justify-center text-lg sm:text-2xl shadow-xs flex-shrink-0">
              🍎
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-extrabold text-[#4A2810] text-sm sm:text-xl tracking-tight truncate">
                  Artist Studio
                </h1>
                <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-apple-red text-white uppercase tracking-wider flex-shrink-0">
                  Admin
                </span>
                {hasChanges && (
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse flex-shrink-0 hidden xs:inline-block">
                    Chưa lưu
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#4A2810]/60 hidden md:block truncate">
                Quản lý ảnh sample, bảng giá, điều khoản & giới thiệu
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <Link
              href="/"
              target="_blank"
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-apple-red/20 text-[#4A2810] hover:bg-apple-red-50 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5"
              title="Mở trang chủ ở tab mới"
            >
              <span>👁️</span>
              <span className="hidden sm:inline">Xem Web</span>
            </Link>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-3 sm:px-5 py-2 bg-apple-red text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-apple-red/30 hover:bg-apple-red-dark active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin text-xs">⏳</span>
                  <span className="hidden sm:inline">Đang lưu...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 text-xs font-bold rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              title="Đăng xuất"
            >
              <span className="sm:hidden">🚪</span>
              <span className="hidden sm:inline">🚪 Thoát</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Alert */}
      {notification && (
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 mt-3">
          <div
            className={`p-3 sm:p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between border shadow-sm ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                : "bg-rose-50 text-rose-900 border-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{notification.type === "success" ? "✨" : "⚠️"}</span>
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="opacity-60 hover:opacity-100 ml-3 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="max-w-7xl mx-auto w-full max-w-full px-3 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col lg:flex-row gap-5 overflow-hidden">
        {/* Navigation Sidebar (Desktop) / Horizontal Tabs (Mobile) */}
        <aside className="w-full max-w-full overflow-hidden lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl p-2.5 sm:p-3 border-2 border-apple-red/15 shadow-sm sticky top-16 sm:top-24 max-w-full overflow-hidden">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#4A2810]/50 px-3 py-1.5 hidden lg:block">
              Danh Mục Quản Trị
            </div>

            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none max-w-full">
              {[
                { key: "gallery", label: "Ảnh Sample (Tranh Mẫu)", icon: "🖼️", count: formData.gallery_images.length },
                { key: "pricing", label: "Bảng Giá Commission", icon: "💰" },
                { key: "notes", label: "Lưu Ý Bảng Giá", icon: "📝", count: formData.pricing_notes.length },
                { key: "tos", label: "Điều Khoản Dịch Vụ", icon: "📜", count: formData.tos_sections.length },
                { key: "about", label: "Giới Thiệu (About Me)", icon: "🍎" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabKey)}
                  className={`
                    px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold text-left transition-all cursor-pointer flex items-center justify-between whitespace-nowrap flex-shrink-0 lg:flex-shrink
                    ${activeTab === tab.key
                      ? "bg-apple-red text-white shadow-md shadow-apple-red/25"
                      : "text-[#4A2810] hover:bg-apple-red-50/60 bg-cream/30 lg:bg-transparent"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <span className="text-sm sm:text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {typeof tab.count === "number" && (
                    <span
                      className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-extrabold ml-2 ${
                        activeTab === tab.key
                          ? "bg-white text-apple-red"
                          : "bg-apple-red-50 text-apple-red border border-apple-red/20"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-3 pt-3 border-t border-apple-red/10 hidden lg:block">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="w-full text-center text-xs font-bold text-[#4A2810]/60 hover:text-apple-red py-2 rounded-xl hover:bg-apple-red-50 transition-colors cursor-pointer"
              >
                ↺ Đặt lại nội dung mặc định
              </button>
            </div>
          </div>
        </aside>

        {/* Workspace Content */}
        <main className="flex-1 min-w-0 max-w-full overflow-hidden">
          {/* TAB 1: GALLERY ARTWORKS */}
          {activeTab === "gallery" && (
            <div className="space-y-5 max-w-full overflow-hidden">
              <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-apple-red/15 shadow-sm max-w-full overflow-hidden">
                <div className="mb-5 pb-3 border-b border-apple-red/10">
                  <h2 className="text-lg sm:text-2xl font-extrabold text-[#4A2810] flex items-center gap-2">
                    <span>🖼️</span>
                    <span>Quản Lý 5 Ảnh Sample Phòng Tranh</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A2810]/70 mt-1">
                    Ảnh mẫu hiển thị ở Art Gallery trên trang chủ. Canvas tự động nén tối ưu trước khi lưu.
                  </p>
                </div>

                {/* List of sample slots */}
                <div className="space-y-5 max-w-full">
                  {formData.gallery_images.map((img, idx) => (
                    <div
                      key={img.id}
                      className={`
                        rounded-3xl p-4 sm:p-5 border-2 transition-all bg-[#FFFDF9] max-w-full overflow-hidden
                        ${idx === 0
                          ? "border-apple-red/30 shadow-md ring-2 ring-apple-red/10"
                          : "border-apple-red/15 hover:border-apple-red/25"
                        }
                      `}
                    >
                      <div className="flex flex-col md:flex-row gap-4 sm:gap-5 items-start max-w-full">
                        {/* Artwork Preview Box */}
                        <div className="flex flex-col items-center gap-2 flex-shrink-0 w-full md:w-auto">
                          <div
                            className={`
                              rounded-2xl overflow-hidden bg-cream border-2 border-apple-red/20 relative shadow-sm max-w-full
                              ${idx === 0
                                ? "w-full md:w-60 aspect-[16/10]"
                                : "w-full md:w-40 aspect-[3/4]"
                              }
                            `}
                          >
                            <img
                              src={img.thumb || img.src}
                              alt={img.alt}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-xs">
                              {idx === 0 ? "★ Slot #1 (16:10)" : `Slot #${idx + 1} (3:4)`}
                            </div>
                            {img.thumb && (
                              <div className="absolute bottom-2 right-2 bg-emerald-700/85 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs">
                                ✓ Đã cắt tỉ lệ
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleTriggerUpload(idx)}
                            disabled={uploadingIndex === idx}
                            className="w-full py-2.5 px-3 bg-apple-red text-white text-xs font-bold rounded-xl shadow-xs hover:bg-apple-red-dark active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {uploadingIndex === idx ? (
                              <>
                                <span className="animate-spin text-sm">⏳</span>
                                <span>Đang xử lý ảnh...</span>
                              </>
                            ) : (
                              <>
                                <span>✂️</span>
                                <span>Chọn Ảnh & Cắt Tỉ Lệ</span>
                              </>
                            )}
                          </button>

                          {img.src && !img.src.startsWith("data:") && (
                            <a
                              href={img.src}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-[#4A2810]/70 hover:text-apple-red transition-colors flex items-center gap-1 mt-0.5"
                              title="Xem ảnh full gốc đầy đủ trong tab mới"
                            >
                              <span>🔍</span>
                              <span>Xem ảnh full gốc</span>
                            </a>
                          )}
                        </div>

                        {/* Input Fields */}
                        <div className="flex-1 w-full min-w-0 space-y-3.5">
                          <div>
                            <label className="block text-xs font-bold text-[#4A2810] mb-1 uppercase tracking-wider">
                              Tên bức tranh / Chú thích (Alt text)
                            </label>
                            <input
                              type="text"
                              value={img.alt}
                              onChange={(e) => {
                                const copy = [...formData.gallery_images];
                                copy[idx] = { ...copy[idx], alt: e.target.value };
                                setFormData({ ...formData, gallery_images: copy });
                                setHasChanges(true);
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-apple-red/15 text-xs sm:text-sm font-bold text-[#4A2810] focus:border-apple-red focus:outline-hidden bg-white shadow-xs"
                              placeholder="Nhập tên tranh..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#4A2810] mb-1 uppercase tracking-wider">
                              Link hình ảnh (URL hoặc CDN bên ngoài)
                            </label>
                            <input
                              type="text"
                              value={img.src}
                              onChange={(e) => {
                                const copy = [...formData.gallery_images];
                                copy[idx] = { ...copy[idx], src: e.target.value };
                                setFormData({ ...formData, gallery_images: copy });
                                setHasChanges(true);
                              }}
                              className="w-full px-3.5 py-2 rounded-xl border border-apple-red/15 text-xs text-[#4A2810] focus:border-apple-red focus:outline-hidden bg-white font-mono"
                              placeholder="https://... hoặc data:image..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING MANAGEMENT */}
          {activeTab === "pricing" && (
            <div className="space-y-5 max-w-full overflow-hidden">
              {/* Normal Style Table */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-apple-red/15 shadow-sm space-y-4 max-w-full overflow-hidden">
                <div className="flex items-center gap-2.5 pb-3 border-b border-apple-red/10">
                  <span className="text-2xl sm:text-3xl">🍎</span>
                  <div>
                    <h3 className="text-base sm:text-xl font-extrabold text-[#4A2810]">
                      Gói Normal Style (Bảng Giá Chuẩn)
                    </h3>
                    <p className="text-xs text-[#4A2810]/70">
                      Headshot, Chest-up, Half-body, Knee-up, Full-body
                    </p>
                  </div>
                </div>

                {/* Table strictly scrolls internally */}
                <div className="w-full max-w-full overflow-x-auto pb-2 scrollbar-thin">
                  <table className="w-full min-w-[340px] text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b-2 border-apple-red/15 text-[#4A2810]/70 uppercase text-[11px] font-extrabold">
                        <th className="py-2.5 px-3">Hạng mục</th>
                        <th className="py-2.5 px-3 text-rose-800">Lineart</th>
                        <th className="py-2.5 px-3 text-amber-900">Full Color</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-apple-red/10">
                      {formData.pricing_normal.map((row, idx) => (
                        <tr key={idx} className="hover:bg-cream/20 transition-colors">
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={row.type}
                              onChange={(e) => {
                                const copy = [...formData.pricing_normal];
                                copy[idx] = { ...copy[idx], type: e.target.value };
                                setFormData({ ...formData, pricing_normal: copy });
                                setHasChanges(true);
                              }}
                              className="w-28 sm:w-32 px-2.5 py-1.5 rounded-xl border border-apple-red/20 text-xs sm:text-sm font-extrabold text-[#4A2810] bg-white shadow-xs"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={row.line}
                              onChange={(e) => {
                                const copy = [...formData.pricing_normal];
                                copy[idx] = { ...copy[idx], line: e.target.value };
                                setFormData({ ...formData, pricing_normal: copy });
                                setHasChanges(true);
                              }}
                              className="w-28 sm:w-32 px-2.5 py-1.5 rounded-xl border border-rose-200 text-xs sm:text-sm font-extrabold text-apple-red bg-rose-50/40"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={row.full}
                              onChange={(e) => {
                                const copy = [...formData.pricing_normal];
                                copy[idx] = { ...copy[idx], full: e.target.value };
                                setFormData({ ...formData, pricing_normal: copy });
                                setHasChanges(true);
                              }}
                              className="w-28 sm:w-32 px-2.5 py-1.5 rounded-xl border-2 border-amber-300 text-xs sm:text-sm font-extrabold text-[#4A2810] bg-amber-50"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chibi Style Table */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-leaf-green/25 shadow-sm space-y-4 max-w-full overflow-hidden">
                <div className="flex items-center gap-2.5 pb-3 border-b border-leaf-green/15">
                  <span className="text-2xl sm:text-3xl">🍏</span>
                  <div>
                    <h3 className="text-base sm:text-xl font-extrabold text-[#4A2810]">
                      Gói Chibi Style
                    </h3>
                    <p className="text-xs text-[#4A2810]/70">
                      Headshot, Half-body, Full-body
                    </p>
                  </div>
                </div>

                <div className="w-full max-w-full overflow-x-auto pb-2 scrollbar-thin">
                  <table className="w-full min-w-[340px] text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b-2 border-leaf-green/20 text-[#4A2810]/70 uppercase text-[11px] font-extrabold">
                        <th className="py-2.5 px-3">Hạng mục</th>
                        <th className="py-2.5 px-3 text-emerald-800">Lineart</th>
                        <th className="py-2.5 px-3 text-amber-900">Full Color</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-leaf-green/10">
                      {formData.pricing_chibi.map((row, idx) => (
                        <tr key={idx} className="hover:bg-cream/20 transition-colors">
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={row.type}
                              onChange={(e) => {
                                const copy = [...formData.pricing_chibi];
                                copy[idx] = { ...copy[idx], type: e.target.value };
                                setFormData({ ...formData, pricing_chibi: copy });
                                setHasChanges(true);
                              }}
                              className="w-28 sm:w-32 px-2.5 py-1.5 rounded-xl border border-leaf-green/25 text-xs sm:text-sm font-extrabold text-[#4A2810] bg-white shadow-xs"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={row.line}
                              onChange={(e) => {
                                const copy = [...formData.pricing_chibi];
                                copy[idx] = { ...copy[idx], line: e.target.value };
                                setFormData({ ...formData, pricing_chibi: copy });
                                setHasChanges(true);
                              }}
                              className="w-28 sm:w-32 px-2.5 py-1.5 rounded-xl border border-rose-200 text-xs sm:text-sm font-extrabold text-apple-red bg-rose-50/40"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={row.full}
                              onChange={(e) => {
                                const copy = [...formData.pricing_chibi];
                                copy[idx] = { ...copy[idx], full: e.target.value };
                                setFormData({ ...formData, pricing_chibi: copy });
                                setHasChanges(true);
                              }}
                              className="w-28 sm:w-32 px-2.5 py-1.5 rounded-xl border-2 border-amber-300 text-xs sm:text-sm font-extrabold text-[#4A2810] bg-amber-50"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chibi YCH Box */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-star-pink/40 shadow-sm space-y-4 max-w-full overflow-hidden">
                <div className="flex items-center gap-2.5 pb-3 border-b border-star-pink/20">
                  <span className="text-2xl sm:text-3xl">🌟</span>
                  <div>
                    <h3 className="text-base sm:text-xl font-extrabold text-[#4A2810]">
                      Gói Chibi YCH (Your Character Here)
                    </h3>
                    <p className="text-xs text-[#4A2810]/70">
                      Pose có sẵn theo chủ đề quả táo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#4A2810] mb-1 uppercase">
                      Tiêu đề gói
                    </label>
                    <input
                      type="text"
                      value={formData.pricing_ych.title}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          pricing_ych: { ...formData.pricing_ych, title: e.target.value },
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-apple-red/20 font-extrabold text-xs sm:text-sm text-[#4A2810]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A2810] mb-1 uppercase">
                      Giá tiền
                    </label>
                    <input
                      type="text"
                      value={formData.pricing_ych.price}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          pricing_ych: { ...formData.pricing_ych, price: e.target.value },
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-apple-red/20 font-extrabold text-xs sm:text-sm text-apple-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A2810] mb-1 uppercase">
                      Đơn vị tính
                    </label>
                    <input
                      type="text"
                      value={formData.pricing_ych.unit}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          pricing_ych: { ...formData.pricing_ych, unit: e.target.value },
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-apple-red/20 text-xs sm:text-sm text-[#4A2810]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A2810] mb-1 uppercase">
                      Ghi chú tính theo nhân vật
                    </label>
                    <input
                      type="text"
                      value={formData.pricing_ych.note}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          pricing_ych: { ...formData.pricing_ych, note: e.target.value },
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-apple-red/20 text-xs sm:text-sm text-[#4A2810]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#4A2810] mb-1 uppercase">
                      Mô tả phụ
                    </label>
                    <input
                      type="text"
                      value={formData.pricing_ych.subtitle}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          pricing_ych: { ...formData.pricing_ych, subtitle: e.target.value },
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-apple-red/20 text-xs sm:text-sm text-[#4A2810]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING NOTES */}
          {activeTab === "notes" && (
            <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-apple-red/15 shadow-sm space-y-5 max-w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-apple-red/10">
                <div>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-[#4A2810] flex items-center gap-2">
                    <span>📝</span>
                    <span>Nội Dung Lưu Ý Trong Bảng Giá</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A2810]/70 mt-1">
                    Các dòng gạch đầu dòng hiển thị dưới cùng của trang Commission Price.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      pricing_notes: [...formData.pricing_notes, "Ghi chú mới..."],
                    });
                    setHasChanges(true);
                  }}
                  className="px-4 py-2 bg-apple-red text-white text-xs sm:text-sm font-extrabold rounded-2xl hover:bg-apple-red-dark shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
                >
                  <span>+</span> Thêm Dòng Lưu Ý
                </button>
              </div>

              <div className="space-y-3">
                {formData.pricing_notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 bg-[#FFFDF9] p-3 sm:p-4 rounded-2xl border-2 border-apple-red/15 hover:border-apple-red/30 transition-colors shadow-xs"
                  >
                    <span className="text-base text-apple-red flex-shrink-0">🍎</span>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => {
                        const copy = [...formData.pricing_notes];
                        copy[idx] = e.target.value;
                        setFormData({ ...formData, pricing_notes: copy });
                        setHasChanges(true);
                      }}
                      className="flex-1 min-w-0 px-3 py-1.5 sm:py-2 rounded-xl border border-apple-red/20 text-xs sm:text-sm font-semibold text-[#4A2810] focus:border-apple-red focus:outline-hidden bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = formData.pricing_notes.filter((_, i) => i !== idx);
                        setFormData({ ...formData, pricing_notes: copy });
                        setHasChanges(true);
                      }}
                      className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
                      title="Xóa dòng"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TERMS OF SERVICE */}
          {activeTab === "tos" && (
            <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-apple-red/15 shadow-sm space-y-5 max-w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-apple-red/10">
                <div>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-[#4A2810] flex items-center gap-2">
                    <span>📜</span>
                    <span>Nội Dung Các Mục Điều Khoản (ToS)</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A2810]/70 mt-1">
                    Các phân mục điều khoản hiển thị dạng accordion ở trang Terms of Service.
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
                    setHasChanges(true);
                  }}
                  className="px-4 py-2 bg-apple-red text-white text-xs sm:text-sm font-extrabold rounded-2xl hover:bg-apple-red-dark shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
                >
                  <span>+</span> Thêm Mục ToS Mới
                </button>
              </div>

              <div className="space-y-5">
                {formData.tos_sections.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-[#FFFDF9] rounded-3xl p-4 sm:p-5 border-2 border-apple-red/20 shadow-xs space-y-3.5 max-w-full overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-apple-red/15">
                      <div className="flex-1 min-w-0">
                        <label className="block text-[11px] font-bold text-[#4A2810]/70 mb-1 uppercase">
                          Tiêu đề phân mục #{sIdx + 1}
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const copy = [...formData.tos_sections];
                            copy[sIdx] = { ...copy[sIdx], title: e.target.value };
                            setFormData({ ...formData, tos_sections: copy });
                            setHasChanges(true);
                          }}
                          className="w-full px-3.5 py-1.5 sm:py-2 rounded-xl border border-apple-red/25 text-sm sm:text-base font-extrabold text-apple-red bg-white focus:border-apple-red focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Xóa toàn bộ mục "${section.title}"?`)) {
                            const copy = formData.tos_sections.filter((_, i) => i !== sIdx);
                            setFormData({ ...formData, tos_sections: copy });
                            setHasChanges(true);
                          }
                        }}
                        className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Xóa Mục
                      </button>
                    </div>

                    {/* Bullet points */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#4A2810]">
                          Các điều khoản con:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...formData.tos_sections];
                            copy[sIdx] = {
                              ...copy[sIdx],
                              content: [...copy[sIdx].content, "Nội dung quy định mới..."],
                            };
                            setFormData({ ...formData, tos_sections: copy });
                            setHasChanges(true);
                          }}
                          className="text-xs font-bold text-apple-red hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>+</span> Thêm điều khoản
                        </button>
                      </div>

                      {section.content.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2 sm:gap-2.5">
                          <span className="text-apple-red text-xs mt-2 font-bold">✦</span>
                          <textarea
                            rows={2}
                            value={bullet}
                            onChange={(e) => {
                              const copy = [...formData.tos_sections];
                              const newContent = [...copy[sIdx].content];
                              newContent[bIdx] = e.target.value;
                              copy[sIdx] = { ...copy[sIdx], content: newContent };
                              setFormData({ ...formData, tos_sections: copy });
                              setHasChanges(true);
                            }}
                            className="flex-1 min-w-0 px-3 py-1.5 sm:py-2 rounded-xl border border-apple-red/20 text-xs sm:text-sm text-[#4A2810] font-medium leading-relaxed bg-white focus:border-apple-red focus:outline-hidden shadow-xs"
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
                              setHasChanges(true);
                            }}
                            className="mt-1 w-6 h-6 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
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
            <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-apple-red/15 shadow-sm space-y-5 max-w-full overflow-hidden">
              <div className="pb-3 border-b border-apple-red/10">
                <h2 className="text-lg sm:text-2xl font-extrabold text-[#4A2810] flex items-center gap-2">
                  <span>🍎</span>
                  <span>Nội Dung Mục About Me (Giới Thiệu)</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#4A2810]/70 mt-1">
                  Đoạn giới thiệu bản thân hiển thị phía dưới phòng tranh ở trang chủ.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Editor Form */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#4A2810] mb-1 uppercase tracking-wider">
                      Lời chào đầu (Greeting)
                    </label>
                    <input
                      type="text"
                      value={formData.about_me.greeting}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          about_me: { ...formData.about_me, greeting: e.target.value },
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-2xl border-2 border-apple-red/20 font-bold text-xs sm:text-sm text-apple-red bg-[#FFFDF9] focus:border-apple-red focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A2810] mb-1 uppercase tracking-wider">
                      Đoạn giới thiệu chính (Intro)
                    </label>
                    <textarea
                      rows={5}
                      value={formData.about_me.intro}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          about_me: { ...formData.about_me, intro: e.target.value },
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-apple-red/20 text-xs sm:text-sm text-[#4A2810] font-medium leading-relaxed bg-[#FFFDF9] focus:border-apple-red focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A2810] mb-1 uppercase tracking-wider">
                      Đoạn kết / Lời mời đặt tranh (Outro)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.about_me.outro}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          about_me: { ...formData.about_me, outro: e.target.value },
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-apple-red/20 text-xs sm:text-sm text-[#4A2810] font-medium leading-relaxed bg-[#FFFDF9] focus:border-apple-red focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A2810] mb-1 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🔵</span>
                      <span>Link Facebook Của Artist</span>
                    </label>
                    <input
                      type="url"
                      value={formData.contact_facebook || ""}
                      placeholder="https://www.facebook.com/..."
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          contact_facebook: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3.5 py-2 rounded-2xl border-2 border-apple-red/20 font-medium text-xs sm:text-sm text-[#4A2810] bg-[#FFFDF9] focus:border-apple-red focus:outline-hidden"
                    />
                    <p className="text-[11px] text-[#4A2810]/70 mt-1">
                      Đường dẫn khi khách bấm nút <strong>&quot;Đặt Commission Ngay&quot;</strong> và nút nhắn tin ở mục About Me.
                    </p>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#4A2810]/70 mb-2">
                    👁️ Xem trước hiển thị trên trang chủ:
                  </div>
                  <div className="bg-[#FFFDF9] rounded-3xl p-5 sm:p-7 border-2 border-apple-red/20 shadow-md relative overflow-hidden">
                    <div className="absolute -top-1 left-8 w-12 h-5 bg-leaf-green/40 rotate-[-5deg] rounded-sm pointer-events-none" />
                    <div className="absolute -top-1 right-10 w-12 h-5 bg-apple-red/35 rotate-[4deg] rounded-sm pointer-events-none" />

                    <h3 className="font-[family-name:var(--font-family-display)] text-xl sm:text-2xl text-apple-red text-center mb-4 text-shadow-cute">
                      About Me ✿
                    </h3>

                    <div className="text-[#4A2810] text-sm sm:text-[15px] leading-loose text-center font-medium space-y-3.5">
                      <p className="text-base sm:text-lg font-bold text-apple-red">
                        {formData.about_me.greeting}
                      </p>
                      <p className="whitespace-pre-line text-[#4A2810]">
                        {formData.about_me.intro}
                      </p>
                      <p className="text-[#4A2810]/80 whitespace-pre-line text-xs sm:text-sm">
                        {formData.about_me.outro}
                      </p>
                    </div>

                    <div className="flex justify-center mt-5 gap-3 opacity-60 text-sm">
                      {["🍎", "⭐", "🍏", "✿", "🍎"].map((e, i) => (
                        <span key={i}>{e}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Sticky Bottom Save Actions Bar */}
      <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-apple-red/15 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-lg w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 w-full">
          <div className="flex items-center gap-2 text-xs text-[#4A2810]/70 font-semibold w-full sm:w-auto justify-center sm:justify-start">
            {hasChanges ? (
              <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1.5 text-[11px] sm:text-xs">
                <span>●</span> Có thay đổi chưa lưu vào database
              </span>
            ) : (
              <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 text-[11px] sm:text-xs">
                <span>✓</span> Mọi dữ liệu đã được đồng bộ
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs font-bold text-[#4A2810]/70 hover:text-apple-red underline cursor-pointer hidden sm:inline-block"
            >
              ↺ Đặt lại mặc định
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="w-full sm:w-auto px-5 sm:px-8 py-2.5 sm:py-3 bg-apple-red text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-apple-red/30 hover:bg-apple-red-dark active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Lưu Tất Cả Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Cắt Ảnh Tương Tác Theo Tỉ Lệ Khung Tranh */}
      {cropState && (
        <ImageCropModal
          file={cropState.file}
          slotIndex={cropState.slotIndex}
          slotName={cropState.slotName}
          aspectRatio={cropState.aspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={() => {
            setCropState(null);
            currentUploadTargetRef.current = null;
          }}
        />
      )}
    </div>
  );
}
