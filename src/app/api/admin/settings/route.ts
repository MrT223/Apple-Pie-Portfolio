import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { saveServerSettings, getServerSettings } from "@/lib/serverStore";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { success: false, message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = await saveServerSettings(body);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[API /api/admin/settings POST] Error:", err);
    return NextResponse.json(
      { success: false, message: "Lỗi cập nhật cấu hình" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { success: false, message: "Chưa xác thực" },
        { status: 401 }
      );
    }

    const settings = await getServerSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (err) {
    console.error("[API /api/admin/settings GET] Error:", err);
    return NextResponse.json(
      { success: false, message: "Lỗi lấy dữ liệu" },
      { status: 500 }
    );
  }
}
