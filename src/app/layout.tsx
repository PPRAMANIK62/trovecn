import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

import { themeInitScript } from "@/lib/theme-script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "trove/cn — a collected component registry";
const description = "A curated registry of premium UI patterns, ready to install.";

export const metadata: Metadata = {
  metadataBase: new URL("https://trovecn.dev"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://trovecn.dev",
    siteName: "trove/cn",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@ppramanik62",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
        <Analytics />
      </body>
    </html>
  );
}
