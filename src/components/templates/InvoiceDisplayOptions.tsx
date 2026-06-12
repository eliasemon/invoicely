import React from "react";

interface InvoiceDisplayOptionsProps {
  showGroups: boolean;
  setShowGroups: (val: boolean) => void;
  showGroupTotals: boolean;
  setShowGroupTotals: (val: boolean) => void;
  hasGroups: boolean;
}

export function InvoiceDisplayOptions({
  showGroups,
  setShowGroups,
  showGroupTotals,
  setShowGroupTotals,
  hasGroups,
}: InvoiceDisplayOptionsProps) {
  if (!hasGroups) return null;

  return (
    <div className="flex flex-col gap-3 bg-surface border border-outline-variant rounded-xl px-5 py-3 shadow-sm text-sm print:hidden w-full max-w-3xl mx-auto mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]">
            splitscreen
          </span>
          <div className="text-left">
            <p className="font-semibold text-on-surface">Group-Wise Layout</p>
            <p className="text-xs text-on-surface-variant">
              Organize list items by their group category
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
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
      {showGroups && (
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-outline-variant/30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">
              functions
            </span>
            <div className="text-left">
              <p className="font-semibold text-on-surface">Group Totals</p>
              <p className="text-xs text-on-surface-variant">
                Show subtotal for each group
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowGroupTotals(!showGroupTotals)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
  );
}
