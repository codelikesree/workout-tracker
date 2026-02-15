import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/workouts", "/templates", "/analytics"],
        disallow: ["/api/", "/dashboard/", "/profile/", "/import/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/workouts", "/templates"],
        disallow: ["/api/", "/dashboard/", "/profile/", "/import/"],
        crawlDelay: 0,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
