import React from "react";
import { MaterialIcon } from "@/components/shared/MaterialIcon";

interface InvoiceDisplayOptionsProps {
  showGroups: boolean;
  setShowGroups: (val: boolean) => void;
  showGroupTotals: boolean;
  setShowGroupTotals: (val: boolean) => void;
  hasGroups: boolean;
  isChallan: boolean;
  setIsChallan: (val: boolean) => void;
}

export function InvoiceDisplayOptions({
  showGroups,
  setShowGroups,
  showGroupTotals,
  setShowGroupTotals,
  hasGroups,
  isChallan,
  setIsChallan,
}: InvoiceDisplayOptionsProps) {
  return (
    <div className="w-full flex flex-col gap-4 print:hidden mb-4">
      {/* Document Type Section */}
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
            {isChallan ? "Consignment Mode" : "Standard Mode"}
          </span>
        </div>

        {/* Responsive Document Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
          {/* Option: Standard Invoice */}
          <button
            type="button"
            onClick={() => setIsChallan(false)}
            aria-pressed={!isChallan}
            className={`group relative flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer active:scale-[0.99] ${
              !isChallan
                ? "border-primary bg-surface-container-lowest shadow-sm ring-2 ring-primary/10"
                : "border-outline-variant/60 bg-surface-container-lowest/70 hover:border-outline-variant hover:bg-surface-container-lowest"
            }`}
          >
            <div
              className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors ${
                !isChallan
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface-variant group-hover:bg-surface-container-high"
              }`}
            >
              <MaterialIcon
                icon="receipt_long"
                filled={!isChallan}
                className="text-[20px] sm:text-[22px]"
              />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`font-semibold text-xs sm:text-sm transition-colors ${
                    !isChallan ? "text-primary font-bold" : "text-on-surface"
                  }`}
                >
                  Commercial Invoice
                </span>
                {!isChallan && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">
                Standard invoice with unit rates, tax & financial totals
              </p>
            </div>

            {/* Checkmark Indicator */}
            <div
              className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                !isChallan
                  ? "bg-primary text-on-primary opacity-100 scale-100 shadow-sm"
                  : "border border-outline-variant/80 opacity-40 scale-90"
              }`}
            >
              {!isChallan && (
                <MaterialIcon icon="check" className="text-[14px]" />
              )}
            </div>
          </button>

          {/* Option: Delivery Challan */}
          <button
            type="button"
            onClick={() => setIsChallan(true)}
            aria-pressed={isChallan}
            className={`group relative flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer active:scale-[0.99] ${
              isChallan
                ? "border-primary bg-surface-container-lowest shadow-sm ring-2 ring-primary/10"
                : "border-outline-variant/60 bg-surface-container-lowest/70 hover:border-outline-variant hover:bg-surface-container-lowest"
            }`}
          >
            <div
              className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors ${
                isChallan
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface-variant group-hover:bg-surface-container-high"
              }`}
            >
              <MaterialIcon
                icon="local_shipping"
                filled={isChallan}
                className="text-[20px] sm:text-[22px]"
              />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`font-semibold text-xs sm:text-sm transition-colors ${
                    isChallan ? "text-primary font-bold" : "text-on-surface"
                  }`}
                >
                  Delivery Challan
                </span>
                {isChallan && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">
                Consignment note with quantities only — hides all prices
              </p>
            </div>

            {/* Checkmark Indicator */}
            <div
              className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                isChallan
                  ? "bg-primary text-on-primary opacity-100 scale-100 shadow-sm"
                  : "border border-outline-variant/80 opacity-40 scale-90"
              }`}
            >
              {isChallan && (
                <MaterialIcon icon="check" className="text-[14px]" />
              )}
            </div>
          </button>
        </div>
      </div>

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

          {showGroups && !isChallan && (
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
