import { NextResponse } from "next/server";
import { getServerSettings } from "@/lib/serverStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getServerSettings();

    // Luôn trả về dữ liệu mới nhất, phía client đã có IndexedDB cache 0ms
    return NextResponse.json(settings, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[API /api/settings] Error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

