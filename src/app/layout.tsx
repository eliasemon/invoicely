import type { Metadata } from "next";
import { Inter, Work_Sans, Hanken_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/core/contexts/AuthContext";
import { DatabaseProvider } from "@/core/contexts/DatabaseContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL || 'https://invorio.app'),
  title: {
    default: "Invorio | Invoicing at the Speed of Business",
    template: "%s | Invorio",
  },
  description: "Create, send, and track professional invoices in seconds. Built for modern businesses demanding precision and clarity.",
  keywords: ["invoicing software", "billing", "create invoices", "Invorio", "online invoices", "business billing"],
  openGraph: {
    title: "Invorio | Invoicing at the Speed of Business",
    description: "Create, send, and track professional invoices in seconds.",
    url: "/",
    siteName: "Invorio",
    images: [
      {
        url: "/icon.svg", // Update with actual OG image if available
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invorio | Invoicing at the Speed of Business",
    description: "Create, send, and track professional invoices in seconds.",
    images: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${workSans.variable} ${hankenGrotesk.variable} antialiased min-h-full flex flex-col font-body-md`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <DatabaseProvider>
            {children}
          </DatabaseProvider>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
