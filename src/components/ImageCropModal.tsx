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

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load image object URL
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Handle image load to get natural dimensions and initial fit
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Viewport dimensions for the crop frame based on aspect ratio
  const cropBoxHeight = 320;
  const cropBoxWidth = Math.round(cropBoxHeight * aspectRatio);

  // Compute base cover scale and limits
  const getRenderMetrics = useCallback(() => {
    if (!naturalSize) return { scale: 1, baseW: cropBoxWidth, baseH: cropBoxHeight, maxPanX: 0, maxPanY: 0 };

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

  // Mouse / Touch handlers for panning
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const { maxPanX, maxPanY } = getRenderMetrics();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setOffset({
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Zoom slider change
  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(1, Math.min(3, newZoom));
    setZoom(clampedZoom);

    // Re-clamp offset with new zoom
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
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#FAF4EB] border-3 border-apple-red/25 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-auto animate-[bounce-in_0.3s_ease-out_forwards]">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b-2 border-apple-red/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">✂️</span>
            <div>
              <h3 className="font-extrabold text-[#4A2810] text-base sm:text-lg flex items-center gap-2">
                <span>Cắt Khung Ảnh:</span>
                <span className="text-apple-red font-bold text-sm sm:text-base">
                  {slotName}
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-[#4A2810]/70">
                Tỉ lệ chuẩn: <span className="font-extrabold text-[#4A2810]">{slotIndex === 0 ? "16:10 (Chữ nhật ngang)" : "3:4 (Chữ nhật dọc)"}</span>. Ảnh gốc nguyên bản vẫn được lưu trọn vẹn để phóng to.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-apple-red-50 text-apple-red hover:bg-apple-red hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cropper Viewport */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          <div
            ref={containerRef}
            className="relative bg-[#2D1B10] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none"
            style={{
              width: cropBoxWidth,
              height: cropBoxHeight,
              maxWidth: "100%",
            }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
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
                  width: baseW,
                  height: baseH,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                  cursor: isDragging ? "grabbing" : "grab",
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
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-xs">
                {slotIndex === 0 ? "16:10" : "3:4"}
              </div>
            </div>

            {/* Hint drag */}
            <div className="absolute top-2 left-2 bg-black/60 text-white/90 text-[10px] font-semibold px-2 py-1 rounded-md pointer-events-none backdrop-blur-xs flex items-center gap-1.5">
              <span>✋</span>
              <span>Kéo để căn góc đẹp</span>
            </div>
          </div>

          {/* Controls: Zoom & Re-center */}
          <div className="mt-4 w-full max-w-md bg-white rounded-2xl p-3 border border-apple-red/15 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => handleZoomChange(zoom - 0.2)}
                className="w-8 h-8 rounded-xl bg-apple-red-50 text-apple-red hover:bg-apple-red hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
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
                className="flex-1 accent-apple-red cursor-pointer"
              />

              <button
                type="button"
                onClick={() => handleZoomChange(zoom + 0.2)}
                className="w-8 h-8 rounded-xl bg-apple-red-50 text-apple-red hover:bg-apple-red hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                title="Phóng to"
              >
                +
              </button>

              <span className="text-[11px] font-bold text-[#4A2810]/70 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetCenter}
              className="px-2.5 py-1.5 rounded-xl border border-apple-red/20 text-[#4A2810] hover:bg-apple-red-50 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
              title="Đặt lại vị trí giữa"
            >
              <span>🎯</span>
              <span>Căn giữa</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-white border-t border-apple-red/15 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-apple-red/20 text-[#4A2810] text-xs sm:text-sm font-bold hover:bg-apple-red-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirmCrop}
            disabled={isProcessing}
            className="px-5 py-2.5 bg-apple-red text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-apple-red/30 hover:bg-apple-red-dark active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>Đang xử lý & lưu ảnh...</span>
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
