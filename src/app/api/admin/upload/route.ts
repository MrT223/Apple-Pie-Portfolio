import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { getSupabaseClient, BUCKET_NAME } from "@/lib/supabase";
import fs from "fs";
import path from "path";

function extractStoragePath(url: string | null | undefined, bucketName: string): string | null {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("data:") || url.startsWith("blob:")) return null;

  const bucketMarker = `/storage/v1/object/public/${bucketName}/`;
  const markerIdx = url.indexOf(bucketMarker);
  if (markerIdx !== -1) {
    const rawPath = url.slice(markerIdx + bucketMarker.length);
    const cleanPath = rawPath.split("?")[0];
    return decodeURIComponent(cleanPath);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { success: false, message: "Chưa xác thực quyền quản trị" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customName = formData.get("name") as string | null;
    const oldUrl = formData.get("oldUrl") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy file tải lên" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "jpg";
    const filename = customName || `artwork-${Date.now()}.${ext}`;

    const supabase = getSupabaseClient();

    // 1. If Supabase is connected, upload to Supabase Storage bucket
    if (supabase) {
      try {
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filename, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filename);

          // Tự động xóa ảnh cũ trên Supabase Storage nếu có để giải phóng dung lượng
          if (oldUrl) {
            const oldPath = extractStoragePath(oldUrl, BUCKET_NAME);
            if (oldPath && oldPath !== filename) {
              try {
                const { error: removeError } = await supabase.storage
                  .from(BUCKET_NAME)
                  .remove([oldPath]);
                if (removeError) {
                  console.warn("[Upload] Cảnh báo không thể xóa ảnh cũ:", removeError);
                } else {
                  console.log(`[Upload] Đã xóa ảnh cũ trên Supabase thành công: ${oldPath}`);
                }
              } catch (delErr) {
                console.warn("[Upload] Lỗi xóa ảnh cũ:", delErr);
              }
            }
          }

          return NextResponse.json({
            success: true,
            url: publicData.publicUrl,
            storage: "supabase",
          });
        } else {
          console.warn("[Upload] Supabase Storage upload error:", uploadError);
        }
      } catch (storageErr) {
        console.warn("[Upload] Supabase Storage attempt failed:", storageErr);
      }
    }

    // 2. Fallback: Save to public/uploads directory for local dev
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);

      // Tự động xóa file cũ local nếu có
      if (oldUrl && oldUrl.startsWith("/uploads/")) {
        const oldLocalName = oldUrl.replace("/uploads/", "");
        const oldLocalPath = path.join(uploadDir, oldLocalName);
        if (fs.existsSync(oldLocalPath) && oldLocalName !== filename) {
          try {
            fs.unlinkSync(oldLocalPath);
            console.log(`[Upload] Đã xóa ảnh cũ local: ${oldLocalName}`);
          } catch (e) {
            console.warn("[Upload] Lỗi xóa ảnh cũ local:", e);
          }
        }
      }

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        storage: "local",
      });
    } catch (localErr) {
      console.warn("[Upload] Local save failed, fallback to base64:", localErr);
      // Fallback base64
      const base64 = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: base64,
        storage: "base64",
      });
    }
  } catch (err) {
    console.error("[API /api/admin/upload] Error:", err);
    return NextResponse.json(
      { success: false, message: "Lỗi trong quá trình upload ảnh" },
      { status: 500 }
    );
  }
}
