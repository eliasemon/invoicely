'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { DocumentType, TextSize } from '@/components/templates/templateUtils';
import { TemplateSelector } from '@/components/templates/TemplateSelector';

interface PublicInvoiceSettingsTabsProps {
  // Mode & Format
  documentType: DocumentType;
  setDocumentType: (type: DocumentType) => void;
  quotationWithPricing: boolean;
  setQuotationWithPricing: (val: boolean) => void;
  invoiceModeEnabled: boolean;
  challanModeEnabled: boolean;
  quotationModeEnabled: boolean;
  onToggleModeAvailability?: (mode: 'invoice' | 'challan' | 'quotation', enabled: boolean) => void;
  isUpdatingMode?: boolean;

  // Templates
  currentTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  templateSavedNotification?: string | null;

  // Sizing & Appearance
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  overallTextSize: TextSize;
  setOverallTextSize: (size: TextSize) => void;

  // Groups
  hasGroups: boolean;
  showGroups: boolean;
  setShowGroups: (val: boolean) => void;
  showGroupTotals: boolean;
  setShowGroupTotals: (val: boolean) => void;

  // Owner settings
  isOwner: boolean;
  subjectEnabled: boolean;
  setSubjectEnabled: (val: boolean) => void;
  subjectInvoice: string;
  setSubjectInvoice: (val: string) => void;
  subjectChallan: string;
  setSubjectChallan: (val: string) => void;
  subjectQuotation: string;
  setSubjectQuotation: (val: string) => void;
  noteEnabled: boolean;
  setNoteEnabled: (val: boolean) => void;
  noteText: string;
  setNoteText: (val: string) => void;
  onSaveSettings: () => Promise<void>;
  isSavingSettings: boolean;
  settingsSavedMessage?: string | null;
}

export function PublicInvoiceSettingsTabs({
  documentType,
  setDocumentType,
  quotationWithPricing,
  setQuotationWithPricing,
  invoiceModeEnabled,
  challanModeEnabled,
  quotationModeEnabled,
  onToggleModeAvailability,
  isUpdatingMode = false,
  currentTemplate,
  onSelectTemplate,
  templateSavedNotification,
  textSize,
  setTextSize,
  overallTextSize,
  setOverallTextSize,
  hasGroups,
  showGroups,
  setShowGroups,
  showGroupTotals,
  setShowGroupTotals,
  isOwner,
  subjectEnabled,
  setSubjectEnabled,
  subjectInvoice,
  setSubjectInvoice,
  subjectChallan,
  setSubjectChallan,
  subjectQuotation,
  setSubjectQuotation,
  noteEnabled,
  setNoteEnabled,
  noteText,
  setNoteText,
  onSaveSettings,
  isSavingSettings,
  settingsSavedMessage,
}: PublicInvoiceSettingsTabsProps) {
  const [activeTab, setActiveTab] = useState('section-doc-format');
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [hasRightOverflow, setHasRightOverflow] = useState(false);
  const [hasLeftOverflow, setHasLeftOverflow] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Steppers for Overall Text Size
  const handleDecreaseOverallTextSize = () => {
    if (overallTextSize === 'large') setOverallTextSize('normal');
    else if (overallTextSize === 'normal') setOverallTextSize('compact');
  };

  const handleIncreaseOverallTextSize = () => {
    if (overallTextSize === 'compact') setOverallTextSize('normal');
    else if (overallTextSize === 'normal') setOverallTextSize('large');
  };

  // Steppers for Items Rows Text Size
  const handleDecreaseTextSize = () => {
    if (textSize === 'large') setTextSize('normal');
    else if (textSize === 'normal') setTextSize('compact');
  };

  const handleIncreaseTextSize = () => {
    if (textSize === 'compact') setTextSize('normal');
    else if (textSize === 'normal') setTextSize('large');
  };

  // Format Selection Handler
  const handleSelectDocType = (type: DocumentType) => {
    if (!isOwner) {
      if (type === 'invoice' && !invoiceModeEnabled) return;
      if (type === 'challan' && !challanModeEnabled) return;
      if (type === 'quotation' && !quotationModeEnabled) return;
    }
    setDocumentType(type);
  };

  const canShowInvoice = isOwner || invoiceModeEnabled;
  const canShowChallan = isOwner || challanModeEnabled;
  const canShowQuotation = isOwner || quotationModeEnabled;

  const tabs = [
    {
      id: 'section-doc-format',
      label: 'Document Format',
      icon: 'swap_horiz',
      badge: documentType === 'quotation' ? 'Quotation' : documentType === 'challan' ? 'Challan' : 'Invoice',
    },
    {
      id: 'section-doc-template',
      label: 'Template Layout',
      icon: 'palette',
      badge: currentTemplate.replace(/-/g, ' '),
    },
    {
      id: 'section-doc-sizing',
      label: 'Display & Sizing',
      icon: 'format_size',
    },
    ...(isOwner
      ? [
          {
            id: 'section-doc-notes',
            label: 'Notes & Subjects',
            icon: 'edit_note',
            badge: 'Owner',
            isOwnerBadge: true,
          },
        ]
      : []),
    {
      id: 'section-doc-preview',
      label: 'Invoice Preview',
      icon: 'visibility',
      badge: 'A4 View',
    },
  ];

  // Smooth scroll to section (like profile settings)
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 125; // Header + sticky tab bar offset
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = Math.max(0, elementPosition - offset);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveTab(id);
    }
  };

  // Active section spy on scroll (matching profile settings)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 145;
      let current = activeTab;

      for (const tab of tabs) {
        const el = document.getElementById(tab.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            current = tab.id;
          }
        }
      }

      // If user reaches near the bottom of the page, highlight preview
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
        current = 'section-doc-preview';
      }

      if (current !== activeTab) {
        setActiveTab(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, tabs]);

  // Ensure active tab button is scrolled into view in horizontal container
  useEffect(() => {
    const activeBtn = document.getElementById(`nav-btn-${activeTab}`);
    if (activeBtn && tabScrollRef.current) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  // Check overflow for horizontal tabs list
  const updateOverflow = () => {
    const el = tabScrollRef.current;
    if (el) {
      setHasLeftOverflow(el.scrollLeft > 10);
      setHasRightOverflow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }
  };

  // Nudge animation on mount to visibly show the horizontal tabs list is scrollable
  useEffect(() => {
    const container = tabScrollRef.current;
    if (!container) return;

    updateOverflow();
    window.addEventListener('resize', updateOverflow);

    // Initial noticeable nudge animation: smoothly scroll right, pause, then scroll back
    const timer1 = setTimeout(() => {
      if (container.scrollWidth > container.clientWidth) {
        container.scrollTo({ left: 65, behavior: 'smooth' });
        const timer2 = setTimeout(() => {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        }, 550);
        return () => clearTimeout(timer2);
      }
    }, 500);

    // Auto-hide the edge pulsing indicator after 5 seconds
    const timer3 = setTimeout(() => {
      setShowScrollHint(false);
    }, 5000);

    return () => {
      window.removeEventListener('resize', updateOverflow);
      clearTimeout(timer1);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-full">
      {/* CSS Keyframes for Noticeable Horizontal Scroll Hint Animation */}
      <style jsx>{`
        @keyframes tabsNudgeKeyframe {
          0% { transform: translateX(0); }
          20% { transform: translateX(-20px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }
        .animate-tab-list-nudge {
          animation: tabsNudgeKeyframe 1.1s cubic-bezier(0.25, 1, 0.5, 1) 0.6s 1 normal forwards;
        }
      `}</style>

      {/* Sticky Tab Navigation Bar (Identical to ProfileNav) */}
      <nav 
        aria-label="Document settings navigation"
        className="sticky top-14 bg-surface/95 backdrop-blur-md border-b border-outline-variant z-30 shadow-xs -mx-4 px-4 sm:mx-0 sm:px-0 mb-6"
      >
        <div className="max-w-5xl mx-auto relative flex items-center">
          {/* Left Gradient Cue (if scrolled right) */}
          {hasLeftOverflow && (
            <button
              type="button"
              onClick={() => tabScrollRef.current?.scrollBy({ left: -180, behavior: 'smooth' })}
              aria-label="Scroll tabs left"
              className="absolute left-0 top-0 bottom-0 pl-2 pr-6 bg-gradient-to-r from-surface via-surface/90 to-transparent flex items-center justify-start z-20 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-surface-container shadow-xs flex items-center justify-center text-on-surface-variant hover:text-primary">
                <MaterialIcon icon="chevron_left" className="text-[16px]" />
              </div>
            </button>
          )}

          {/* Horizontally Scrollable Tabs List with short nudge animation */}
          <div
            ref={tabScrollRef}
            onScroll={() => {
              updateOverflow();
              setShowScrollHint(false);
            }}
            className="flex overflow-x-auto no-scrollbar scroll-smooth w-full py-0.5"
          >
            <div className="flex items-center gap-1 sm:gap-2 animate-tab-list-nudge">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-btn-${tab.id}`}
                    type="button"
                    onClick={() => scrollToSection(tab.id)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 hover:bg-surface-container transition-all cursor-pointer ${
                      isActive
                        ? 'border-primary text-primary bg-surface-container/60 font-bold'
                        : 'border-transparent text-on-surface-variant'
                    }`}
                  >
                    <MaterialIcon icon={tab.icon} className="text-[19px]" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                          tab.isOwnerBadge
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Gradient Cue & Noticeable Pulsing "Scroll ➔" Indicator */}
          {(hasRightOverflow || showScrollHint) && (
            <div
              onClick={() => {
                tabScrollRef.current?.scrollBy({ left: 180, behavior: 'smooth' });
                setShowScrollHint(false);
              }}
              className="absolute right-0 top-0 bottom-0 pr-2 pl-8 bg-gradient-to-l from-surface via-surface/90 to-transparent flex items-center justify-end z-20 cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full border border-primary/25 shadow-xs transition-all animate-pulse">
                <span>Scroll</span>
                <MaterialIcon icon="chevron_right" className="text-[14px]" />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ALL SECTIONS RENDERED SEQUENTIALLY ON THE SCROLLABLE PAGE */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* SECTION 1: DOCUMENT FORMAT */}
        <section
          id="section-doc-format"
          className="scroll-mt-32 bg-surface border border-outline-variant/60 rounded-2xl p-4 sm:p-5 shadow-xs transition-all"
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-sm sm:text-base text-on-surface flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <MaterialIcon icon="swap_horiz" className="text-[18px]" />
                </span>
                <span>Document Format & Mode</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant capitalize">
                Active: {documentType}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Switch between standard commercial billing, non-monetary delivery challan, or quotation mode.
            </p>
          </div>

          {/* Format Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Commercial Invoice */}
            {canShowInvoice && (
              <button
                type="button"
                onClick={() => handleSelectDocType('invoice')}
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                  documentType === 'invoice'
                    ? 'border-primary bg-primary/5 shadow-xs ring-2 ring-primary/10'
                    : 'border-outline-variant/60 bg-surface hover:border-outline-variant hover:bg-surface-container-lowest'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    documentType === 'invoice'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <MaterialIcon icon="receipt_long" filled={documentType === 'invoice'} className="text-[18px]" />
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`font-semibold text-xs ${
                        documentType === 'invoice' ? 'text-primary font-bold' : 'text-on-surface'
                      }`}
                    >
                      Commercial Invoice
                    </span>
                    {isOwner && onToggleModeAvailability && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleModeAvailability('invoice', !invoiceModeEnabled);
                        }}
                        disabled={isUpdatingMode}
                        title={
                          invoiceModeEnabled
                            ? 'Click to disable public view of Invoice'
                            : 'Click to enable public view of Invoice'
                        }
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border transition-all cursor-pointer ${
                          invoiceModeEnabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            invoiceModeEnabled ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{invoiceModeEnabled ? 'Public: On' : 'Public: Off'}</span>
                        <MaterialIcon
                          icon={invoiceModeEnabled ? 'visibility' : 'visibility_off'}
                          className="text-[12px]"
                        />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Standard invoice with unit rates & financial totals
                  </p>
                </div>

                <div
                  className={`absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    documentType === 'invoice'
                      ? 'bg-primary text-on-primary opacity-100 scale-100'
                      : 'border border-outline-variant/80 opacity-30 scale-90'
                  }`}
                >
                  {documentType === 'invoice' && <MaterialIcon icon="check" className="text-[12px]" />}
                </div>
              </button>
            )}

            {/* Delivery Challan */}
            {canShowChallan && (
              <button
                type="button"
                onClick={() => handleSelectDocType('challan')}
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                  documentType === 'challan'
                    ? 'border-primary bg-primary/5 shadow-xs ring-2 ring-primary/10'
                    : 'border-outline-variant/60 bg-surface hover:border-outline-variant hover:bg-surface-container-lowest'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    documentType === 'challan'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <MaterialIcon icon="local_shipping" filled={documentType === 'challan'} className="text-[18px]" />
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`font-semibold text-xs ${
                        documentType === 'challan' ? 'text-primary font-bold' : 'text-on-surface'
                      }`}
                    >
                      Delivery Challan
                    </span>
                    {isOwner && onToggleModeAvailability && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleModeAvailability('challan', !challanModeEnabled);
                        }}
                        disabled={isUpdatingMode}
                        title={
                          challanModeEnabled
                            ? 'Click to disable public view of Challan'
                            : 'Click to enable public view of Challan'
                        }
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border transition-all cursor-pointer ${
                          challanModeEnabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            challanModeEnabled ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{challanModeEnabled ? 'Public: On' : 'Public: Off'}</span>
                        <MaterialIcon
                          icon={challanModeEnabled ? 'visibility' : 'visibility_off'}
                          className="text-[12px]"
                        />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Consignment note with quantities only — hides prices
                  </p>
                </div>

                <div
                  className={`absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    documentType === 'challan'
                      ? 'bg-primary text-on-primary opacity-100 scale-100'
                      : 'border border-outline-variant/80 opacity-30 scale-90'
                  }`}
                >
                  {documentType === 'challan' && <MaterialIcon icon="check" className="text-[12px]" />}
                </div>
              </button>
            )}

            {/* Quotation */}
            {canShowQuotation && (
              <button
                type="button"
                onClick={() => handleSelectDocType('quotation')}
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                  documentType === 'quotation'
                    ? 'border-primary bg-primary/5 shadow-xs ring-2 ring-primary/10'
                    : 'border-outline-variant/60 bg-surface hover:border-outline-variant hover:bg-surface-container-lowest'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    documentType === 'quotation'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <MaterialIcon icon="request_quote" filled={documentType === 'quotation'} className="text-[18px]" />
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`font-semibold text-xs ${
                        documentType === 'quotation' ? 'text-primary font-bold' : 'text-on-surface'
                      }`}
                    >
                      Quotation
                    </span>
                    {isOwner && onToggleModeAvailability && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleModeAvailability('quotation', !quotationModeEnabled);
                        }}
                        disabled={isUpdatingMode}
                        title={
                          quotationModeEnabled
                            ? 'Click to disable public view of Quotation'
                            : 'Click to enable public view of Quotation'
                        }
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border transition-all cursor-pointer ${
                          quotationModeEnabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            quotationModeEnabled ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{quotationModeEnabled ? 'Public: On' : 'Public: Off'}</span>
                        <MaterialIcon
                          icon={quotationModeEnabled ? 'visibility' : 'visibility_off'}
                          className="text-[12px]"
                        />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    {quotationWithPricing
                      ? 'Quotation with full pricing and amount breakdown'
                      : 'Quotation with quantities only — hides all pricing'}
                  </p>
                </div>

                <div
                  className={`absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    documentType === 'quotation'
                      ? 'bg-primary text-on-primary opacity-100 scale-100'
                      : 'border border-outline-variant/80 opacity-30 scale-90'
                  }`}
                >
                  {documentType === 'quotation' && <MaterialIcon icon="check" className="text-[12px]" />}
                </div>
              </button>
            )}
          </div>

          {/* Quotation Pricing Mode Toggle (Owner Only) */}
          {isOwner && documentType === 'quotation' && (
            <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low/70 border border-outline-variant/60 rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <MaterialIcon icon="payments" className="text-[18px]" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-xs text-on-surface">Quotation Pricing & Money Amount</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                      Owner Setting
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    {quotationWithPricing
                      ? 'Prices, rates & total amounts are visible (With Money)'
                      : 'Prices, rates & total amounts are hidden (Without Money)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface border border-outline-variant/50 text-on-surface">
                  {quotationWithPricing ? 'With Money' : 'Without Money'}
                </span>
                <button
                  type="button"
                  onClick={() => setQuotationWithPricing(!quotationWithPricing)}
                  aria-label="Toggle Quotation Pricing"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                    quotationWithPricing ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      quotationWithPricing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: TEMPLATES */}
        <section
          id="section-doc-template"
          className="scroll-mt-32 bg-surface border border-outline-variant/60 rounded-2xl p-4 sm:p-5 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-sm sm:text-base text-on-surface flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <MaterialIcon icon="palette" className="text-[18px]" />
                </span>
                <span>Template Layout</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                All templates are tailored for standard single-page A4 layout printing.
              </p>
            </div>
            {templateSavedNotification && (
              <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{templateSavedNotification}</span>
              </div>
            )}
          </div>

          <TemplateSelector selectedTemplate={currentTemplate} onSelect={onSelectTemplate} />
        </section>

        {/* SECTION 3: DISPLAY & SIZING */}
        <section
          id="section-doc-sizing"
          className="scroll-mt-32 bg-surface border border-outline-variant/60 rounded-2xl p-4 sm:p-5 shadow-xs transition-all"
        >
          <div className="mb-4">
            <h2 className="font-semibold text-sm sm:text-base text-on-surface flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <MaterialIcon icon="format_size" className="text-[18px]" />
              </span>
              <span>Typography & Layout Density</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Fine-tune document fonts and row heights to fit single-page A4 printing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Overall Document Font Size */}
            <div className="flex flex-col justify-between gap-2.5 bg-surface-container-low/70 border border-outline-variant/60 rounded-xl p-3.5 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-on-surface">Overall Document Font Size</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                    Headers & Notes
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Scales company info, dates, summary totals & bottom notes.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-outline-variant/40 w-fit">
                <button
                  type="button"
                  onClick={handleDecreaseOverallTextSize}
                  disabled={overallTextSize === 'compact'}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    overallTextSize === 'compact'
                      ? 'opacity-30 cursor-not-allowed text-on-surface-variant'
                      : 'hover:bg-surface-container-high text-on-surface active:scale-95'
                  }`}
                  title="Decrease overall font size"
                >
                  A-
                </button>
                {(['compact', 'normal', 'large'] as TextSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setOverallTextSize(size)}
                    className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-all cursor-pointer ${
                      overallTextSize === size
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {size}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleIncreaseOverallTextSize}
                  disabled={overallTextSize === 'large'}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    overallTextSize === 'large'
                      ? 'opacity-30 cursor-not-allowed text-on-surface-variant'
                      : 'hover:bg-surface-container-high text-on-surface active:scale-95'
                  }`}
                  title="Increase overall font size"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Table Items Font Size */}
            <div className="flex flex-col justify-between gap-2.5 bg-surface-container-low/70 border border-outline-variant/60 rounded-xl p-3.5 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-on-surface">Table Items Font Size & Page Fit</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                    15+ Rows/Page
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Adjust row padding to fit more line items on a single sheet.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-outline-variant/40 w-fit">
                <button
                  type="button"
                  onClick={handleDecreaseTextSize}
                  disabled={textSize === 'compact'}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    textSize === 'compact'
                      ? 'opacity-30 cursor-not-allowed text-on-surface-variant'
                      : 'hover:bg-surface-container-high text-on-surface active:scale-95'
                  }`}
                  title="Decrease items rows font size"
                >
                  A-
                </button>
                {(['compact', 'normal', 'large'] as TextSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTextSize(size)}
                    className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-all cursor-pointer ${
                      textSize === size
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {size}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleIncreaseTextSize}
                  disabled={textSize === 'large'}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    textSize === 'large'
                      ? 'opacity-30 cursor-not-allowed text-on-surface-variant'
                      : 'hover:bg-surface-container-high text-on-surface active:scale-95'
                  }`}
                  title="Increase items rows font size"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Group-Wise Layout Option (if applicable) */}
          {hasGroups && (
            <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low/70 border border-outline-variant/60 rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <MaterialIcon icon="splitscreen" className="text-[18px]" />
                </span>
                <div>
                  <p className="font-semibold text-xs text-on-surface">Group-Wise Layout</p>
                  <p className="text-[11px] text-on-surface-variant">
                    Organize list items categorized into distinct groups.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    const next = !showGroups;
                    setShowGroups(next);
                    if (!next) setShowGroupTotals(false);
                  }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                    showGroups ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showGroups ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>

                {showGroups && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-on-surface select-none">
                    <input
                      type="checkbox"
                      checked={showGroupTotals}
                      onChange={(e) => setShowGroupTotals(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <span>Subtotals</span>
                  </label>
                )}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: NOTES & SUBJECTS (OWNER ONLY) */}
        {isOwner && (
          <section
            id="section-doc-notes"
            className="scroll-mt-32 bg-surface border border-outline-variant/60 rounded-2xl p-4 sm:p-5 shadow-xs transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-sm sm:text-base text-on-surface flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <MaterialIcon icon="edit_note" className="text-[20px]" />
                  </span>
                  <span>Document Content & Bottom N.B. Note</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Directly customize the subject lines and bottom note shown on public views and PDFs.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Owner Only</span>
              </div>
            </div>

            {/* Subject Lines Card */}
            <div className="bg-surface-container-low/70 border border-outline-variant/60 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MaterialIcon icon="subject" className="text-primary text-[18px]" />
                  <span className="text-xs font-bold text-on-surface">Subject Line Settings</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-on-surface select-none">
                  <input
                    type="checkbox"
                    checked={subjectEnabled}
                    onChange={(e) => setSubjectEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>{subjectEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className={`p-2.5 rounded-lg border transition-all ${
                  documentType === 'invoice' ? 'bg-surface border-primary/40 ring-1 ring-primary/20' : 'bg-surface/60 border-outline-variant/40'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-on-surface-variant">Commercial Invoice</span>
                    {documentType === 'invoice' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">Active</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={subjectInvoice}
                    onChange={(e) => setSubjectInvoice(e.target.value)}
                    disabled={!subjectEnabled}
                    placeholder="Bill for Items/Services"
                    className="w-full text-xs px-2 py-1 rounded bg-surface border border-outline-variant/40 focus:border-primary outline-none disabled:opacity-50"
                  />
                </div>

                <div className={`p-2.5 rounded-lg border transition-all ${
                  documentType === 'challan' ? 'bg-surface border-primary/40 ring-1 ring-primary/20' : 'bg-surface/60 border-outline-variant/40'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-on-surface-variant">Delivery Challan</span>
                    {documentType === 'challan' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">Active</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={subjectChallan}
                    onChange={(e) => setSubjectChallan(e.target.value)}
                    disabled={!subjectEnabled}
                    placeholder="Delivery Challan for Items/Services"
                    className="w-full text-xs px-2 py-1 rounded bg-surface border border-outline-variant/40 focus:border-primary outline-none disabled:opacity-50"
                  />
                </div>

                <div className={`p-2.5 rounded-lg border transition-all ${
                  documentType === 'quotation' ? 'bg-surface border-primary/40 ring-1 ring-primary/20' : 'bg-surface/60 border-outline-variant/40'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-on-surface-variant">Quotation</span>
                    {documentType === 'quotation' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">Active</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={subjectQuotation}
                    onChange={(e) => setSubjectQuotation(e.target.value)}
                    disabled={!subjectEnabled}
                    placeholder="Quotation for Items/Services"
                    className="w-full text-xs px-2 py-1 rounded bg-surface border border-outline-variant/40 focus:border-primary outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Note (N.B.) Card */}
            <div className="bg-surface-container-low/70 border border-outline-variant/60 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MaterialIcon icon="sticky_note_2" className="text-primary text-[18px]" />
                  <span className="text-xs font-bold text-on-surface">Bottom Note (N.B.)</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-on-surface select-none">
                  <input
                    type="checkbox"
                    checked={noteEnabled}
                    onChange={(e) => setNoteEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>{noteEnabled ? 'Visible' : 'Hidden'}</span>
                </label>
              </div>

              {noteEnabled && (
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter bottom note (e.g. Goods once sold are not returnable...)"
                  rows={2}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary outline-none resize-none"
                />
              )}
              <p className="text-[10px] text-on-surface-variant">
                Appears immediately below the table of items / totals and above bank details on the PDF.
              </p>
            </div>

            {/* Save Button Row */}
            <div className="flex items-center justify-between pt-1">
              {settingsSavedMessage ? (
                <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  {settingsSavedMessage}
                </div>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={onSaveSettings}
                disabled={isSavingSettings}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSavingSettings ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MaterialIcon icon="save" className="text-[16px]" />
                )}
                <span>{isSavingSettings ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
