import fs from "fs";
import path from "path";
import { DEFAULT_SETTINGS, SiteSettings } from "./defaultData";
import { getSupabaseClient } from "./supabase";

const DATA_FILE_PATH = path.join(process.cwd(), ".admin_settings_cache.json");

export async function getServerSettings(): Promise<SiteSettings> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("key, value");

      if (!error && data && data.length > 0) {
        const settingsMap: Record<string, string> = {};
        for (const row of data) {
          settingsMap[row.key] = row.value;
        }

        return {
          gallery_images: settingsMap.gallery_images
            ? JSON.parse(settingsMap.gallery_images)
            : DEFAULT_SETTINGS.gallery_images,
          pricing_normal: settingsMap.pricing_normal
            ? JSON.parse(settingsMap.pricing_normal)
            : DEFAULT_SETTINGS.pricing_normal,
          pricing_chibi: settingsMap.pricing_chibi
            ? JSON.parse(settingsMap.pricing_chibi)
            : DEFAULT_SETTINGS.pricing_chibi,
          pricing_ych: settingsMap.pricing_ych
            ? JSON.parse(settingsMap.pricing_ych)
            : DEFAULT_SETTINGS.pricing_ych,
          pricing_notes: settingsMap.pricing_notes
            ? JSON.parse(settingsMap.pricing_notes)
            : DEFAULT_SETTINGS.pricing_notes,
          tos_sections: settingsMap.tos_sections
            ? JSON.parse(settingsMap.tos_sections)
            : DEFAULT_SETTINGS.tos_sections,
          about_me: settingsMap.about_me
            ? JSON.parse(settingsMap.about_me)
            : DEFAULT_SETTINGS.about_me,
          gallery_version: settingsMap.gallery_version || "1",
        };
      }
    } catch (err) {
      console.warn("[ServerStore] Supabase fetch failed, falling back to local storage:", err);
    }
  }

  // Fallback to local file cache if Supabase not yet set up
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn("[ServerStore] Local cache read error:", err);
  }

  return DEFAULT_SETTINGS;
}

export async function saveServerSettings(
  updated: Partial<SiteSettings>
): Promise<{ success: boolean; version: string; error?: string; settings: SiteSettings }> {
  const current = await getServerSettings();
  const version = Date.now().toString();
  const nextSettings: SiteSettings = {
    ...current,
    ...updated,
    gallery_version: version,
  };

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const entries: { key: string; value: string }[] = [
        { key: "gallery_images", value: JSON.stringify(nextSettings.gallery_images) },
        { key: "pricing_normal", value: JSON.stringify(nextSettings.pricing_normal) },
        { key: "pricing_chibi", value: JSON.stringify(nextSettings.pricing_chibi) },
        { key: "pricing_ych", value: JSON.stringify(nextSettings.pricing_ych) },
        { key: "pricing_notes", value: JSON.stringify(nextSettings.pricing_notes) },
        { key: "tos_sections", value: JSON.stringify(nextSettings.tos_sections) },
        { key: "about_me", value: JSON.stringify(nextSettings.about_me) },
        { key: "gallery_version", value: version },
      ];

      // Upsert batch một lần duy nhất
      const { error: upsertError } = await supabase
        .from("admin_settings")
        .upsert(entries, { onConflict: "key" });

      if (upsertError) {
        console.error("[ServerStore] Supabase batch upsert error:", upsertError);
      }
    } catch (err) {
      console.warn("[ServerStore] Supabase write failed, falling back to local file:", err);
    }
  }

  // Luôn cập nhật file cache local dự phòng
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(nextSettings, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ServerStore] Local file save warning:", err);
  }

  return { success: true, version, settings: nextSettings };
}
