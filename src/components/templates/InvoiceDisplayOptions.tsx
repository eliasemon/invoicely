import React from "react";
import { MaterialIcon } from "@/components/shared/MaterialIcon";
import { DocumentType, TextSize } from "./templateUtils";

interface InvoiceDisplayOptionsProps {
  showGroups: boolean;
  setShowGroups: (val: boolean) => void;
  showGroupTotals: boolean;
  setShowGroupTotals: (val: boolean) => void;
  hasGroups: boolean;
  isChallan: boolean;
  setIsChallan: (val: boolean) => void;
  isQuotation?: boolean;
  setIsQuotation?: (val: boolean) => void;
  documentType?: DocumentType;
  setDocumentType?: (val: DocumentType) => void;
  textSize?: TextSize;
  setTextSize?: (val: TextSize) => void;
  overallTextSize?: TextSize;
  setOverallTextSize?: (val: TextSize) => void;
  invoiceModeEnabled?: boolean;
  challanModeEnabled?: boolean;
  quotationModeEnabled?: boolean;
  isOwner?: boolean;
}

export function InvoiceDisplayOptions({
  showGroups,
  setShowGroups,
  showGroupTotals,
  setShowGroupTotals,
  hasGroups,
  isChallan,
  setIsChallan,
  isQuotation = false,
  setIsQuotation,
  documentType,
  setDocumentType,
  textSize = "normal",
  setTextSize,
  overallTextSize = "normal",
  setOverallTextSize,
  invoiceModeEnabled = true,
  challanModeEnabled = true,
  quotationModeEnabled = true,
  isOwner = false,
}: InvoiceDisplayOptionsProps) {
  // Determine current active document type
  const currentDocType: DocumentType =
    documentType || (isQuotation ? "quotation" : isChallan ? "challan" : "invoice");

  const handleSelectDocType = (type: DocumentType) => {
    if (setDocumentType) {
      setDocumentType(type);
    }
    if (setIsChallan) {
      setIsChallan(type === "challan");
    }
    if (setIsQuotation) {
      setIsQuotation(type === "quotation");
    }
  };

  const handleDecreaseTextSize = () => {
    if (!setTextSize) return;
    if (textSize === "large") setTextSize("normal");
    else if (textSize === "normal") setTextSize("compact");
  };

  const handleIncreaseTextSize = () => {
    if (!setTextSize) return;
    if (textSize === "compact") setTextSize("normal");
    else if (textSize === "normal") setTextSize("large");
  };

  const handleDecreaseOverallTextSize = () => {
    if (!setOverallTextSize) return;
    if (overallTextSize === "large") setOverallTextSize("normal");
    else if (overallTextSize === "normal") setOverallTextSize("compact");
  };

  const handleIncreaseOverallTextSize = () => {
    if (!setOverallTextSize) return;
    if (overallTextSize === "compact") setOverallTextSize("normal");
    else if (overallTextSize === "normal") setOverallTextSize("large");
  };

  const isPricingHidden = currentDocType !== "invoice";

  return (
    <div className="w-full flex flex-col gap-4 print:hidden mb-4">
      {/* Document Type Section - Only available to the owner of the document */}
      {isOwner && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <MaterialIcon
              icon="swap_horiz"
              className="text-primary text-[20px]"
            />
            <h3 className="font-body-lg text-sm sm:text-base font-semibold text-on-surface">
              Document Format
            </h3>
          </div>
          <span className="text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
            {currentDocType === "quotation"
              ? "Quotation Mode"
              : currentDocType === "challan"
              ? "Consignment Mode"
              : "Commercial Mode"}
          </span>
        </div>

        {/* Document Type Cards */}
        {(() => {
          const canShowInvoice = isOwner || invoiceModeEnabled;
          const canShowChallan = isOwner || challanModeEnabled;
          const canShowQuotation = isOwner || quotationModeEnabled;
          const visibleCount = [canShowInvoice, canShowChallan, canShowQuotation].filter(Boolean).length;
          const gridCols = visibleCount === 1 ? 'grid-cols-1' : visibleCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3';

          return (
            <div className={`grid ${gridCols} gap-2.5 sm:gap-3`}>
              {/* Option 1: Commercial Invoice */}
              {canShowInvoice && (
                <button
                  type="button"
                  onClick={() => handleSelectDocType("invoice")}
                  aria-pressed={currentDocType === "invoice"}
                  className={`group relative flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                    currentDocType === "invoice"
                      ? "border-primary bg-surface-container-lowest shadow-sm ring-2 ring-primary/10"
                      : "border-outline-variant/60 bg-surface-container-lowest/70 hover:border-outline-variant hover:bg-surface-container-lowest"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      currentDocType === "invoice"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container text-on-surface-variant group-hover:bg-surface-container-high"
                    }`}
                  >
                    <MaterialIcon
                      icon="receipt_long"
                      filled={currentDocType === "invoice"}
                      className="text-[18px]"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`font-semibold text-xs transition-colors ${
                          currentDocType === "invoice"
                            ? "text-primary font-bold"
                            : "text-on-surface"
                        }`}
                      >
                        Commercial Invoice
                      </span>
                      {isOwner && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${invoiceModeEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {invoiceModeEnabled ? 'Public: On' : 'Public: Off'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">
                      Standard invoice with unit rates & financial totals
                    </p>
                  </div>

                  {/* Checkmark Indicator */}
                  <div
                    className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      currentDocType === "invoice"
                        ? "bg-primary text-on-primary opacity-100 scale-100 shadow-sm"
                        : "border border-outline-variant/80 opacity-30 scale-90"
                    }`}
                  >
                    {currentDocType === "invoice" && (
                      <MaterialIcon icon="check" className="text-[12px]" />
                    )}
                  </div>
                </button>
              )}

              {/* Option 2: Delivery Challan */}
              {canShowChallan && (
                <button
                  type="button"
                  onClick={() => handleSelectDocType("challan")}
                  aria-pressed={currentDocType === "challan"}
                  className={`group relative flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                    currentDocType === "challan"
                      ? "border-primary bg-surface-container-lowest shadow-sm ring-2 ring-primary/10"
                      : "border-outline-variant/60 bg-surface-container-lowest/70 hover:border-outline-variant hover:bg-surface-container-lowest"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      currentDocType === "challan"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container text-on-surface-variant group-hover:bg-surface-container-high"
                    }`}
                  >
                    <MaterialIcon
                      icon="local_shipping"
                      filled={currentDocType === "challan"}
                      className="text-[18px]"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`font-semibold text-xs transition-colors ${
                          currentDocType === "challan"
                            ? "text-primary font-bold"
                            : "text-on-surface"
                        }`}
                      >
                        Delivery Challan
                      </span>
                      {isOwner && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${challanModeEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {challanModeEnabled ? 'Public: On' : 'Public: Off'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">
                      Consignment note with quantities only — hides prices
                    </p>
                  </div>

                  {/* Checkmark Indicator */}
                  <div
                    className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      currentDocType === "challan"
                        ? "bg-primary text-on-primary opacity-100 scale-100 shadow-sm"
                        : "border border-outline-variant/80 opacity-30 scale-90"
                    }`}
                  >
                    {currentDocType === "challan" && (
                      <MaterialIcon icon="check" className="text-[12px]" />
                    )}
                  </div>
                </button>
              )}

              {/* Option 3: Quotation */}
              {canShowQuotation && (
                <button
                  type="button"
                  onClick={() => handleSelectDocType("quotation")}
                  aria-pressed={currentDocType === "quotation"}
                  className={`group relative flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                    currentDocType === "quotation"
                      ? "border-primary bg-surface-container-lowest shadow-sm ring-2 ring-primary/10"
                      : "border-outline-variant/60 bg-surface-container-lowest/70 hover:border-outline-variant hover:bg-surface-container-lowest"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      currentDocType === "quotation"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container text-on-surface-variant group-hover:bg-surface-container-high"
                    }`}
                  >
                    <MaterialIcon
                      icon="request_quote"
                      filled={currentDocType === "quotation"}
                      className="text-[18px]"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`font-semibold text-xs transition-colors ${
                          currentDocType === "quotation"
                            ? "text-primary font-bold"
                            : "text-on-surface"
                        }`}
                      >
                        Quotation
                      </span>
                      {isOwner && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${quotationModeEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {quotationModeEnabled ? 'Public: On' : 'Public: Off'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">
                      Item list with quantities only — hides all pricing details
                    </p>
                  </div>

                  {/* Checkmark Indicator */}
                  <div
                    className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      currentDocType === "quotation"
                        ? "bg-primary text-on-primary opacity-100 scale-100 shadow-sm"
                        : "border border-outline-variant/80 opacity-30 scale-90"
                    }`}
                  >
                    {currentDocType === "quotation" && (
                      <MaterialIcon icon="check" className="text-[12px]" />
                    )}
                  </div>
                </button>
              )}
            </div>
          );
        })()}
      </div>
      )}

      {/* Overall Document Font Size Controls (Excluding line items) */}
      {setOverallTextSize && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-outline-variant/70 rounded-xl px-4 py-3 shadow-sm text-sm">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">
              text_fields
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-xs sm:text-sm text-on-surface">
                  Overall Document Font Size
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                  Headers, Totals & Details
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Scales headers, addresses, dates, summary totals & notes (excluding list items)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-surface-container-high/60 p-1 rounded-lg border border-outline-variant/40">
            {/* A- Stepper */}
            <button
              type="button"
              onClick={handleDecreaseOverallTextSize}
              disabled={overallTextSize === "compact"}
              title="Decrease overall document font size"
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                overallTextSize === "compact"
                  ? "opacity-30 cursor-not-allowed text-on-surface-variant"
                  : "hover:bg-surface-container-highest text-on-surface active:scale-95"
              }`}
            >
              A-
            </button>

            {/* Compact Pill */}
            <button
              type="button"
              onClick={() => setOverallTextSize("compact")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                overallTextSize === "compact"
                  ? "bg-primary text-on-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Compact
            </button>

            {/* Normal Pill */}
            <button
              type="button"
              onClick={() => setOverallTextSize("normal")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                overallTextSize === "normal"
                  ? "bg-primary text-on-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Normal
            </button>

            {/* Large Pill */}
            <button
              type="button"
              onClick={() => setOverallTextSize("large")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                overallTextSize === "large"
                  ? "bg-primary text-on-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Large
            </button>

            {/* A+ Stepper */}
            <button
              type="button"
              onClick={handleIncreaseOverallTextSize}
              disabled={overallTextSize === "large"}
              title="Increase overall document font size"
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                overallTextSize === "large"
                  ? "opacity-30 cursor-not-allowed text-on-surface-variant"
                  : "hover:bg-surface-container-highest text-on-surface active:scale-95"
              }`}
            >
              A+
            </button>
          </div>
        </div>
      )}

      {/* PDF Table Item Rows Text Size & Page Fit Controls (Ensuring 15 rows fit on single A4) */}
      {setTextSize && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-outline-variant/70 rounded-xl px-4 py-3 shadow-sm text-sm">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">
              format_size
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-xs sm:text-sm text-on-surface">
                  Table Items Font Size & Page Fit
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Fits 15+ Rows / Page
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Adjust font size and row padding to fit all list items on a single A4 sheet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-surface-container-high/60 p-1 rounded-lg border border-outline-variant/40">
            {/* A- Stepper */}
            <button
              type="button"
              onClick={handleDecreaseTextSize}
              disabled={textSize === "compact"}
              title="Decrease table item rows text size (more rows per page)"
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                textSize === "compact"
                  ? "opacity-30 cursor-not-allowed text-on-surface-variant"
                  : "hover:bg-surface-container-highest text-on-surface active:scale-95"
              }`}
            >
              A-
            </button>

            {/* Compact Pill */}
            <button
              type="button"
              onClick={() => setTextSize("compact")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                textSize === "compact"
                  ? "bg-primary text-on-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Compact
            </button>

            {/* Normal Pill */}
            <button
              type="button"
              onClick={() => setTextSize("normal")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                textSize === "normal"
                  ? "bg-primary text-on-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Normal
            </button>

            {/* Large Pill */}
            <button
              type="button"
              onClick={() => setTextSize("large")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                textSize === "large"
                  ? "bg-primary text-on-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Large
            </button>

            {/* A+ Stepper */}
            <button
              type="button"
              onClick={handleIncreaseTextSize}
              disabled={textSize === "large"}
              title="Increase table item rows text size"
              className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                textSize === "large"
                  ? "opacity-30 cursor-not-allowed text-on-surface-variant"
                  : "hover:bg-surface-container-highest text-on-surface active:scale-95"
              }`}
            >
              A+
            </button>
          </div>
        </div>
      )}

      {/* Group-Wise Layout Section (if groups exist) */}
      {hasGroups && (
        <div className="flex flex-col gap-2.5 bg-surface border border-outline-variant/70 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm text-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">
                splitscreen
              </span>
              <div className="text-left min-w-0">
                <p className="font-semibold text-xs sm:text-sm text-on-surface truncate">
                  Group-Wise Layout
                </p>
                <p className="text-[11px] sm:text-xs text-on-surface-variant truncate">
                  Organize list items by category
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !showGroups;
                setShowGroups(next);
                if (!next) setShowGroupTotals(false);
              }}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                showGroups ? "bg-primary" : "bg-surface-container-highest"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showGroups ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {showGroups && !isPricingHidden && (
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-outline-variant/30">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">
                  functions
                </span>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-xs sm:text-sm text-on-surface truncate">
                    Group Subtotals
                  </p>
                  <p className="text-[11px] sm:text-xs text-on-surface-variant truncate">
                    Calculate subtotal for each group
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGroupTotals(!showGroupTotals)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  showGroupTotals ? "bg-primary" : "bg-surface-container-highest"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showGroupTotals ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
