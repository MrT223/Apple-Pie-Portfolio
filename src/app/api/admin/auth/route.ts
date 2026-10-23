import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, generateAdminToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập mật khẩu" },
        { status: 400 }
      );
    }

    if (!checkAdminPassword(password.trim())) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu quản trị không chính xác!" },
        { status: 401 }
      );
    }

    const token = generateAdminToken(password.trim());
    return NextResponse.json({
      success: true,
      token,
      message: "Đăng nhập admin thành công",
    });
  } catch (err) {
    console.error("[API /api/admin/auth] Error:", err);
    return NextResponse.json(
      { success: false, message: "Lỗi xử lý xác thực" },
      { status: 500 }
    );
  }
}
