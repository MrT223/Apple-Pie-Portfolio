import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FallingApples, FloatingLeaves } from "@/components/AppleAnimations";
import { SettingsProvider } from "@/lib/useSettings";
import AppShell from "@/components/AppShell";

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
    <html lang="vi" data-scroll-behavior="smooth">
      <body className="antialiased min-h-dvh bg-[#FAF4EB] max-w-full overflow-x-hidden">
        {/* Global ambient animations in background */}
        <FallingApples count={12} />
        <FloatingLeaves count={8} />

        <SettingsProvider>
          <AppShell>{children}</AppShell>
        </SettingsProvider>
      </body>
    </html>
  );
}
