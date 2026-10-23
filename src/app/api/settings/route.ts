import { NextResponse } from "next/server";
import { getServerSettings } from "@/lib/serverStore";

export async function GET() {
  try {
    const settings = await getServerSettings();

    // Cache header following DATABASE_API_ARCHITECTURE_GUIDE.md Section 5.2
    return NextResponse.json(settings, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[API /api/settings] Error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
