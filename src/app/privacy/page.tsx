'use client';

import React from 'react';
import Link from 'next/link';
import { LegalPageShell, HighlightCard, LegalSection } from '@/components/legal/LegalPageShell';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

const privacyHighlights: HighlightCard[] = [
  {
    icon: 'lock',
    title: 'Zero Data Selling',
    description: 'We do not sell, rent, or trade your personal data, customer contacts, or invoice details to advertisers or data brokers.',
  },
  {
    icon: 'enhanced_encryption',
    title: 'Enterprise Encryption',
    description: 'Your financial information, signatures, and invoices are encrypted via TLS 1.3 in transit and AES-256 at rest with Row-Level Security.',
  },
  {
    icon: 'person_check',
    title: 'You Own Your Data',
    description: 'You retain full ownership and control over your clients, products, invoices, and templates. Export or erase anytime.',
  },
  {
    icon: 'gavel',
    title: 'GDPR & CCPA Compliant',
    description: 'Full data subject rights honoring EU/UK GDPR, CCPA/CPRA, and global privacy standards with automated data deletion.',
  },
];

const privacySections: LegalSection[] = [
  { id: 'introduction', title: 'Introduction & Scope' },
  { id: 'roles', title: 'Data Controller vs. Data Processor' },
  { id: 'information-collected', title: 'Information We Collect' },
  { id: 'how-we-use', title: 'How We Use Data & Legal Bases' },
  { id: 'data-sharing', title: 'Data Sharing & Sub-Processors' },
  { id: 'public-invoices', title: 'Public Invoices & Client Privacy' },
  { id: 'cookies', title: 'Cookies & Storage Technologies' },
  { id: 'security', title: 'Security & Technical Safeguards' },
  { id: 'retention', title: 'Data Retention & Deletion' },
  { id: 'your-rights', title: 'Your Privacy Rights (GDPR & CCPA)' },
  { id: 'international-transfers', title: 'International Data Transfers' },
  { id: 'children', title: "Children's Privacy" },
  { id: 'updates', title: 'Changes to this Policy' },
  { id: 'contact', title: 'Contact & Data Protection Officer' },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      currentDoc="privacy"
      title="Privacy Policy"
      subtitle="At Invorio, we respect your privacy and are committed to protecting the confidentiality, integrity, and security of your business and financial records. This policy explains how we handle your information with the highest standards of data governance."
      version="2.4"
      effectiveDate="October 26, 2026"
      lastUpdated="October 26, 2026"
      readingTime="9 min read"
      highlights={privacyHighlights}
      sections={privacySections}
    >
      {/* 1. Introduction & Scope */}
      <section id="introduction" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">01</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Introduction & Scope</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          Welcome to <strong className="text-primary font-semibold">Invorio</strong> (&quot;Invorio&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). Invorio is a cloud-based software-as-a-service application operated at <code className="text-primary bg-surface-container px-1.5 py-0.5 rounded text-xs">https://invorio.app</code> designed to provide businesses, freelancers, agencies, and enterprises with tools to create, customize, calculate, manage, and dispatch professional digital invoices, quotations, and commercial billing documentation.
        </p>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          This Privacy Policy sets out how we collect, process, store, disclose, and safeguard personal information when you:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm text-on-surface">
          <li>Visit our public website, marketing materials, and documentation at <code className="text-primary bg-surface-container px-1.5 py-0.5 rounded text-xs">invorio.app</code>.</li>
          <li>Register for an Invorio account, authenticate via single sign-on (SSO), and use our authenticated web portal.</li>
          <li>Input, manage, and store client records, product catalogues, bank details, tax IDs, and digital signatures.</li>
          <li>Generate, share, or view public invoices, billing previews, and payment QR codes.</li>
        </ul>
        <div className="bg-primary-fixed/20 border-l-4 border-primary p-4 rounded-r-xl my-4">
          <p className="text-xs md:text-sm text-primary font-medium m-0 leading-relaxed">
            <strong>Key Guarantee:</strong> We do not sell your personal data, your business profile, or your clients&apos; invoice contents to any third party. Your business documents belong exclusively to you.
          </p>
        </div>
      </section>

      {/* 2. Data Controller vs. Data Processor */}
      <section id="roles" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">02</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Data Controller vs. Data Processor Roles</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          Depending on the nature of the data and your relationship with our platform, Invorio operates under distinct legal capacities defined under data protection frameworks like the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA):
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-low space-y-2">
            <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
              <MaterialIcon icon="shield_person" className="text-base" />
              <span>Invorio as Data Controller</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              We act as a Data Controller for information related to your account creation, billing registration, direct communications with our team, and diagnostic usage telemetry collected to operate, secure, and improve the platform.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-low space-y-2">
            <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
              <MaterialIcon icon="dataset" className="text-base" />
              <span>Invorio as Data Processor</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              When you enter your customers&apos; names, addresses, emails, and invoice line items into Invorio, you are the Data Controller of that customer information, and Invorio acts solely as a Data Processor performing services on your documented instructions.
            </p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant">
          If you are an enterprise or European economic entity requiring a signed Data Processing Addendum (DPA) incorporating Standard Contractual Clauses (SCCs), please contact our legal team at <a href="mailto:eliasemon0025@gmail.com" className="text-primary underline">eliasemon0025@gmail.com</a>.
        </p>
      </section>

      {/* 3. Information We Collect */}
      <section id="information-collected" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">03</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Information We Collect</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          We collect personal data across four main categories to deliver, power, and safeguard our services:
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
            <h3 className="font-bold text-sm text-primary mb-2 flex items-center gap-2">
              <MaterialIcon icon="badge" className="text-base text-primary" />
              A. Account & Business Profile Data
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
              Provided directly when you sign up, complete onboarding, or edit your company settings:
            </p>
            <ul className="list-disc pl-5 text-xs text-on-surface space-y-1">
              <li><strong>Contact & Identity:</strong> Full name, verified email address, phone number, and password hashes.</li>
              <li><strong>Corporate Credentials:</strong> Legal business name, company registration number, VAT / GST / TIN tax numbers, physical business address, business phone, website URL.</li>
              <li><strong>Settlement & Bank Coordinates:</strong> Bank name, account holder name, account numbers, IBAN, SWIFT / BIC codes, settlement instructions, and QR code targets.</li>
              <li><strong>Branding Assets & Signatures:</strong> Uploaded company logo, currency preferences, digital signatory name, and digitized handwritten signature vector/PNG files.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
            <h3 className="font-bold text-sm text-primary mb-2 flex items-center gap-2">
              <MaterialIcon icon="receipt_long" className="text-base text-primary" />
              B. Invoice & Client Directory Records
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
              Information you submit regarding transactions and customer relationships:
            </p>
            <ul className="list-disc pl-5 text-xs text-on-surface space-y-1">
              <li><strong>Client Identifiers:</strong> Client names, corporate entities, contact person, client email address, telephone numbers, and billing addresses.</li>
              <li><strong>Invoice Items & Amounts:</strong> Line item descriptions, category groupings, item quantities, hourly or unit rates, discounts, shipping charges, applied tax rates, subtotal calculations, and total settlement balances.</li>
              <li><strong>Payment Tracking:</strong> Status tags (Draft, Pending, Paid, Overdue, Cancelled), payment records, date stamps, and transaction reference memos.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
            <h3 className="font-bold text-sm text-primary mb-2 flex items-center gap-2">
              <MaterialIcon icon="devices" className="text-base text-primary" />
              C. Technical & Telemetry Information
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
              Collected automatically when you browse or interact with the Invorio application:
            </p>
            <ul className="list-disc pl-5 text-xs text-on-surface space-y-1">
              <li><strong>Device & Network Data:</strong> IP address, browser user-agent, operating system version, screen resolution, preferred language, internet service provider.</li>
              <li><strong>Usage & Navigation:</strong> Timestamps of visits, page load times, referring URLs, features accessed, template downloads, and interface error traces.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
            <h3 className="font-bold text-sm text-primary mb-2 flex items-center gap-2">
              <MaterialIcon icon="login" className="text-base text-primary" />
              D. Third-Party Identity Providers (Social Login)
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              If you authenticate using Google Social Login or Auth0 SSO, we receive your basic public profile, primary email address, authentication provider ID, and avatar image, strictly to authenticate your identity and populate your user profile.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How We Use Your Information & Legal Bases */}
      <section id="how-we-use" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">04</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">How We Use Data & Legal Bases</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          Under European data protection laws (GDPR Art. 6) and global privacy requirements, we must have a lawful basis for every processing activity:
        </p>

        <div className="overflow-x-auto my-4 border border-outline-variant/40 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container border-b border-outline-variant/30 font-semibold text-primary">
              <tr>
                <th className="p-3">Processing Purpose</th>
                <th className="p-3">Data Categories</th>
                <th className="p-3">Legal Basis (GDPR Art. 6)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest text-on-surface-variant">
              <tr>
                <td className="p-3 font-medium text-primary">Creating and managing user accounts</td>
                <td className="p-3">Name, email, password hash, business details</td>
                <td className="p-3">Performance of Contract (Art. 6(1)(b))</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-primary">Generating invoices, PDFs & QR payment codes</td>
                <td className="p-3">Invoice items, client contacts, bank details, signatures</td>
                <td className="p-3">Performance of Contract (Art. 6(1)(b))</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-primary">Facilitating public invoice verification links</td>
                <td className="p-3">Invoice snapshot, client name, payment status</td>
                <td className="p-3">Performance of Contract (Art. 6(1)(b))</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-primary">Security, fraud detection & abuse prevention</td>
                <td className="p-3">IP address, audit logs, login timestamps</td>
                <td className="p-3">Legitimate Interest (Art. 6(1)(f))</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-primary">Transactional email alerts & verification</td>
                <td className="p-3">Email address, verification tokens</td>
                <td className="p-3">Performance of Contract (Art. 6(1)(b))</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-primary">Statutory tax, commercial & financial record keeping</td>
                <td className="p-3">Billing history, tax identifiers, payment logs</td>
                <td className="p-3">Legal Obligation (Art. 6(1)(c))</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Data Sharing & Sub-Processors */}
      <section id="data-sharing" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">05</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Data Sharing & Sub-Processors</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          We treat your data with strict confidentiality. We only share personal information with vetted service providers who assist us in operating our platform, subject to strict confidentiality covenants and Data Processing Agreements:
        </p>

        <div className="space-y-3 my-4">
          <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-bold text-sm text-primary">Supabase Inc.</div>
              <div className="text-xs text-on-surface-variant">Primary cloud database (PostgreSQL), row-level security, encrypted file storage.</div>
            </div>
            <span className="text-[11px] font-mono px-2 py-1 bg-surface-container rounded text-primary shrink-0 self-start sm:self-auto">
              Storage & Database
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-bold text-sm text-primary">Auth0 / Okta & Google Identity Services</div>
              <div className="text-xs text-on-surface-variant">Federated authentication, OAuth credential tokens, and email verification.</div>
            </div>
            <span className="text-[11px] font-mono px-2 py-1 bg-surface-container rounded text-primary shrink-0 self-start sm:self-auto">
              Authentication Provider
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-bold text-sm text-primary">Hosting & Content Delivery Networks (Vercel / Netlify / AWS)</div>
              <div className="text-xs text-on-surface-variant">Global edge caching, serverless compute runtime, and DDoS mitigation.</div>
            </div>
            <span className="text-[11px] font-mono px-2 py-1 bg-surface-container rounded text-primary shrink-0 self-start sm:self-auto">
              Infrastructure & CDN
            </span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-on-surface leading-relaxed">
          <strong>Legal Disclosures:</strong> We may disclose data if required by enforceable legal process, subpoena, court order, or applicable law, or where necessary to investigate potential fraud, violations of our Terms of Service, or threats to physical safety.
        </p>
      </section>

      {/* 6. Public Invoices & Client Privacy */}
      <section id="public-invoices" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">06</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Public Invoices & Client Privacy</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          Invorio offers a public invoice preview capability (<code className="text-primary bg-surface-container px-1.5 py-0.5 rounded text-xs">/public/invoice/[id]</code>) designed to make client billing frictionless.
        </p>
        <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-low space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <MaterialIcon icon="visibility" className="text-base" />
            <span>Public Link Accessibility & Your Responsibility</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            When you generate a public invoice link or QR code, anyone in possession of that link can view the invoice details, including your business name, client name, line items, and payment instructions. You are responsible for distributing these links solely to authorized client personnel. Invorio applies obfuscated cryptographically secure IDs to prevent unauthorized sequential crawling.
          </p>
        </div>
      </section>

      {/* 7. Cookies & Storage Technologies */}
      <section id="cookies" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">07</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Cookies & Storage Technologies</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          We use cookies and browser storage technologies strictly necessary to operate our service:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm text-on-surface">
          <li><strong>Essential Authentication Cookies:</strong> Store encrypted JWT session tokens enabling you to stay securely signed in as you navigate between pages.</li>
          <li><strong>Functional Storage:</strong> Local storage used to cache your active invoice draft, zoom scaling factor, and UI preferences (e.g. template selection) so you don&apos;t lose unsaved changes if disconnected.</li>
          <li><strong>No Third-Party Ad Trackers:</strong> We do not deploy third-party advertising cookies, cross-site trackers, or behavioral profiling pixels on Invorio.</li>
        </ul>
        <p className="text-xs text-on-surface-variant">
          You can configure your browser to block or alert you about cookies; however, disabling essential session cookies will prevent you from signing in and using Invorio.
        </p>
      </section>

      {/* 8. Security & Technical Safeguards */}
      <section id="security" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">08</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Security & Technical Safeguards</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          We employ multi-layered technical and organizational safeguards to protect your records:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
            <div className="font-bold text-sm text-primary mb-1 flex items-center gap-1.5">
              <MaterialIcon icon="vpn_key" className="text-base text-primary" />
              Row-Level Security (RLS)
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Every database query enforces strict PostgreSQL Row-Level Security policies. Users cannot access, view, or query records belonging to another tenant or account.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
            <div className="font-bold text-sm text-primary mb-1 flex items-center gap-1.5">
              <MaterialIcon icon="lock" className="text-base text-primary" />
              Modern Encryption
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              All communications are encrypted using TLS 1.3 with HSTS enabled. Data at rest is encrypted using industry-standard AES-256 on SOC-2 Type II certified database clusters.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
            <div className="font-bold text-sm text-primary mb-1 flex items-center gap-1.5">
              <MaterialIcon icon="password" className="text-base text-primary" />
              Cryptographic Hashing
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Passwords are salted and hashed using adaptive algorithms (bcrypt/Argon2). We never store or transmit plain-text user passwords.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
            <div className="font-bold text-sm text-primary mb-1 flex items-center gap-1.5">
              <MaterialIcon icon="verified_user" className="text-base text-primary" />
              Regular Audits & Backups
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Automated continuous backups, isolated staging environments, and continuous vulnerability scanning prevent data loss and unauthorized intrusions.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Data Retention & Account Deletion */}
      <section id="retention" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">09</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Data Retention & Account Deletion</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          We retain your personal data and invoice archives only for as long as necessary to provide the services or fulfill statutory tax and legal obligations:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm text-on-surface">
          <li><strong>Active Accounts:</strong> Records, clients, and invoices are maintained in your account until you deliberately delete them or terminate your account.</li>
          <li><strong>Account Deletion Protocol:</strong> Upon receiving an account closure request, all profile credentials, bank details, client dossiers, and digital signatures are permanently purged from active production databases within 30 days.</li>
          <li><strong>Statutory Tax Archival:</strong> In instances where billing receipts or fiscal invoices were issued between you and Invorio, we may retain transaction logs for up to 7 years in compliance with tax regulations.</li>
        </ul>
      </section>

      {/* 10. Your Privacy Rights (GDPR & CCPA) */}
      <section id="your-rights" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">10</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Your Privacy Rights (GDPR & CCPA)</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          Depending on your jurisdiction, you enjoy enforceable statutory rights regarding your personal data:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4 text-xs">
          <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low">
            <strong className="text-primary block mb-1">Right to Access & Portability</strong>
            Request a machine-readable copy (JSON / CSV / PDF) of all personal data held about you.
          </div>
          <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low">
            <strong className="text-primary block mb-1">Right to Rectification</strong>
            Correct inaccurate or incomplete profile, banking, tax, or business information via your Settings.
          </div>
          <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low">
            <strong className="text-primary block mb-1">Right to Erasure (&quot;Right to be Forgotten&quot;)</strong>
            Demand the permanent deletion of your account and personal records.
          </div>
          <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low">
            <strong className="text-primary block mb-1">Right to Restriction & Objection</strong>
            Object to processing based on legitimate interests or request temporary freeze on data processing.
          </div>
          <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low">
            <strong className="text-primary block mb-1">California CCPA / CPRA Protections</strong>
            Right to know categories of data collected, non-discrimination for exercising rights, and opt-out of data sale (we do not sell data).
          </div>
          <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low">
            <strong className="text-primary block mb-1">Right to Lodge a Complaint</strong>
            Lodge a complaint with your local Data Protection Supervisory Authority (e.g., CNIL, ICO, BfDI).
          </div>
        </div>

        <p className="text-xs md:text-sm text-on-surface leading-relaxed">
          To exercise any of these rights, email our Data Protection Officer at <a href="mailto:eliasemon0025@gmail.com" className="text-primary font-semibold underline">eliasemon0025@gmail.com</a>. We respond to all verified requests within 30 days without fee.
        </p>
      </section>

      {/* 11. International Data Transfers */}
      <section id="international-transfers" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">11</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">International Data Transfers</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          Invorio operates globally with primary cloud infrastructure in the United States and European Union. When data is transferred across international boundaries, we ensure adequate protections are in place by executing European Commission approved Standard Contractual Clauses (SCCs) and adhering to the EU-U.S. Data Privacy Framework principles.
        </p>
      </section>

      {/* 12. Children's Privacy */}
      <section id="children" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">12</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Children&apos;s Privacy</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          Invorio is strictly a business-to-business commercial software solution and is not intended for or directed towards children. We do not knowingly collect personal data from individuals under 18 years of age. If we discover a minor has created an account, we will immediately terminate the account and purge their data.
        </p>
      </section>

      {/* 13. Changes to this Policy */}
      <section id="updates" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">13</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Changes to this Policy</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          We may update this Privacy Policy from time to time to reflect operational modifications, product enhancements, or regulatory developments. When material changes occur, we will post an announcement in the dashboard, send an email notification, and revise the &quot;Last Updated&quot; date at the top of this document. Continued use of Invorio after the effective date constitutes acknowledgment of the revised policy.
        </p>
      </section>

      {/* 14. Contact & Data Protection Officer */}
      <section id="contact" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">14</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Contact & Data Protection Officer</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          If you have questions, inquiries, or privacy concerns regarding this policy or our data practices, please contact our legal and compliance department:
        </p>
        <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2 text-xs md:text-sm">
          <div className="font-bold text-primary text-base">Invorio Inc. — Privacy & Compliance Office</div>
          <div><strong>Email:</strong> <a href="mailto:eliasemon0025@gmail.com" className="text-primary underline">eliasemon0025@gmail.com</a></div>
          <div><strong>Physical Address:</strong> Invorio Legal Operations, Akhaura-3450, Brahmanbaira, Bangladesh</div>
          <div className="text-on-surface-variant pt-2 border-t border-outline-variant/20 text-xs">
            For general technical assistance, please visit the <Link href="/dashboard" className="text-primary underline">Dashboard</Link> or reach out to <a href="mailto:eliasemon0025@gmail.com" className="text-primary underline">eliasemon0025@gmail.com</a>.
          </div>
        </div>
      </section>
    </LegalPageShell>
  );
}
