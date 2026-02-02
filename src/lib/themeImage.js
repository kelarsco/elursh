/**
 * Resolve theme image: prefer asset by theme name from @/data/themes; else theme.image (URL/data URL); else placeholder.
 */
import { THEME_NAME_TO_IMAGE } from "@/data/themes";

const PLACEHOLDER = "https://picsum.photos/seed/theme/400/300";

/**
 * Get image URL for a theme: use asset matching theme name first; else theme.image; else placeholder.
 * @param {{ name?: string; image?: string | null }} theme
 * @returns {string}
 */
export function getThemeImageUrl(theme) {
  const name = (theme?.name ?? "").toString().trim();
  const asset = name ? THEME_NAME_TO_IMAGE[name] : undefined;
  if (asset) return asset;
  const img = theme?.image;
  if (img && typeof img === "string" && img.trim() !== "") return img.trim();
  return PLACEHOLDER;
}
