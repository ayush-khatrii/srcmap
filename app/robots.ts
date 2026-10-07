import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://srcmap.cc/sitemap.xml",
    host: "https://srcmap.cc",
  };
}
