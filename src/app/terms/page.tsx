'use client';

import React from 'react';
import Link from 'next/link';
import { LegalPageShell, HighlightCard, LegalSection } from '@/components/legal/LegalPageShell';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

const termsHighlights: HighlightCard[] = [
  {
    icon: 'verified',
    title: 'Bona Fide Invoicing',
    description: 'Invorio is strictly for legitimate commercial billing. Fraudulent, deceptive, or abusive billing results in immediate permanent termination.',
  },
  {
    icon: 'account_balance',
    title: 'Software, Not a Bank',
    description: 'We build invoice generation software. Invorio does not hold, custody, or transmit money; payments occur directly between you and your clients.',
  },
  {
    icon: 'copyright',
    title: '100% Content Ownership',
    description: 'You retain full intellectual property rights to your client dossiers, line items, pricing, business branding, and digital signatures.',
  },
  {
    icon: 'balance',
    title: 'Fair & Transparent',
    description: 'Clear rules regarding service availability, electronic signatures, acceptable use, liability limits, and dispute resolution.',
  },
];

const termsSections: LegalSection[] = [
  { id: 'agreement', title: 'Agreement & Acceptance' },
  { id: 'eligibility', title: 'Eligibility & Account Security' },
  { id: 'service-scope', title: 'Scope of Services & Invoicing' },
  { id: 'financial-disclaimer', title: 'Payment & Bank Details Disclaimer' },
  { id: 'electronic-signatures', title: 'Digital Signatures & Enforceability' },
  { id: 'acceptable-use', title: 'Acceptable Use & Anti-Fraud Policy' },
  { id: 'public-links', title: 'Public Invoice Links & Security' },
  { id: 'ip-ownership', title: 'Intellectual Property & Content Rights' },
  { id: 'subscriptions-fees', title: 'Billing, Plans & Taxes' },
  { id: 'termination', title: 'Termination & Account Suspension' },
  { id: 'warranty-disclaimer', title: 'Disclaimer of Warranties' },
  { id: 'limitation-liability', title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'disputes', title: 'Dispute Resolution & Arbitration' },
  { id: 'general-terms', title: 'Governing Law & General Terms' },
  { id: 'contact-terms', title: 'Contact Information' },
];

export default function TermsOfServicePage() {
  return (
    <LegalPageShell
      currentDoc="terms"
      title="Terms of Service"
      subtitle="These Terms of Service govern your access to and use of Invorio's web application, invoice generation engine, templates, and billing management tools. Please read them thoroughly before using the platform."
      version="2.4"
      effectiveDate="October 26, 2026"
      lastUpdated="October 26, 2026"
      readingTime="11 min read"
      highlights={termsHighlights}
      sections={termsSections}
    >
      {/* 1. Agreement & Acceptance */}
      <section id="agreement" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">01</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Agreement & Acceptance of Terms</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          These Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;) constitute a legally binding contract between you (either an individual or the legal entity on whose behalf you are acting, &quot;User&quot;, &quot;you&quot;, or &quot;Customer&quot;) and <strong className="text-primary font-semibold">Invorio Inc.</strong> (&quot;Invorio&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
        </p>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          By creating an account, clicking &quot;Sign Up&quot;, accessing our web portal at <code className="text-primary bg-surface-container px-1.5 py-0.5 rounded text-xs">invorio.app</code>, or generating invoices, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <Link href="/privacy" className="text-primary underline font-medium">Privacy Policy</Link>, which is incorporated herein by reference.
        </p>
        <div className="bg-primary-fixed/20 border-l-4 border-primary p-4 rounded-r-xl my-4">
          <p className="text-xs md:text-sm text-primary font-medium m-0 leading-relaxed">
            <strong>Important Notice:</strong> If you do not agree with all of these terms, you are expressly prohibited from using Invorio and must discontinue use immediately.
          </p>
        </div>
      </section>

      {/* 2. Eligibility & Account Security */}
      <section id="eligibility" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">02</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Eligibility & Account Security</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          To register for an account and access Invorio, you represent and warrant that:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm text-on-surface">
          <li>You are at least 18 years of age and possess the legal capacity to form a binding contract in your jurisdiction.</li>
          <li>If registering on behalf of a company, partnership, or organization, you possess the requisite corporate authority to bind that entity to these Terms.</li>
          <li>All registration information you submit is accurate, truthful, current, and complete.</li>
          <li>You will safeguard your login credentials (email, password, SSO tokens) and not disclose them to unauthorized third parties.</li>
        </ul>
        <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
          You are solely responsible for all actions taken under your account. You must notify us immediately at <a href="mailto:eliasemon0025@gmail.com" className="text-primary underline">eliasemon0025@gmail.com</a> if you suspect unauthorized access or security compromises.
        </p>
      </section>

      {/* 3. Scope of Services & Invoicing */}
      <section id="service-scope" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">03</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Scope of Services & Invoicing Tools</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          Invorio provides a digital productivity suite that enables users to:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 text-xs">
          <div className="p-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-low">
            <strong className="text-primary block text-sm mb-1">Custom Invoice Architect</strong>
            Build professional invoices, quotations, and bills using modern, high-density, geometric, corporate, and minimalist templates.
          </div>
          <div className="p-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-low">
            <strong className="text-primary block text-sm mb-1">Multi-Currency Calculations</strong>
            Configure base currencies (USD, EUR, GBP, JPY, CAD, etc.), apply discounts, taxes, and shipping expenses with automated rounding.
          </div>
          <div className="p-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-low">
            <strong className="text-primary block text-sm mb-1">Client Roster & Ledger</strong>
            Store customer contact info, tax registration numbers, and maintain invoice payment status logs (Draft, Pending, Paid, Overdue).
          </div>
          <div className="p-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-low">
            <strong className="text-primary block text-sm mb-1">QR Code & PDF Generation</strong>
            Generate instant payment QR codes, digital signatures, and downloadable publication-grade A4 PDF documents.
          </div>
        </div>
      </section>

      {/* 4. Payment & Bank Details Disclaimer */}
      <section id="financial-disclaimer" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">04</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Settlement, Bank Details & QR Disclaimer</h2>
        </div>
        <div className="p-4 rounded-xl border-2 border-primary/20 bg-surface-container-low space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <MaterialIcon icon="account_balance" className="text-lg" />
            <span>CRITICAL FINANCIAL & LEGAL NOTICE</span>
          </div>
          <p className="text-xs md:text-sm text-on-surface leading-relaxed">
            <strong>Invorio is a software provider, not a financial institution, bank, payment gateway, money transmitter, or escrow agent.</strong>
          </p>
          <ul className="list-disc pl-5 text-xs text-on-surface space-y-2">
            <li><strong>No Custody of Funds:</strong> Invorio never touches, receives, holds, transmits, or escrows any money exchanged between invoice issuers and their clients. All settlements occur directly between you and your customers via your designated banking or payment channels.</li>
            <li><strong>Accuracy of Banking Coordinates:</strong> You are solely responsible for verifying the accuracy of all bank names, account holder identities, account numbers, IBANs, and SWIFT/BIC codes you insert into invoices or profile settings.</li>
            <li><strong>QR Codes:</strong> Invorio provides automated QR code rendering encoding the URLs or payment identifiers you specify. Invorio disclaims all liability for misdirected funds, banking bounce fees, or delayed transfers resulting from inaccurate user inputs.</li>
          </ul>
        </div>
      </section>

      {/* 5. Digital Signatures & Enforceability */}
      <section id="electronic-signatures" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">05</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Digital Signatures & Legal Enforceability</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          Invorio includes an interactive digital signature canvas allowing users to affix electronic signatures to invoices and estimates.
        </p>
        <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
          While electronic signatures are recognized in many jurisdictions under legislation such as the United States Electronic Signatures in Global and National Commerce Act (ESIGN), Uniform Electronic Transactions Act (UETA), and European Union eIDAS Regulation (EU No 910/2014), statutory evidentiary standards vary across industries and geographies. You are solely responsible for determining whether an electronic signature created via Invorio meets the specific legal, statutory, or regulatory enforceability requirements for your transactions.
        </p>
      </section>

      {/* 6. Acceptable Use & Anti-Fraud Policy */}
      <section id="acceptable-use" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">06</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Acceptable Use & Anti-Fraud Policy</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          We maintain zero tolerance for fraudulent, unlawful, or abusive behavior. You agree that you will <strong className="text-primary font-semibold">NOT</strong> use Invorio to:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs my-4">
          <div className="p-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest">
            <span className="text-error font-bold flex items-center gap-1 mb-1">
              <MaterialIcon icon="block" className="text-base text-error" />
              Fraudulent or Deceptive Billing
            </span>
            Issue fictitious invoices, misrepresent prices, bill for services never agreed upon, or mimic existing trademarks without authorization.
          </div>
          <div className="p-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest">
            <span className="text-error font-bold flex items-center gap-1 mb-1">
              <MaterialIcon icon="block" className="text-base text-error" />
              Money Laundering & Sanctions
            </span>
            Facilitate illegal financial transactions, evade sanctions regimes (OFAC, EU, UN lists), or engage in terrorist financing.
          </div>
          <div className="p-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest">
            <span className="text-error font-bold flex items-center gap-1 mb-1">
              <MaterialIcon icon="block" className="text-error text-base" />
              Phishing & Malware Distribution
            </span>
            Distribute harmful malware, ransomware, weaponized links, or phishing attempts using public invoice links or uploaded assets.
          </div>
          <div className="p-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest">
            <span className="text-error font-bold flex items-center gap-1 mb-1">
              <MaterialIcon icon="block" className="text-error text-base" />
              Platform Abuse & Scraping
            </span>
            Reverse engineer, decompile, scrape, overload, or bypass security rate-limits, database authentication, or Row-Level Security.
          </div>
        </div>
        <p className="text-xs text-on-surface-variant">
          Violation of this policy will result in immediate account termination, revocation of all public links, and notification of relevant law enforcement authorities.
        </p>
      </section>

      {/* 7. Public Invoice Links & Security */}
      <section id="public-links" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">07</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Public Invoice Links & Recipient Access</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          Invorio allows you to generate accessible public links to invoices for your customers. You understand and accept that:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm text-on-surface">
          <li>Anyone possessing the direct public URL can view the invoice details, including line item descriptions, amounts, and settlement instructions.</li>
          <li>You are solely responsible for ensuring you share invoice URLs through secure, authenticated channels with the intended client recipient.</li>
          <li>Invorio reserves the right to rate-limit or temporarily restrict access to public invoice links if anomalous traffic or automated scraping is detected.</li>
        </ul>
      </section>

      {/* 8. Intellectual Property & User Content Rights */}
      <section id="ip-ownership" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">08</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Intellectual Property & Content Rights</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          <strong>Invorio Intellectual Property:</strong> Invorio and its licensors retain all right, title, and interest (including copyright, trademark, patent, and trade secrets) in the Invorio application, interface design, logo marks, templates, source code, and documentation. You may not copy, reproduce, or create derivative works of our software without express written consent.
        </p>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          <strong>Your Content Ownership:</strong> As between you and Invorio, you retain 100% full ownership of all data, text, client records, brand logos, pricing, and signature assets that you upload or generate (&quot;User Content&quot;). You grant Invorio a limited, non-exclusive, worldwide, royalty-free license solely to host, process, cache, render, and display your User Content as necessary to provide the services to you.
        </p>
      </section>

      {/* 9. Billing, Plans & Taxes */}
      <section id="subscriptions-fees" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">09</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Fees, Billing & Taxes</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          Invorio offers a combination of free tiers and optional premium subscription packages:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm text-on-surface">
          <li><strong>Pricing Transparency:</strong> Fees for paid tiers are presented prior to purchase and billed in advance on a recurring monthly or annual basis.</li>
          <li><strong>Cancellation & Refunds:</strong> You may cancel paid subscriptions at any time via your account settings. Subscriptions remain active until the end of the current billing cycle. Unless required by law, subscription payments are non-refundable.</li>
          <li><strong>Your Tax Responsibility:</strong> You are exclusively responsible for calculating, collecting, reporting, and remitting all applicable sales taxes, value-added taxes (VAT), goods and services taxes (GST), or withholding taxes applicable to the commercial goods and services invoiced through Invorio.</li>
        </ul>
      </section>

      {/* 10. Termination & Account Suspension */}
      <section id="termination" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">10</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Termination & Account Suspension</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          <strong>By You:</strong> You may terminate these Terms at any time by deleting your account through your profile settings or by contacting <a href="mailto:eliasemon0025@gmail.com" className="text-primary underline">eliasemon0025@gmail.com</a>.
        </p>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          <strong>By Invorio:</strong> We reserve the right to suspend or terminate your account immediately without prior notice if:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-xs md:text-sm text-on-surface">
          <li>You materially breach any provision of these Terms or our Acceptable Use Policy.</li>
          <li>We are instructed to do so by a competent court, regulatory body, or law enforcement agency.</li>
          <li>Your account exhibits fraudulent billing activity, severe security compromise, or chargeback abuse.</li>
        </ul>
      </section>

      {/* 11. Disclaimer of Warranties */}
      <section id="warranty-disclaimer" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">11</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Disclaimer of Warranties</h2>
        </div>
        <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs md:text-sm leading-relaxed text-on-surface">
          <p className="uppercase font-bold text-primary mb-2">Service Provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;</p>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, INVORIO AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, STATUTORY OR OTHERWISE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, ERROR-FREE, OR VIRUS-FREE, NOR DO WE WARRANT THAT INVOICES GENERATED WILL SATISFY EVERY SPECIFIC JURISDICTIONAL TAX INVOICING MANDATE.
          </p>
        </div>
      </section>

      {/* 12. Limitation of Liability */}
      <section id="limitation-liability" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">12</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Limitation of Liability</h2>
        </div>
        <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs md:text-sm leading-relaxed text-on-surface space-y-2">
          <p>
            UNDER NO CIRCUMSTANCES SHALL INVORIO, ITS DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE, OR EXEMPLARY DAMAGES (INCLUDING LOSS OF PROFITS, LOSS OF REVENUE, LOSS OF GOODWILL, LOSS OF CLIENT CONTRACTS, OR LOSS OF BUSINESS DATA) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OR INABILITY TO USE THE SERVICE.
          </p>
          <p>
            IN ALL EVENTS, INVORIO&apos;S TOTAL AGGREGATE LIABILITY ARISING UNDER OR RELATED TO THESE TERMS SHALL BE LIMITED TO THE GREATER OF: (A) THE TOTAL AMOUNT ACTUALLY PAID BY YOU TO INVORIO IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM; OR (B) ONE HUNDRED UNITED STATES DOLLARS (USD $100.00).
          </p>
        </div>
      </section>

      {/* 13. Indemnification */}
      <section id="indemnification" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">13</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Indemnification</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          You agree to defend, indemnify, and hold harmless Invorio, its officers, directors, employees, suppliers, and licensors from and against any claims, damages, liabilities, losses, judgments, awards, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or resulting from:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-xs md:text-sm text-on-surface">
          <li>Your breach or violation of these Terms or any applicable statutory regulation.</li>
          <li>Any User Content, fraudulent invoice, inaccurate line item, or disputed charge created by you.</li>
          <li>Your failure to remit, report, or calculate mandatory local sales, excise, or value-added taxes.</li>
          <li>Any infringement or misappropriation of third-party intellectual property or privacy rights.</li>
        </ul>
      </section>

      {/* 14. Dispute Resolution & Arbitration */}
      <section id="disputes" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">14</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Dispute Resolution & Binding Arbitration</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          <strong>Mandatory Informal Resolution:</strong> Before initiating formal proceedings, you and Invorio agree to attempt to resolve any dispute, controversy, or claim amicably by contacting <a href="mailto:eliasemon0025@gmail.com" className="text-primary underline">eliasemon0025@gmail.com</a> for at least thirty (30) days.
        </p>
        <p className="text-xs md:text-sm text-on-surface leading-relaxed">
          <strong>Binding Arbitration:</strong> If the dispute is not resolved informally, it shall be settled by binding individual arbitration conducted by the American Arbitration Association (AAA) under its Commercial Arbitration Rules.
        </p>
        <p className="text-xs md:text-sm text-on-surface font-semibold">
          <strong>CLASS ACTION WAIVER:</strong> YOU AND INVORIO AGREE THAT EACH PARTY MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
        </p>
      </section>

      {/* 15. Governing Law & General Terms */}
      <section id="general-terms" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">15</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Governing Law & General Provisions</h2>
        </div>
        <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm text-on-surface">
          <li><strong>Governing Law:</strong> These Terms and any dispute arising therefrom shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law principles.</li>
          <li><strong>Severability:</strong> If any provision of these Terms is deemed unlawful, void, or unenforceable, that provision will be severed without affecting the validity and enforceability of the remaining provisions.</li>
          <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy and any applicable order form, constitute the entire agreement between you and Invorio regarding the subject matter.</li>
          <li><strong>No Waiver:</strong> Failure by Invorio to enforce any right or provision shall not be deemed a waiver of future enforcement of that provision.</li>
        </ul>
      </section>

      {/* 16. Contact Information */}
      <section id="contact-terms" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <span className="font-mono text-xs text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">16</span>
          <h2 className="text-xl md:text-2xl font-bold text-primary m-0">Contact Information</h2>
        </div>
        <p className="text-sm md:text-base text-on-surface leading-relaxed">
          For inquiries or legal notices regarding these Terms of Service, please reach out to:
        </p>
        <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2 text-xs md:text-sm">
          <div className="font-bold text-primary text-base">Invorio Inc. — Legal Counsel Department</div>
          <div><strong>Email:</strong> <a href="mailto:eliasemon0025@gmail.com" className="text-primary underline">eliasemon0025@gmail.com</a></div>
          <div><strong>Physical Address:</strong> Invorio Legal Operations, Akhaura-3450, Brahmanbaira, Bangladesh</div>
        </div>
      </section>
    </LegalPageShell>
  );
}
