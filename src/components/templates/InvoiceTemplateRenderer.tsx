'use client';
import React, { useState } from 'react';
import { TemplateProps } from './templateUtils';
import { ModernTemplate } from './ModernTemplate';
import { ElegantTemplate } from './ElegantTemplate';
import { CorporateTemplate } from './CorporateTemplate';
import { MinimalistWithQrCodeTemplate } from './MinimalistWithQrCodeTemplate';
import { PristineA4Template } from './PristineA4Template';
import { HeritageA4Template } from './HeritageA4Template';
import { GroupedFintechA4Template } from './GroupedFintechA4Template';
import { HighDensityFlatA4Template } from './HighDensityFlatA4Template';
import { MixedGroupsA4Template } from './MixedGroupsA4Template';
import { GeometricA4Template } from './GeometricA4Template';
import { EnterpriseA4Template } from './EnterpriseA4Template';
import { FintechA4Template } from './FintechA4Template';
import { RedClassicGroupedTemplate } from './RedClassicGroupedTemplate';
import { SleekAccentTemplate } from './SleekAccentTemplate';
import { ModernPurpleTemplate } from './ModernPurpleTemplate';

interface InvoiceTemplateRendererProps extends TemplateProps {
  templateId?: string;
  hideToggles?: boolean;
}

const TEMPLATE_MAP: Record<string, React.ComponentType<TemplateProps>> = {
  'modern-template': ModernTemplate,
  'elegant-template': ElegantTemplate,
  'corporate-template': CorporateTemplate,
  'minimalist-with-qr-code': MinimalistWithQrCodeTemplate,
  'pristine-a4': PristineA4Template,
  'heritage-a4': HeritageA4Template,
  'grouped-fintech-a4': GroupedFintechA4Template,
  'high-density-flat-a4': HighDensityFlatA4Template,
  'mixed-groups-a4': MixedGroupsA4Template,
  'geometric-a4': GeometricA4Template,
  'enterprise-a4': EnterpriseA4Template,
  'fintech-a4': FintechA4Template,
  'red-classic-grouped': RedClassicGroupedTemplate,
  'sleek-accent': SleekAccentTemplate,
  'modern-purple': ModernPurpleTemplate,
};

export function InvoiceTemplateRenderer({ 
  templateId, 
  invoice, 
  profile, 
  isPreview, 
  publicUrl,
  hideToggles = false,
  showGroups: controlledShowGroups,
  showGroupTotals: controlledShowGroupTotals,
}: InvoiceTemplateRendererProps) {
  const [internalShowGroups, setInternalShowGroups] = useState(false);
  const [internalShowGroupTotals, setInternalShowGroupTotals] = useState(false);

  const showGroups = controlledShowGroups !== undefined ? controlledShowGroups : internalShowGroups;
  const showGroupTotals = controlledShowGroupTotals !== undefined ? controlledShowGroupTotals : internalShowGroupTotals;

  const setShowGroups = (val: boolean) => {
    setInternalShowGroups(val);
  };
  const setShowGroupTotals = (val: boolean) => {
    setInternalShowGroupTotals(val);
  };

  const TemplateComponent = TEMPLATE_MAP[templateId || 'modern-template'] || ModernTemplate;

  // Normalize profile to make sure company_address falls back to billing_address
  const normalizedProfile = profile
    ? {
        ...profile,
        company_address: profile.company_address || profile.billing_address || null,
      }
    : null;

  // Only display the toggle if the invoice contains named groups
  const hasGroups = invoice.groups && invoice.groups.length > 0 && invoice.groups.some(g => g.name && g.name.trim() !== '');

  return (
    <div className="flex flex-col items-center w-full print:block print:w-[210mm] print:p-0 print:m-0">
      {hasGroups && !hideToggles && (
        <div className="mb-6 flex flex-col gap-3 bg-white border border-[#e2e8f0] rounded-xl px-5 py-3 shadow-md text-sm print:hidden max-w-[210mm] w-full mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#0058be] text-[20px]">splitscreen</span>
              <div className="text-left">
                <p className="font-semibold text-slate-800">Group-Wise Layout</p>
                <p className="text-xs text-slate-500">Organize list items by their group category</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => {
                const next = !showGroups;
                setShowGroups(next);
                if (!next) setShowGroupTotals(false);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:ring-offset-2 ${
                showGroups ? 'bg-[#0058be]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showGroups ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {showGroups && (
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#f1f5f9]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#0058be] text-[20px]">functions</span>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Group Totals</p>
                  <p className="text-xs text-slate-500">Show subtotal for each group</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowGroupTotals(!showGroupTotals)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:ring-offset-2 ${
                  showGroupTotals ? 'bg-[#0058be]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showGroupTotals ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      )}
      <TemplateComponent invoice={invoice} profile={normalizedProfile} isPreview={isPreview} showGroups={showGroups} showGroupTotals={showGroupTotals} publicUrl={publicUrl} />
    </div>
  );
}
