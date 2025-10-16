// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Montserrat_Alternates } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ConvexClientProvider from "@/app/ConvexClientProvider"; // Adjust path if necessary
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary"; // Ensure this file exists at components/ErrorBoundary.tsx with proper exports/types

import Progress from "@/components/Progress";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

const inter = Montserrat_Alternates({ 
  weight: "500", 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.travelplannerai.site"),
  title: {
    default: "Travel Planner AI - Your Smart Travel Planner",
    template: "%s | Travel Planner AI - Your Smart Travel Planner",
  },
  description:
    "Travel Planner AI provides intelligent travel suggestions, personalized itineraries, and seamless trip planning. Plan your perfect trip with ease.",
  keywords:
    "travel planner, AI travel planner, smart travel, travel suggestions, destination insights, personalized itineraries, trip planning, travel tips, vacation planning",
  openGraph: {
    title: "Travel Planner AI - Your Smart Travel Planner",
    description:
      "Travel Planner AI provides intelligent travel suggestions, personalized itineraries, and seamless trip planning. Plan your perfect trip with ease.",
    url: "https://www.travelplannerai.site",
    type: "website",
    siteName: "TravelPlannerAI",
    images: [
      {
        url: "opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Travel Planner AI",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${inter.className} ${inter.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ConvexClientProvider>{children}</ConvexClientProvider>
            <Progress />
            <Analytics />
            <Toaster />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}