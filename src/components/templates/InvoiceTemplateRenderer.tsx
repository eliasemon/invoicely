import React from 'react';
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

interface InvoiceTemplateRendererProps extends TemplateProps {
  templateId?: string;
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
};

export function InvoiceTemplateRenderer({ templateId, invoice, profile, isPreview }: InvoiceTemplateRendererProps) {
  const TemplateComponent = TEMPLATE_MAP[templateId || 'modern-template'] || ModernTemplate;

  // Normalize profile to make sure company_address falls back to billing_address
  const normalizedProfile = profile
    ? {
        ...profile,
        company_address: profile.company_address || profile.billing_address || null,
      }
    : null;

  return <TemplateComponent invoice={invoice} profile={normalizedProfile} isPreview={isPreview} />;
}
