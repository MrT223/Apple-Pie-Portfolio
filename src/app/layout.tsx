import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { FallingApples, FloatingLeaves } from "@/components/AppleAnimations";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#C0392B",
};

export const metadata: Metadata = {
  title: "🍎 Apple Artist — Commission Portfolio",
  description: "Digital artist portfolio & commission information. Illustrations, OC, fanart, chibi and more! コミッション受付中 ✿",
  keywords: ["digital art", "commission", "illustration", "chibi", "fanart", "artist portfolio"],
  openGraph: {
    title: "🍎 Apple Artist — Commission Portfolio",
    description: "Digital artist portfolio & commission information ✿",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-dvh bg-[#FAF4EB]">
        {/* Global ambient animations in background */}
        <FallingApples count={12} />
        <FloatingLeaves count={8} />

        {/* Centered mobile application container */}
        <div className="relative z-10 min-h-screen w-full max-w-md mx-auto bg-[#FFFDF9] shadow-2xl border-x border-apple-red/10 flex flex-col">
          <main className="flex-1 pb-24">
            {children}
          </main>

          {/* Bottom navigation snapped to mobile frame */}
          <Navigation />
        </div>
      </body>
    </html>
  );
}
