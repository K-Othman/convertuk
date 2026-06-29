import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Allow all crawlers and point them at the generated sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
