/**
 * Single source of truth for the site's public base URL.
 *
 * Everything that needs an absolute URL — canonical tags, OpenGraph URLs,
 * the sitemap and robots.txt — imports `SITE_URL` from here. When the real
 * domain is finalised, change it in THIS ONE PLACE only.
 *
 * No trailing slash (helpers below add the slash where needed).
 */
export const SITE_URL = "https://placeholder.example.com";

/** Human-readable brand name, reused in metadata and the UI. */
export const SITE_NAME = "Unitwist";

/** Short tagline used in default metadata and the header. */
export const SITE_TAGLINE = "UK converters with a twist";

/** Build an absolute URL for a given path (path may start with or without "/"). */
export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean === "/" ? "" : clean}`;
}
