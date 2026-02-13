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
  viewportFit: "cover", // Enables full-screen coverage when installed as PWA
  height: "device-height",
};

export const metadata: Metadata = {
  title: "NOVA — Build software. Talk to AI.",
  description:
    "AI-powered software development: Senior engineers + artificial intelligence deliver predictable costs, clear timelines, and zero wasted weeks. From idea to production in record time.",
  metadataBase: new URL("https://nova-ai-web-app.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png?v=2", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
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
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicon-32.png?v=2" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon-16.png?v=2" sizes="16x16" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
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
        className={`${novaSans.variable} antialiased text-white`}
        style={{ 
          minHeight: '-webkit-fill-available',
          height: '100vh',
          width: '100vw',
          position: 'relative',
          backgroundColor: '#050508',
          margin: 0,
          padding: 0,
        }}
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
        {/* Animated gradient background layer - provides the background */}
        <div 
          className="nova-gradient-layer" 
          aria-hidden="true" 
          style={{ 
            display: 'block', 
            opacity: 1, 
            visibility: 'visible', 
            zIndex: -1,
            top: 'calc(-1 * env(safe-area-inset-top, 0px))',
            left: 'calc(-1 * env(safe-area-inset-left, 0px))',
            right: 'calc(-1 * env(safe-area-inset-right, 0px))',
            bottom: 'calc(-1 * env(safe-area-inset-bottom, 0px))',
            width: 'calc(100vw + env(safe-area-inset-left, 0px) + env(safe-area-inset-right, 0px))',
            height: 'calc(100vh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))',
            minHeight: 'calc(100dvh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))',
          }} 
        />
        {children}
      </body>
    </html>
  );
}

