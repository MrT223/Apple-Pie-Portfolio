"use client";

import React, { useState } from "react";
import Lightbox from "./Lightbox";
import { StarSparkles, DecorativeStars } from "./AppleAnimations";

// High quality cute SVG samples as default placeholders (can be replaced via Supabase)
const SAMPLE_1 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='bg1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FCE4EC'/%3E%3Cstop offset='100%25' stop-color='%23FFCDD2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg1)'/%3E%3Ccircle cx='400' cy='280' r='140' fill='%23C0392B'/%3E%3Cellipse cx='360' cy='230' rx='25' ry='40' fill='%23E74C3C' opacity='0.7'/%3E%3Cpath d='M400 140 Q410 100 440 90' stroke='%238B4513' stroke-width='14' fill='none' stroke-linecap='round'/%3E%3Cpath d='M415 115 Q460 100 470 130 Q430 140 415 115Z' fill='%237D9B4E'/%3E%3Ctext x='400' y='480' font-family='sans-serif' font-size='28' font-weight='bold' fill='%234A2810' text-anchor='middle'%3E🍎 Little Apple Witch — Full Art%3C/text%3E%3Ctext x='400' y='520' font-family='sans-serif' font-size='18' fill='%23884422' text-anchor='middle'%3E✿ Sample 1 / Featured Artwork ✿%3C/text%3E%3C/svg%3E";

const SAMPLE_2 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'%3E%3Cdefs%3E%3ClinearGradient id='bg2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23E8F5E9'/%3E%3Cstop offset='100%25' stop-color='%23C8E6C9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg2)'/%3E%3Ccircle cx='300' cy='360' r='130' fill='%237D9B4E'/%3E%3Cellipse cx='260' cy='310' rx='20' ry='35' fill='%23A8C97A' opacity='0.7'/%3E%3Cpath d='M300 230 Q310 190 340 180' stroke='%238B4513' stroke-width='12' fill='none' stroke-linecap='round'/%3E%3Cpath d='M315 205 Q360 190 370 220 Q330 230 315 205Z' fill='%235A7236'/%3E%3Ctext x='300' y='560' font-family='sans-serif' font-size='26' font-weight='bold' fill='%234A2810' text-anchor='middle'%3E🍏 Green Apple Maid%3C/text%3E%3Ctext x='300' y='600' font-family='sans-serif' font-size='18' fill='%23556B2F' text-anchor='middle'%3EChibi Style Commission%3C/text%3E%3C/svg%3E";

const SAMPLE_3 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'%3E%3Cdefs%3E%3ClinearGradient id='bg3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FFF3E0'/%3E%3Cstop offset='100%25' stop-color='%23FFE0B2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg3)'/%3E%3Ccircle cx='300' cy='360' r='130' fill='%23E74C3C'/%3E%3Ccircle cx='300' cy='360' r='90' fill='%23FFF8E7'/%3E%3Cellipse cx='280' cy='360' rx='6' ry='14' fill='%238B4513'/%3E%3Cellipse cx='320' cy='360' rx='6' ry='14' fill='%238B4513'/%3E%3Ctext x='300' y='560' font-family='sans-serif' font-size='26' font-weight='bold' fill='%234A2810' text-anchor='middle'%3E✨ Sliced Apple OC%3C/text%3E%3Ctext x='300' y='600' font-family='sans-serif' font-size='18' fill='%23A0522D' text-anchor='middle'%3EHalf-Body Character%3C/text%3E%3C/svg%3E";

const SAMPLE_4 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'%3E%3Cdefs%3E%3ClinearGradient id='bg4' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23F3E5F5'/%3E%3Cstop offset='100%25' stop-color='%23E1BEE7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg4)'/%3E%3Ccircle cx='300' cy='360' r='120' fill='%23C0392B'/%3E%3Ctext x='300' y='380' font-size='80' text-anchor='middle'%3E🌸%3C/text%3E%3Ctext x='300' y='560' font-family='sans-serif' font-size='26' font-weight='bold' fill='%234A2810' text-anchor='middle'%3E🍂 Autumn Blossom Tea%3C/text%3E%3Ctext x='300' y='600' font-family='sans-serif' font-size='18' fill='%236A1B9A' text-anchor='middle'%3EKnee-up Full Color%3C/text%3E%3C/svg%3E";

const SAMPLE_5 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'%3E%3Cdefs%3E%3ClinearGradient id='bg5' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23E0F2F1'/%3E%3Cstop offset='100%25' stop-color='%23B2DFDB'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg5)'/%3E%3Ccircle cx='240' cy='360' r='90' fill='%23C0392B'/%3E%3Ccircle cx='360' cy='360' r='90' fill='%237D9B4E'/%3E%3Ctext x='300' y='380' font-size='60' text-anchor='middle'%3E💖%3C/text%3E%3Ctext x='300' y='560' font-family='sans-serif' font-size='26' font-weight='bold' fill='%234A2810' text-anchor='middle'%3E🌟 Twin Apples YCH%3C/text%3E%3Ctext x='300' y='600' font-family='sans-serif' font-size='18' fill='%2300695C' text-anchor='middle'%3ECouple Chibi Art%3C/text%3E%3C/svg%3E";

const GALLERY_IMAGES = [
  { id: 1, src: SAMPLE_1, alt: "Little Apple Witch — Full Art" },
  { id: 2, src: SAMPLE_2, alt: "Green Apple Maid — Chibi Style" },
  { id: 3, src: SAMPLE_3, alt: "Sliced Apple OC — Half-Body" },
  { id: 4, src: SAMPLE_4, alt: "Autumn Blossom Tea — Knee-up" },
  { id: 5, src: SAMPLE_5, alt: "Twin Apples YCH — Couple Chibi" },
];

export default function GalleryGrid() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
          {GALLERY_IMAGES.map((img, index) => (
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
          images={GALLERY_IMAGES}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
