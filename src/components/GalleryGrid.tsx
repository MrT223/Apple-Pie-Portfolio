"use client";

import React, { useState } from "react";
import Lightbox from "./Lightbox";
import { StarSparkles, DecorativeStars } from "./AppleAnimations";
import { useSettings } from "@/lib/useSettings";

export default function GalleryGrid() {
  const { settings } = useSettings();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = settings.gallery_images || [];

  return (
    <>
      <section id="gallery" className="relative px-4 sm:px-5 py-8">
        <DecorativeStars count={5} />

        {/* Section title */}
        <div className="text-center mb-8">
          <h2 className="font-[family-name:var(--font-family-display)] text-3xl sm:text-4xl text-apple-red text-shadow-cute mb-2">
            Art Gallery
          </h2>
          <p className="text-sm sm:text-base text-[#4A2810]/70 font-semibold">✿ Nhấp vào tranh để xem chi tiết ✿</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              className={`
                gallery-item relative rounded-3xl overflow-hidden cursor-pointer
                border-3 border-white shadow-md hover:shadow-xl bg-white
                transition-all duration-300
                ${index === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[3/4]"}
              `}
              onClick={() => setLightboxIndex(index)}
              role="button"
              tabIndex={0}
              aria-label={`View ${img.alt}`}
              id={`gallery-item-${img.id}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Hover sparkle overlay */}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <StarSparkles />
              </div>

              {/* Scrapbook tape decoration */}
              {index % 2 === 0 && (
                <div className="absolute -top-1 left-4 w-12 h-5 bg-leaf-green/50 rotate-[-6deg] rounded-sm z-10 shadow-xs" />
              )}
              {index % 2 === 1 && (
                <div className="absolute -top-1 right-4 w-12 h-5 bg-apple-red/40 rotate-[5deg] rounded-sm z-10 shadow-xs" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom decoration */}
        <div className="flex justify-center mt-8 gap-3 opacity-60 text-lg">
          <span className="text-star-pink">✦</span>
          <span className="text-leaf-green">✿</span>
          <span className="text-apple-red">🍎</span>
          <span className="text-leaf-green">✿</span>
          <span className="text-star-pink">✦</span>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
