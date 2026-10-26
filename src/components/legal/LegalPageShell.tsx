'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

export interface LegalSection {
  id: string;
  title: string;
  summary?: string;
  subsections?: { id: string; title: string }[];
}

export interface HighlightCard {
  icon: string;
  title: string;
  description: string;
}

export interface LegalPageShellProps {
  currentDoc: 'privacy' | 'terms';
  title: string;
  subtitle: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  readingTime: string;
  highlights: HighlightCard[];
  sections: LegalSection[];
  children: React.ReactNode;
}

export function LegalPageShell({
  currentDoc,
  title,
  subtitle,
  version,
  effectiveDate,
  lastUpdated,
  readingTime,
  highlights,
  sections,
  children,
}: Readonly<LegalPageShellProps>) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ScrollSpy to highlight active section in table of contents
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      let current = sections[0]?.id || '';

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-primary-fixed selection:text-primary">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-surface/90 dark:bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 print:hidden transition-colors">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between h-16 px-margin-mobile md:px-margin-desktop">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-xs group">
            <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <MaterialIcon icon="account_balance_wallet" filled className="text-xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-headline-md font-headline-md font-bold tracking-tight text-primary leading-tight">
                Invorio
              </span>
              <span className="font-label-caps text-[10px] tracking-widest text-on-surface-variant uppercase">
                Legal Center
              </span>
            </div>
          </Link>

          {/* Central Document Switcher Tabs */}
          <nav aria-label="Legal Documents" className="hidden sm:flex items-center bg-surface-container-high p-1 rounded-xl border border-outline-variant/20 shadow-xs">
            <Link
              href="/privacy"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-label-sm text-label-sm font-medium transition-all duration-200 ${
                currentDoc === 'privacy'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface/50'
              }`}
            >
              <MaterialIcon
                icon="shield"
                filled={currentDoc === 'privacy'}
                className="text-base"
              />
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-label-sm text-label-sm font-medium transition-all duration-200 ${
                currentDoc === 'terms'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface/50'
              }`}
            >
              <MaterialIcon
                icon="gavel"
                filled={currentDoc === 'terms'}
                className="text-base"
              />
              Terms of Service
            </Link>
          </nav>

          {/* Right Action Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/templates"
              className="hidden md:inline-flex items-center gap-1 text-on-surface-variant hover:text-primary font-label-sm text-label-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              <MaterialIcon icon="visibility" className="text-base" />
              Templates
            </Link>
            <Link
              href="/dashboard"
              className="bg-primary text-on-primary font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-95 shadow-xs flex items-center gap-1.5"
            >
              <span>App Dashboard</span>
              <MaterialIcon icon="arrow_forward" className="text-sm" />
            </Link>
          </div>
        </div>

        {/* Mobile Switcher Bar */}
        <div className="sm:hidden border-t border-outline-variant/20 px-4 py-2 bg-surface-container-low flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Link
              href="/privacy"
              className={`flex-1 text-center py-1.5 px-2 rounded-md font-label-sm text-label-sm transition-colors ${
                currentDoc === 'privacy'
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant bg-surface hover:text-primary'
              }`}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className={`flex-1 text-center py-1.5 px-2 rounded-md font-label-sm text-label-sm transition-colors ${
                currentDoc === 'terms'
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant bg-surface hover:text-primary'
              }`}
            >
              Terms
            </Link>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-surface text-primary border border-outline-variant/40 font-label-sm text-label-sm"
            aria-label="Toggle Table of Contents"
          >
            <MaterialIcon icon="format_list_bulleted" className="text-base" />
            <span>TOC</span>
          </button>
        </div>

        {/* Mobile TOC Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-outline-variant/20 bg-surface-container-lowest p-4 max-h-[60vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                Sections in this document
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-on-surface-variant hover:text-primary p-1"
                aria-label="Close Table of Contents"
              >
                <MaterialIcon icon="close" className="text-lg" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className={`text-left px-2.5 py-1.5 rounded-md text-sm transition-colors flex items-start gap-2 ${
                    activeSection === sec.id
                      ? 'bg-primary text-on-primary font-medium'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="opacity-60 text-xs mt-0.5">{idx + 1}.</span>
                  <span>{sec.title}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-6 print:hidden">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <MaterialIcon icon="chevron_right" className="text-sm opacity-50" />
          <span>Legal</span>
          <MaterialIcon icon="chevron_right" className="text-sm opacity-50" />
          <span className="text-primary font-medium">{title}</span>
        </nav>

        {/* Hero Section */}
        <div className="border-b border-outline-variant/30 pb-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-[800px]">
              <div className="inline-flex items-center gap-2 bg-primary-fixed/30 text-primary px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse" />
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold">
                  Official Policy · Version {version}
                </span>
              </div>
              <h1 className="font-headline-lg-mobile text-3xl md:text-5xl font-bold tracking-tight text-primary">
                {title}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[65ch] leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Utility Actions (Print / Copy / Timestamps) */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-sm text-label-sm transition-colors border border-outline-variant/30 active:scale-95"
                  title="Copy direct link to this page"
                >
                  <MaterialIcon icon={copiedLink ? "check" : "link"} className="text-base text-primary" />
                  <span>{copiedLink ? "Copied Link!" : "Copy Link"}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-sm text-label-sm transition-colors border border-outline-variant/30 active:scale-95"
                  title="Print or save as PDF"
                >
                  <MaterialIcon icon="print" className="text-base text-primary" />
                  <span>Print / PDF</span>
                </button>
              </div>

              <div className="text-xs text-on-surface-variant space-y-0.5 text-left md:text-right">
                <div>Effective: <span className="font-semibold text-primary">{effectiveDate}</span></div>
                <div>Last Updated: <span className="font-semibold text-primary">{lastUpdated}</span></div>
                <div className="flex items-center gap-1 text-[11px] opacity-80 md:justify-end">
                  <MaterialIcon icon="schedule" className="text-xs" />
                  <span>{readingTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Highlights / Executive Summary Cards */}
          {highlights && highlights.length > 0 && (
            <div className="mt-8 pt-6 border-t border-outline-variant/20">
              <div className="flex items-center gap-2 mb-3">
                <MaterialIcon icon="verified" filled className="text-primary text-base" />
                <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-primary font-bold">
                  Quick Summary · Key Principles at a Glance
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {highlights.map((h) => (
                  <div
                    key={h.title}
                    className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 hover:border-outline-variant transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center mb-2">
                      <MaterialIcon icon={h.icon} filled className="text-lg" />
                    </div>
                    <div className="font-bold text-sm text-primary mb-1">{h.title}</div>
                    <div className="text-xs text-on-surface-variant leading-relaxed">
                      {h.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Two-Column Grid: Sticky TOC on Left, Full Legal Content on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Desktop Sticky Table of Contents Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 print:hidden space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <MaterialIcon icon="toc" className="text-primary text-lg" />
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary font-bold">
                    Table of Contents
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {sections.length} Sections
                </span>
              </div>

              <nav aria-label="Table of Contents" className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {sections.map((section, idx) => {
                  const isActive = activeSection === section.id;
                  return (
                    <div key={section.id} className="group">
                      <button
                        onClick={() => scrollTo(section.id)}
                        className={`w-full text-left py-1.5 px-3 rounded-lg text-xs leading-snug transition-all flex items-start gap-2 ${
                          isActive
                            ? 'bg-primary text-on-primary font-semibold shadow-xs'
                            : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                        }`}
                      >
                        <span className={`font-mono text-[10px] mt-0.5 ${isActive ? 'opacity-90' : 'opacity-60'}`}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1">{section.title}</span>
                      </button>

                      {/* Subsections if available */}
                      {section.subsections && section.subsections.length > 0 && isActive && (
                        <div className="ml-6 pl-2 border-l border-outline-variant/40 my-1 space-y-0.5">
                          {section.subsections.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => scrollTo(sub.id)}
                              className="w-full text-left py-1 px-2 text-[11px] text-on-surface-variant hover:text-primary transition-colors block truncate"
                            >
                              {sub.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Quick Document Cross-link Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0">
                  <MaterialIcon icon={currentDoc === 'privacy' ? 'gavel' : 'shield'} filled className="text-xl" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-primary">
                    {currentDoc === 'privacy' ? 'Looking for our Terms of Service?' : 'Looking for our Privacy Policy?'}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {currentDoc === 'privacy'
                      ? 'Read our platform rules, billing disclosures, digital signature terms, and customer rights.'
                      : 'Learn about our data collection, GDPR/CCPA rights, and how we safeguard your invoices.'}
                  </p>
                  <Link
                    href={currentDoc === 'privacy' ? '/terms' : '/privacy'}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-1"
                  >
                    <span>{currentDoc === 'privacy' ? 'View Terms of Service' : 'View Privacy Policy'}</span>
                    <MaterialIcon icon="arrow_forward" className="text-xs" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Support / Contact Card */}
            <div className="border border-outline-variant/30 rounded-2xl p-5 bg-surface-container-lowest">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon icon="contact_support" className="text-primary text-base" />
                <span className="font-bold text-xs uppercase tracking-wider text-primary">
                  Legal & Compliance Inquiries
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                Have specific compliance, enterprise DPA, or regulatory questions? Reach our Data Protection Officer directly.
              </p>
              <a
                href="mailto:legal@invorio.app"
                className="w-full py-2 px-3 rounded-lg border border-outline-variant text-center block text-xs font-semibold text-primary hover:bg-surface-container transition-colors"
              >
                legal@invorio.app
              </a>
            </div>
          </aside>

          {/* Legal Prose Content Column */}
          <article className="lg:col-span-8 space-y-12 prose prose-slate max-w-none">
            {children}

            {/* Bottom Document Switcher & Signoff */}
            <div className="border-t border-outline-variant/30 pt-8 mt-12 print:hidden">
              <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-primary">
                    Questions regarding these terms?
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Our compliance team is available Monday through Friday to address privacy and licensing questions.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="mailto:legal@invorio.app"
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary-container transition-colors shadow-xs"
                  >
                    Contact Legal Team
                  </a>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-2 border border-outline-variant rounded-lg text-xs font-medium text-primary hover:bg-surface transition-colors"
                  >
                    Print Copy
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="bg-surface-container-lowest w-full py-10 border-t border-outline-variant/20 mt-16 print:hidden">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                <MaterialIcon icon="account_balance_wallet" filled className="text-lg" />
              </div>
              <span className="font-headline-md text-headline-md font-bold text-primary">Invorio</span>
              <span className="text-xs text-on-surface-variant pl-2 border-l border-outline-variant">
                Professional Invoicing Platform
              </span>
            </div>

            <nav aria-label="Footer Navigation" className="flex flex-wrap justify-center gap-6 text-xs text-on-surface-variant">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/templates" className="hover:text-primary transition-colors">Templates</Link>
              <Link href="/privacy" className={`hover:text-primary transition-colors ${currentDoc === 'privacy' ? 'text-primary font-bold' : ''}`}>
                Privacy Policy
              </Link>
              <Link href="/terms" className={`hover:text-primary transition-colors ${currentDoc === 'terms' ? 'text-primary font-bold' : ''}`}>
                Terms of Service
              </Link>
              <a href="mailto:support@invorio.app" className="hover:text-primary transition-colors">Contact Support</a>
            </nav>

            <div className="text-xs text-on-surface-variant text-center md:text-right">
              © {new Date().getFullYear()} Invorio Inc. All rights reserved.
            </div>
          </div>
          <div className="text-[11px] text-on-surface-variant/70 text-center border-t border-outline-variant/10 pt-4">
            Invorio provides digital invoice creation and billing management tools. Invorio is not a banking institution, money transmitter, or licensed legal advisor.
          </div>
        </div>
      </footer>
    </div>
  );
}
