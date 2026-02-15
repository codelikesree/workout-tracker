/**
 * Centralized SEO Configuration
 * Used across the application for consistent metadata
 */

export const siteConfig = {
  name: "Workout Tracker",
  description:
    "Track your workouts, create custom templates, analyze your fitness progress with detailed analytics, and reach your fitness goals faster.",
  url:
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://workout-tracker-nu-five.vercel.app",
  ogImage: "/og-image.png",
  author: {
    name: "Workout Tracker Team",
    url: "https://workout-tracker-nu-five.vercel.app",
  },
  keywords: [
    "workout tracker",
    "fitness tracker",
    "exercise log",
    "gym tracker",
    "workout planner",
    "fitness app",
    "exercise tracker",
    "workout templates",
    "fitness analytics",
    "progressive overload",
    "strength training",
    "workout history",
    "fitness goals",
    "gym log",
    "workout journal",
  ],
  creator: "Workout Tracker",
  publisher: "Workout Tracker",
  locale: "en_US",
  type: "website",
} as const;

export const seoMetadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@workouttracker",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteConfig.url,
  },
};

export function generatePageMetadata({
  title,
  description,
  image,
  url,
  noIndex = false,
  keywords,
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
  keywords?: string[];
}) {
  const pageUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;
  const ogImage = image || siteConfig.ogImage;

  return {
    title,
    description,
    keywords: keywords || [...siteConfig.keywords],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@workouttracker",
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
