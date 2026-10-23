import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { getSupabaseClient, BUCKET_NAME } from "@/lib/supabase";
import fs from "fs";
import path from "path";

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
