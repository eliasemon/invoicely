import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Invorio',
  description: 'Learn how Invorio collects, uses, encrypts, and protects your personal data, business profiles, and invoice records in accordance with GDPR, CCPA, and global privacy standards.',
  openGraph: {
    title: 'Privacy Policy | Invorio',
    description: 'Learn how Invorio collects, uses, encrypts, and protects your personal data, business profiles, and invoice records.',
    url: '/privacy',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Invorio',
    description: 'Learn how Invorio collects, uses, encrypts, and protects your personal data and invoice records.',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
