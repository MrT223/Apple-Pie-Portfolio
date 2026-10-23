"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    // Full-page admin dashboard layout with strict horizontal overflow protection
    return (
      <div className="relative z-10 min-h-screen w-full max-w-full overflow-x-hidden bg-[#FAF4EB]">
        <main className="w-full max-w-full overflow-x-hidden">{children}</main>
      </div>
    );
  }

  // Regular public website: centered cute mobile application layout with bottom navigation
  return (
    <div className="relative z-10 min-h-screen w-full max-w-md mx-auto bg-[#FFFDF9] shadow-2xl border-x border-apple-red/10 flex flex-col overflow-x-hidden">
      <main className="relative z-10 flex-1 pb-24 max-w-full overflow-x-hidden">{children}</main>
      <Navigation />
    </div>
  );
}
