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
  showGroups = false,
  showGroupTotals = false,
}: InvoiceTemplateRendererProps) {
  const TemplateComponent = TEMPLATE_MAP[templateId || 'modern-template'] || ModernTemplate;

  // Normalize profile to make sure company_address falls back to billing_address
  const normalizedProfile = profile
    ? {
        ...profile,
        company_address: profile.company_address || profile.billing_address || null,
      }
    : null;

  return (
 <div className="flex flex-col w-full print:block print:w-[210mm] print:p-0 print:m-0">       <TemplateComponent invoice={invoice} profile={normalizedProfile} isPreview={isPreview} showGroups={showGroups} showGroupTotals={showGroupTotals} publicUrl={publicUrl} />
    </div>
  );
}
