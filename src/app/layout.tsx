import type { Metadata } from "next";
import { Inter, Work_Sans, Hanken_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/core/contexts/AuthContext";
import { DatabaseProvider } from "@/core/contexts/DatabaseContext";
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
  title: "Invorio",
  description: "Invoicing at the Speed of Business",
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
      </body>
    </html>
  );
}
