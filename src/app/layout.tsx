import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const novaSans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-nova-sans",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050508",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "NOVA — Build software. Talk to AI.",
  description:
    "NOVA is an AI-powered software development company. Senior engineers + artificial intelligence for clear, structured, predictable software development.",
  metadataBase: new URL("https://nova.dev"),
  openGraph: {
    title: "NOVA — Build software with AI-powered precision",
    description: "Senior engineers + AI. No guesswork. No wasted weeks. Just clear, predictable software development.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* App-like experience on mobile */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NOVA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${novaSans.variable} antialiased bg-[#050508] text-white`}
      >
        <div className="nova-gradient-layer" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}

