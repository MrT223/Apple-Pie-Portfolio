"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SiteSettings, DEFAULT_SETTINGS } from "./defaultData";
import { idbGet, idbSet } from "./idb";

interface SettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  refreshSettings: async () => {},
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLatest = useCallback(async (currentLocalVersion?: string) => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) return;
      const data: SiteSettings = await res.json();

      if (data && (!currentLocalVersion || data.gallery_version !== currentLocalVersion)) {
        setSettings(data);
        await idbSet("site_settings", data);
        await idbSet("gallery_version", data.gallery_version || "1");
      }
    } catch (err) {
      console.warn("[Settings] Background fetch error:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1. Instant load from IndexedDB (0ms)
      const cached = await idbGet<SiteSettings>("site_settings");
      const localVersion = await idbGet<string>("gallery_version");

      if (cached && mounted) {
        setSettings(cached);
        setIsLoading(false);
      }

      // 2. Background Revalidation (Stale-While-Revalidate)
      await fetchLatest(localVersion || undefined);
      if (mounted) setIsLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, [fetchLatest]);

  const refreshSettings = useCallback(async () => {
    await fetchLatest();
  }, [fetchLatest]);

  const updateSettings = useCallback((newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      idbSet("site_settings", updated);
      return updated;
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, isLoading, refreshSettings, updateSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
