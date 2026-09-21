"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface LightboxProps {
  images: { src: string; alt: string }[];
  initialIndex: number;
  onClose: () => void;
}

export default function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);

  const minSwipeDistance = 50;

  const handleClose = useCallback(() => {
    if (isSplitting || isClosing) return;
    setIsSplitting(true);
    setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => onClose(), 300);
    }, 500);
  }, [onClose, isSplitting, isClosing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex((i) => i - 1);
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) setCurrentIndex((i) => i + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [currentIndex, images.length, handleClose]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0 && currentIndex < images.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (distance < 0 && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const currentImage = images[currentIndex];

  return createPortal(
    <div
      id="lightbox"
      className={`fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      onClick={handleClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button — Apple that splits! */}
      <button
        id="lightbox-close"
        className="absolute top-5 right-5 z-30 w-14 h-14 flex items-center justify-center cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        aria-label="Close lightbox"
      >
        <div className="relative w-12 h-12">
          {/* Left half of apple */}
          <svg
            viewBox="0 0 24 24"
            className={`absolute inset-0 w-full h-full transition-all duration-500 ease-out ${
              isSplitting
                ? "-translate-x-4 -rotate-[20deg] opacity-0"
                : "translate-x-0 rotate-0 opacity-100 group-hover:scale-110"
            }`}
            style={{ clipPath: "inset(0 50% 0 0)" }}
          >
            <path
              d="M12 22C7 22 3.5 17 3.5 12.5C3.5 8 6.5 5.5 9 5.5C10 5.5 11 6 12 6C13 6 14 5.5 15 5.5C17.5 5.5 20.5 8 20.5 12.5C20.5 17 17 22 12 22Z"
              fill="#C0392B"
            />
            <ellipse cx="8.5" cy="11" rx="1.5" ry="3" fill="#E74C3C" opacity="0.6" />
            <path d="M12 6C12 4 13 2.5 14.5 2" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M13 3.5C14.5 3 16 3.5 16 5C15 4.5 13.5 4.5 13 3.5Z" fill="#7D9B4E" />
          </svg>

          {/* Right half of apple */}
          <svg
            viewBox="0 0 24 24"
            className={`absolute inset-0 w-full h-full transition-all duration-500 ease-out ${
              isSplitting
                ? "translate-x-4 rotate-[20deg] opacity-0"
                : "translate-x-0 rotate-0 opacity-100 group-hover:scale-110"
            }`}
            style={{ clipPath: "inset(0 0 0 50%)" }}
          >
            <path
              d="M12 22C7 22 3.5 17 3.5 12.5C3.5 8 6.5 5.5 9 5.5C10 5.5 11 6 12 6C13 6 14 5.5 15 5.5C17.5 5.5 20.5 8 20.5 12.5C20.5 17 17 22 12 22Z"
              fill="#C0392B"
            />
            <path d="M12 6C12 4 13 2.5 14.5 2" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M13 3.5C14.5 3 16 3.5 16 5C15 4.5 13.5 4.5 13 3.5Z" fill="#7D9B4E" />
          </svg>

          {/* Seeds visible when splitting */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-400 ${
              isSplitting ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <ellipse cx="11" cy="13" rx="1" ry="2" fill="#8B4513" transform="rotate(-15 11 13)" />
              <ellipse cx="13" cy="13" rx="1" ry="2" fill="#8B4513" transform="rotate(15 13 13)" />
              <ellipse cx="12" cy="15" rx="0.8" ry="1.5" fill="#A0522D" />
            </svg>
          </div>
        </div>
      </button>

      {/* Image counter */}
      <div className="absolute top-6 left-5 z-30 text-white/70 text-sm font-semibold font-[family-name:var(--font-family-body)]">
        🍎 {currentIndex + 1} / {images.length}
      </div>

      {/* Centered image — click on image does NOT close */}
      <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
        {currentImage && (
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-[bounce-in_0.3s_ease-out_forwards] pointer-events-auto"
            key={currentIndex}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        )}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-30">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(i);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              i === currentIndex
                ? "bg-apple-red scale-125 shadow-lg shadow-apple-red/50"
                : "bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`View image ${i + 1}`}
          />
        ))}
      </div>

      {/* Swipe hint on mobile */}
      <div className="absolute bottom-14 left-0 right-0 text-center text-white/30 text-xs md:hidden z-30">
        ← スワイプ →
      </div>
    </div>,
    document.body
  );
}
