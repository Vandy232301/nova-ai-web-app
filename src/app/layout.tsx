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
    "AI-powered software development: Senior engineers + artificial intelligence deliver predictable costs, clear timelines, and zero wasted weeks. From idea to production in record time.",
  metadataBase: new URL("https://nova-ai-web-app.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "NOVA — Build software faster with AI-powered precision",
    description: "Senior engineers + artificial intelligence. Predictable costs. Clear timelines. No wasted weeks. Transform your idea into production-ready software.",
    type: "website",
    url: "https://nova.vandy.ro",
    images: [
      {
        url: "/og-image-v2.jpg?v=" + Date.now(),
        width: 1200,
        height: 630,
        alt: "NOVA - AI-powered software development",
      },
    ],
    siteName: "NOVA",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOVA — Build software faster with AI-powered precision",
    description: "Senior engineers + AI. Predictable costs. Clear timelines. No wasted weeks.",
    images: ["/og-image-v2.jpg?v=" + Date.now()],
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
        <link rel="icon" href="/favicon-32.png" sizes="32x32" />
        <link rel="icon" href="/favicon-16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preload" href="/nova-logo-icon.png" as="image" />
        {/* App-like experience on mobile */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NOVA" />
        <meta name="theme-color" content="#050508" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${novaSans.variable} antialiased bg-[#050508] text-white`}
        style={{ minHeight: '-webkit-fill-available' }}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
        <div className="nova-gradient-layer" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}

