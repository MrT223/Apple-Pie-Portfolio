"use client";

import React, { useState } from "react";

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export default function AdminPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu quản trị");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Mật khẩu quản trị không chính xác!");
        setIsSubmitting(false);
        return;
      }

      // Success
      if (typeof window !== "undefined") {
        sessionStorage.setItem("apple_admin_token", data.token);
      }
      setPassword("");
      setIsSubmitting(false);
      onSuccess(data.token);
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại!");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 border-3 border-apple-red/25 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner tapes */}
        <div className="absolute -top-1 left-6 w-12 h-5 bg-leaf-green/50 rotate-[-5deg] rounded-sm pointer-events-none" />
        <div className="absolute -top-1 right-6 w-12 h-5 bg-apple-red/40 rotate-[4deg] rounded-sm pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-apple-red-50 text-apple-red hover:bg-apple-red hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-apple-red-50 border-2 border-apple-red/20 flex items-center justify-center text-3xl shadow-xs">
            🍎
          </div>
          <h3 className="font-[family-name:var(--font-family-display)] text-2xl text-apple-red font-bold">
            Admin Access
          </h3>
          <p className="text-xs sm:text-sm text-[#4A2810]/70 font-semibold mt-1">
            ✿ Khu vực quản trị dành riêng cho Artist ✿
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4A2810] mb-1.5 uppercase tracking-wider">
              Mật khẩu Admin
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Nhập mật khẩu bí mật..."
                autoFocus
                className="w-full px-4 py-3 rounded-2xl border-2 border-apple-red/20 focus:border-apple-red focus:outline-hidden text-sm sm:text-base font-medium text-[#4A2810] bg-cream/30 transition-colors pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#4A2810]/50 hover:text-apple-red p-1 cursor-pointer transition-colors"
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {error && (
              <p className="text-apple-red text-xs font-bold mt-2 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-apple-red text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-apple-red/25 hover:bg-apple-red-dark hover:shadow-xl active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin text-base">⏳</span>
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>🔓</span>
                <span>Mở Bảng Quản Trị</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
