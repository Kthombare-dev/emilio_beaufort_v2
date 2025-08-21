import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { Suspense } from "react";
import { BagProvider } from "@/components/BagContext";
import { Toaster as ReactHotToastToaster } from "react-hot-toast";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Script from "next/script";
import ConditionalAutoFeedback from "@/components/ConditionalAutoFeedback";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://emiliobeaufort.com"),
  title: {
    default: "Emilio Beaufort | Luxury Temple Hair Extensions & Grooming",
    template: "%s | Emilio Beaufort",
  },
  description: "Discover Emilio Beaufort's luxury temple hair extensions and grooming products.",
  alternates: { canonical: "https://emiliobeaufort.com/" },
  openGraph: {
    title: "Emilio Beaufort | Luxury Temple Hair Extensions & Grooming",
    description: "Discover Emilio Beaufort's luxury temple hair extensions and grooming products.",
    url: "https://emiliobeaufort.com/",
    siteName: "Emilio Beaufort",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Luxury Temple Hair Extensions by Emilio Beaufort",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@emiliobeaufort",
    creator: "@emiliobeaufort",
    images: ["/og-image.jpg"],
  },
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <Script
          async
          id="adsense-script"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5512739027608050"
          crossOrigin="anonymous"
        />

        {/* Structured Data */}
        <Script
          id="site-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Emilio Beaufort",
              url: "https://emiliobeaufort.com",
              logo: "https://emiliobeaufort.com/favicon.ico",
              description: "Luxury temple hair extensions and grooming products.",
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} bg-white text-gray-900 font-sans`}>
        <BagProvider>
          <ConditionalNavbar />
          <main>{children}</main>
        </BagProvider>

        <Suspense fallback={null}>
          <ConditionalAutoFeedback />
          <GoogleAnalytics />
        </Suspense>

        <Toaster position="top-center" richColors />
        <ReactHotToastToaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
