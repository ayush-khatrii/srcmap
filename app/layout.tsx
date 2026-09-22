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
const SITE_TITLE = "Srcmap — Explore GitHub Repositories Without the Setup";
const SITE_DESCRIPTION =
  "Srcmap opens public GitHub repositories in a VS Code-style workspace in your browser. Browse folders, read syntax-highlighted code, search within files, and share links straight to the file and search you found.";

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
    "explore GitHub code",
    "code viewer",
    "syntax highlighting",
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
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: ["/logo.png"],
    apple: [
      { url: "/logo.png" },
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
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: `${SITE_NAME} logo`,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/logo.png"],
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
