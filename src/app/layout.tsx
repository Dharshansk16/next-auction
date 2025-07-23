import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/theme-provider";
import { AuctionProvider } from "@/contexts/AuctionContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Auction - Cricket Team Auction Platform",
  description:
    "Run smooth cricket team auctions with Next Auction — a web-based auction management system. Used in real tournaments like Baarish Cup. Create teams, bid on players, track budgets, and export results with ease.",
  other: {
    "google-site-verification": "5jNvbJ8mYEJMoCgI0DhwfkJnKumBz82SiXFC8oKoeuA",
  },
  keywords: [
    "cricket auction",
    "auction app",
    "cricket team bidding",
    "sports auction tool",
    "react cricket app",
    "nextjs auction app",
    "local tournament auction",
    "player auction system",
    "cricket tournament manager",
  ],
  authors: [
    { name: "Dharshan S Kotian", url: "https://github.com/Dharshansk16" },
  ],
  creator: "Dharshan S Kotian",
  metadataBase: new URL("https://next-auctioner.vercel.app"),
  openGraph: {
    title: "Next Auction - Cricket Team Auction Platform",
    description:
      "Web-based cricket auction app to manage teams, bidding, budgets, and results. Used in the Baarish Cup tournament.",
    url: "https://next-auctioner.vercel.app",
    siteName: "Next Auction",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Next Auction App - Cricket Auction Demo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuctionProvider>{children}</AuctionProvider>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
