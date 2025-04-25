import { Metadata, Viewport } from "next";

// Các metadata mặc định
export const defaultMetadata: Metadata = {
  title: {
    default: "Football Detection - AI Video Analysis",
    template: "%s | Football Detection",
  },
  description:
    "Analyze football videos with AI to detect players, ball, and key events in real-time.",
  keywords: [
    "football detection",
    "soccer analysis",
    "AI video analysis",
    "football tracking",
    "player detection",
    "ball tracking",
  ],
  authors: [{ name: "Football Detection Team" }],
  creator: "Football Detection",
  publisher: "Football Detection",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://football-detection.example.com"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      vi: "/vi",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://football-detection.example.com",
    title: "Football Detection - AI Video Analysis",
    description:
      "Analyze football videos with AI to detect players, ball, and key events in real-time.",
    siteName: "Football Detection",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Football Detection - AI Video Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Football Detection - AI Video Analysis",
    description:
      "Analyze football videos with AI to detect players, ball, and key events in real-time.",
    images: ["/twitter-image.jpg"],
    creator: "@footballdetection",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
  category: "technology",
};

// Export viewport riêng biệt
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Tạo metadata cho từng trang cụ thể
export function generateMetadata({
  title,
  description,
  path = "",
  locale = "en",
}: {
  title?: string;
  description?: string;
  path?: string;
  locale?: string;
}): Metadata {
  const url = `https://football-detection.example.com/${locale}${path}`;

  return {
    ...defaultMetadata,
    title: title,
    description: description || defaultMetadata.description,
    alternates: {
      canonical: url,
      languages: {
        en: `https://football-detection.example.com/en${path}`,
        vi: `https://football-detection.example.com/vi${path}`,
      },
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      title: title || defaultMetadata.openGraph?.title,
      description: description || defaultMetadata.openGraph?.description,
      url,
      locale: locale === "en" ? "en_US" : "vi_VN",
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: title || defaultMetadata.twitter?.title,
      description: description || defaultMetadata.twitter?.description,
    },
  };
}
