import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Invorio',
  description: 'Read the Terms of Service for Invorio. Review user agreements, invoice generation rules, digital signature conditions, acceptable use, and platform terms.',
  openGraph: {
    title: 'Terms of Service | Invorio',
    description: 'Read the Terms of Service for Invorio. Review user agreements, invoice rules, and legal terms.',
    url: '/terms',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | Invorio',
    description: 'Read the Terms of Service for Invorio.',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
