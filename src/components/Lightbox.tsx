"use client";

import React, { useState, useEffect, useCallback } from "react";

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

  const minSwipeDistance = 50;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  }, [onClose]);

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

  return (
    <div
      id="lightbox"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      {/* Close button — apple bite style */}
      <button
        id="lightbox-close"
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-apple-red/80 text-white flex items-center justify-center text-lg hover:bg-apple-red transition-colors active:scale-90"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        aria-label="Close lightbox"
      >
        ✕
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 text-white/70 text-sm font-semibold font-[family-name:var(--font-family-body)]">
        🍎 {currentIndex + 1} / {images.length}
      </div>

      {/* Image container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-[bounce-in_0.3s_ease-out_forwards]"
          key={currentIndex}
        />
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(i);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "bg-apple-red scale-125"
                : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`View image ${i + 1}`}
          />
        ))}
      </div>

      {/* Swipe hint on mobile */}
      <div className="absolute bottom-14 left-0 right-0 text-center text-white/30 text-xs md:hidden">
        ← スワイプ →
      </div>
    </div>
  );
}
