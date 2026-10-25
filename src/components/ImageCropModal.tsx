"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface ImageCropModalProps {
  file: File;
  slotIndex: number;
  slotName: string;
  aspectRatio: number; // e.g. 16/10 for slot 0, 3/4 for slot 1-4
  onConfirm: (result: { fullBlob: Blob; thumbBlob: Blob }) => void;
  onCancel: () => void;
}

export default function ImageCropModal({
  file,
  slotIndex,
  slotName,
  aspectRatio,
  onConfirm,
  onCancel,
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Viewport tracking for mobile, iPad, and desktop responsiveness
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: typeof window !== "undefined" ? window.innerWidth : 400,
    height: typeof window !== "undefined" ? window.innerHeight : 700,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Pointer & multi-touch pinch tracking for mobile/iPad
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchZoomRef = useRef<number>(1);

  // Load image object URL
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Window resize listener to keep crop box dynamically sized
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute dynamic responsive crop box maintaining STRICT aspect ratio
  // Screen width minus modal paddings (p-2 on mobile = 16px, inner p-3 = 24px, safety ~56px)
  const maxAvailableW = Math.max(180, Math.min(viewportSize.width - 48, 540));
  // Screen height minus modal header (~54px) + zoom controls (~50px) + footer (~56px) + safe margin (~230px)
  const maxAvailableH = Math.max(160, Math.min(viewportSize.height - 240, 360));

  let cropBoxWidth = maxAvailableW;
  let cropBoxHeight = Math.round(cropBoxWidth / aspectRatio);

  if (cropBoxHeight > maxAvailableH) {
    cropBoxHeight = maxAvailableH;
    cropBoxWidth = Math.round(cropBoxHeight * aspectRatio);
  }

  // Handle image load to get natural dimensions and initial fit
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Compute base cover scale and limits based on current active crop box
  const getRenderMetrics = useCallback(() => {
    if (!naturalSize) {
      return { scale: 1, baseW: cropBoxWidth, baseH: cropBoxHeight, maxPanX: 0, maxPanY: 0 };
    }

    // Scale required to cover the crop box completely at zoom = 1
    const scaleCover = Math.max(cropBoxWidth / naturalSize.width, cropBoxHeight / naturalSize.height);
    const currentScale = scaleCover * zoom;

    const renderedW = naturalSize.width * currentScale;
    const renderedH = naturalSize.height * currentScale;

    const maxPanX = Math.max(0, (renderedW - cropBoxWidth) / 2);
    const maxPanY = Math.max(0, (renderedH - cropBoxHeight) / 2);

    return {
      scale: currentScale,
      baseW: renderedW,
      baseH: renderedH,
      maxPanX,
      maxPanY,
    };
  }, [naturalSize, cropBoxWidth, cropBoxHeight, zoom]);

  // Keep offset clamped within bounds whenever crop box dimensions or image metrics change
  useEffect(() => {
    if (!naturalSize) return;
    const { maxPanX, maxPanY } = getRenderMetrics();
    setOffset((prev) => ({
      x: Math.max(-maxPanX, Math.min(maxPanX, prev.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, prev.y)),
    }));
  }, [cropBoxWidth, cropBoxHeight, naturalSize, getRenderMetrics]);

  // Zoom handler with offset re-clamping
  const handleZoomChange = useCallback(
    (newZoom: number) => {
      const clampedZoom = Math.max(1, Math.min(3, newZoom));
      setZoom(clampedZoom);

      if (naturalSize) {
        const scaleCover = Math.max(cropBoxWidth / naturalSize.width, cropBoxHeight / naturalSize.height);
        const nextScale = scaleCover * clampedZoom;
        const nextW = naturalSize.width * nextScale;
        const nextH = naturalSize.height * nextScale;
        const maxPanX = Math.max(0, (nextW - cropBoxWidth) / 2);
        const maxPanY = Math.max(0, (nextH - cropBoxHeight) / 2);

        setOffset((prev) => ({
          x: Math.max(-maxPanX, Math.min(maxPanX, prev.x)),
          y: Math.max(-maxPanY, Math.min(maxPanY, prev.y)),
        }));
      }
    },
    [naturalSize, cropBoxWidth, cropBoxHeight]
  );

  // Pointer & Multi-touch Handlers for smooth drag & pinch-to-zoom on Mobile / iPad / Desktop
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if setPointerCapture fails on some browsers
    }

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      initialPinchDistRef.current = null;
    } else if (activePointersRef.current.size === 2) {
      // Start 2-finger pinch gesture
      setIsDragging(false);
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      initialPinchDistRef.current = dist;
      initialPinchZoomRef.current = zoom;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Handle 2-finger pinch to zoom on Mobile / iPad
    if (activePointersRef.current.size === 2 && initialPinchDistRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (currentDist > 0 && initialPinchDistRef.current > 0) {
        const factor = currentDist / initialPinchDistRef.current;
        const targetZoom = initialPinchZoomRef.current * factor;
        handleZoomChange(targetZoom);
      }
      return;
    }

    // Handle single finger / mouse panning
    if (activePointersRef.current.size === 1 && isDragging) {
      const { maxPanX, maxPanY } = getRenderMetrics();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setOffset({
        x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size < 2) {
      initialPinchDistRef.current = null;
    }

    if (activePointersRef.current.size === 1) {
      // Seamlessly transition back to 1-finger panning
      const remaining = Array.from(activePointersRef.current.values())[0];
      setIsDragging(true);
      setDragStart({ x: remaining.x - offset.x, y: remaining.y - offset.y });
    } else if (activePointersRef.current.size === 0) {
      setIsDragging(false);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    handleZoomChange(zoom + delta);
  };

  // Re-center
  const handleResetCenter = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Export full image + cropped thumbnail
  const handleConfirmCrop = async () => {
    if (!naturalSize || !imageRef.current) return;
    setIsProcessing(true);

    try {
      const { scale } = getRenderMetrics();

      const renderedW = naturalSize.width * scale;
      const renderedH = naturalSize.height * scale;

      const renderedLeft = (cropBoxWidth - renderedW) / 2 + offset.x;
      const renderedTop = (cropBoxHeight - renderedH) / 2 + offset.y;

      const cropX = Math.max(0, -renderedLeft / scale);
      const cropY = Math.max(0, -renderedTop / scale);
      const cropW = Math.min(naturalSize.width - cropX, cropBoxWidth / scale);
      const cropH = Math.min(naturalSize.height - cropY, cropBoxHeight / scale);

      // 1. Generate Cropped Thumbnail Blob (High resolution matching aspect ratio)
      const exportThumbW = slotIndex === 0 ? 1280 : 900;
      const exportThumbH = Math.round(exportThumbW / aspectRatio);

      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = exportThumbW;
      thumbCanvas.height = exportThumbH;
      const thumbCtx = thumbCanvas.getContext("2d");

      if (!thumbCtx) throw new Error("Không thể khởi tạo Canvas context cho ảnh thumbnail");
      thumbCtx.imageSmoothingEnabled = true;
      thumbCtx.imageSmoothingQuality = "high";

      thumbCtx.drawImage(
        imageRef.current,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        exportThumbW,
        exportThumbH
      );

      const thumbBlob: Blob = await new Promise((resolve, reject) => {
        thumbCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Xuất blob ảnh cắt thất bại"))),
          "image/jpeg",
          0.85
        );
      });

      // 2. Generate Full Uncropped Image Blob (Resized max 1920px for optimal loading)
      const maxDimension = 1920;
      let fullW = naturalSize.width;
      let fullH = naturalSize.height;
      if (fullW > maxDimension || fullH > maxDimension) {
        if (fullW > fullH) {
          fullH = Math.round((maxDimension / fullW) * fullH);
          fullW = maxDimension;
        } else {
          fullW = Math.round((maxDimension / fullH) * fullW);
          fullH = maxDimension;
        }
      }

      const fullCanvas = document.createElement("canvas");
      fullCanvas.width = fullW;
      fullCanvas.height = fullH;
      const fullCtx = fullCanvas.getContext("2d");

      if (!fullCtx) throw new Error("Không thể khởi tạo Canvas context cho ảnh full");
      fullCtx.imageSmoothingEnabled = true;
      fullCtx.imageSmoothingQuality = "high";
      fullCtx.drawImage(imageRef.current, 0, 0, fullW, fullH);

      const fullBlob: Blob = await new Promise((resolve, reject) => {
        fullCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Xuất blob ảnh full thất bại"))),
          "image/jpeg",
          0.88
        );
      });

      onConfirm({ fullBlob, thumbBlob });
    } catch (err) {
      console.error("[ImageCropModal] Lỗi xuất ảnh:", err);
      alert("Đã xảy ra lỗi khi cắt ảnh. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const { baseW, baseH } = getRenderMetrics();

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF4EB] border-3 border-apple-red/25 rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[96vh] shadow-2xl overflow-hidden flex flex-col my-auto animate-[bounce-in_0.3s_ease-out_forwards]">
        {/* Header */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-4 bg-white border-b-2 border-apple-red/15 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl sm:text-2xl flex-shrink-0">✂️</span>
            <div className="min-w-0">
              <h3 className="font-extrabold text-[#4A2810] text-sm sm:text-base flex items-center gap-1.5 truncate">
                <span>Cắt ảnh:</span>
                <span className="text-apple-red font-bold truncate">{slotName}</span>
              </h3>
              <p className="text-[10px] sm:text-xs text-[#4A2810]/70 truncate">
                Tỉ lệ chuẩn: <span className="font-extrabold text-[#4A2810]">{slotIndex === 0 ? "16:10 (Bìa ngang)" : "3:4 (Tranh dọc)"}</span> • Ảnh gốc vẫn giữ trọn vẹn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-apple-red-50 text-apple-red hover:bg-apple-red hover:text-white flex items-center justify-center font-bold text-xs sm:text-sm transition-colors cursor-pointer flex-shrink-0"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Cropper Viewport Area */}
        <div className="p-3 sm:p-5 flex flex-col items-center flex-1 justify-center overflow-hidden">
          <div
            ref={containerRef}
            className="relative bg-[#2D1B10] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none touch-none cursor-grab active:cursor-grabbing flex-shrink-0"
            style={{
              width: `${cropBoxWidth}px`,
              height: `${cropBoxHeight}px`,
              touchAction: "none",
            }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Image being dragged/panned */}
            {imageSrc && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Source for cropping"
                onLoad={handleImageLoad}
                draggable={false}
                className="absolute pointer-events-none select-none max-w-none transition-none"
                style={{
                  width: `${baseW}px`,
                  height: `${baseH}px`,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
              />
            )}

            {/* Grid overlay for rule of thirds */}
            <div className="absolute inset-0 pointer-events-none border-2 border-white/80 rounded-2xl overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              {/* Horizontal rule lines */}
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/35 border-t border-dashed border-white/40" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/35 border-t border-dashed border-white/40" />
              {/* Vertical rule lines */}
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/35 border-l border-dashed border-white/40" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/35 border-l border-dashed border-white/40" />

              {/* Aspect ratio badge */}
              <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs">
                {slotIndex === 0 ? "16:10" : "3:4"}
              </div>
            </div>

            {/* Hint drag */}
            <div className="absolute top-2 left-2 bg-black/65 text-white/95 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md pointer-events-none backdrop-blur-xs flex items-center gap-1 shadow-xs">
              <span>✋</span>
              <span className="hidden sm:inline">Kéo để căn góc • Con lăn để zoom</span>
              <span className="sm:hidden">Kéo để căn góc • 2 ngón tay thu phóng</span>
            </div>
          </div>

          {/* Controls: Zoom & Re-center */}
          <div className="mt-3 w-full max-w-sm sm:max-w-md bg-white rounded-2xl p-2.5 sm:p-3 border border-apple-red/15 flex items-center justify-between gap-2 shadow-xs flex-shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
              <button
                type="button"
                onClick={() => handleZoomChange(zoom - 0.15)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-apple-red-50 text-apple-red hover:bg-apple-red hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer flex-shrink-0 active:scale-95"
                title="Thu nhỏ"
              >
                -
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="flex-1 accent-apple-red cursor-pointer h-2"
              />

              <button
                type="button"
                onClick={() => handleZoomChange(zoom + 0.15)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-apple-red-50 text-apple-red hover:bg-apple-red hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer flex-shrink-0 active:scale-95"
                title="Phóng to"
              >
                +
              </button>

              <span className="text-[10px] sm:text-[11px] font-bold text-[#4A2810]/70 w-8 sm:w-9 text-right tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetCenter}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-apple-red/20 text-[#4A2810] hover:bg-apple-red-50 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0 active:scale-95"
              title="Đặt lại vị trí giữa"
            >
              <span>🎯</span>
              <span className="hidden xs:inline">Căn giữa</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-4 bg-white border-t border-apple-red/15 flex items-center justify-between gap-2 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-apple-red/20 text-[#4A2810] text-xs sm:text-sm font-bold hover:bg-apple-red-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirmCrop}
            disabled={isProcessing}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 bg-apple-red text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-apple-red/30 hover:bg-apple-red-dark active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Xác Nhận Cắt & Tải Lên</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
