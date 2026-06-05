import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice Templates | Invorio",
  description: "Explore and preview a wide range of professional, customizable invoice templates. Find the perfect design for your business.",
  openGraph: {
    title: "Invoice Templates | Invorio",
    description: "Explore and preview a wide range of professional, customizable invoice templates.",
    url: "/templates",
  },
  twitter: {
    title: "Invoice Templates | Invorio",
    description: "Explore and preview a wide range of professional, customizable invoice templates.",
  },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
