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

export const metadata: Metadata = {
  title: "SrcPeek — Explore a Repository",
  description: "Browse and understand public GitHub repositories in your browser.",
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
