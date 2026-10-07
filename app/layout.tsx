import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { CodeThemeProvider } from "@/components/code-theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geistHeading = Geist({ subsets: ['latin'], variable: '--font-heading' });

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://srcmap.cc";
const SITE_NAME = "Srcmap";
const SITE_TITLE = "Srcmap — Explore GitHub Repositories Online Without Cloning";
const SITE_DESCRIPTION =
  "Explore a GitHub repository without cloning. Srcmap is a VS Code-like online workspace to browse repository files, view source code online, and explore code in your browser.";

export const metadata: Metadata = {
   verification: {
    google: "3hp8pbeNlLvW8x4Mn98u9_nGPqh9GIj1kpGRvRHkv7M"
  },
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "GitHub repository browser",
    "explore GitHub repository without cloning",
    "explore GitHub repositories online",
    "VS Code-like workspace online",
    "VS Code-style repository browser",
    "view GitHub code online",
    "view source code online",
    "explore code online without cloning",
    "online GitHub code viewer",
    "browse GitHub repository files in browser",
    "read source code online",
    "GitHub file search",
    "VS Code style browser",
    "Srcmap",
  ],
  authors: [{ name: "Ayush Khatri", url: "https://github.com/ayush-khatrii" }],
  creator: "Ayush Khatri",
  publisher: "Ayush Khatri",
  category: "technology",
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg" },
    ],
    shortcut: ["/logo.svg"],
    apple: [
      { url: "/logo.svg" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: `${SITE_NAME} logo`,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", outfit.variable, geistHeading.variable)}
    >
      <body className="h-dvh overflow-hidden">
        <ThemeProvider>
          <CodeThemeProvider>
            <NuqsAdapter><QueryProvider>{children}</QueryProvider></NuqsAdapter>
          </CodeThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
