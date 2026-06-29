import type { MetadataRoute } from "next";
import { allSlugs, getConverter } from "@/lib/conversions";
import { absoluteUrl } from "@/lib/site";

// Generated from allSlugs() — adding a converter adds a sitemap entry for free.
export default function sitemap(): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl("/"),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  };

  const pages = allSlugs().map((slug) => {
    const converter = getConverter(slug);
    return {
      url: absoluteUrl(`/${slug}`),
      lastModified: converter ? new Date(converter.updated) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    };
  });

  return [home, ...pages];
}
