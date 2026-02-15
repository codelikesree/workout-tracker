import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const currentDate = new Date();

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Dynamic routes - workouts (public if shared)
  // Note: Add actual workout IDs if you have public workout pages
  // const workouts = await fetchPublicWorkouts();
  // const workoutUrls = workouts.map((workout) => ({
  //   url: `${baseUrl}/workouts/${workout.id}`,
  //   lastModified: workout.updatedAt,
  //   changeFrequency: "weekly" as const,
  //   priority: 0.7,
  // }));

  // Dynamic routes - templates (if public)
  // const templates = await fetchPublicTemplates();
  // const templateUrls = templates.map((template) => ({
  //   url: `${baseUrl}/templates/${template.id}`,
  //   lastModified: template.updatedAt,
  //   changeFrequency: "weekly" as const,
  //   priority: 0.6,
  // }));

  return routes;
}
