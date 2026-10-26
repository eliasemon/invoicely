"use client";
import React, { useState } from "react";
import { TemplateProps, PaperSize } from "./templateUtils";
import { ModernTemplate } from "./ModernTemplate";
import { ElegantTemplate } from "./ElegantTemplate";
import { CorporateTemplate } from "./CorporateTemplate";
import { MinimalistWithQrCodeTemplate } from "./MinimalistWithQrCodeTemplate";
import { PristineA4Template } from "./PristineA4Template";
import { HeritageA4Template } from "./HeritageA4Template";
import { GroupedFintechA4Template } from "./GroupedFintechA4Template";
import { HighDensityFlatA4Template } from "./HighDensityFlatA4Template";
import { MixedGroupsA4Template } from "./MixedGroupsA4Template";
import { GeometricA4Template } from "./GeometricA4Template";
import { EnterpriseA4Template } from "./EnterpriseA4Template";
import { FintechA4Template } from "./FintechA4Template";
import { RedClassicGroupedTemplate } from "./RedClassicGroupedTemplate";
import { SleekAccentTemplate } from "./SleekAccentTemplate";
import { ModernPurpleTemplate } from "./ModernPurpleTemplate";
import { UniversalThermalTemplate } from "./UniversalThermalTemplate";

interface InvoiceTemplateRendererProps extends TemplateProps {
  templateId?: string;
  hideToggles?: boolean;
}

const TEMPLATE_MAP: Record<string, React.ComponentType<TemplateProps>> = {
  "modern-template": ModernTemplate,
  "elegant-template": ElegantTemplate,
  "corporate-template": CorporateTemplate,
  "minimalist-with-qr-code": MinimalistWithQrCodeTemplate,
  "pristine-a4": PristineA4Template,
  "heritage-a4": HeritageA4Template,
  "grouped-fintech-a4": GroupedFintechA4Template,
  "high-density-flat-a4": HighDensityFlatA4Template,
  "mixed-groups-a4": MixedGroupsA4Template,
  "geometric-a4": GeometricA4Template,
  "enterprise-a4": EnterpriseA4Template,
  "fintech-a4": FintechA4Template,
  "red-classic-grouped": RedClassicGroupedTemplate,
  "sleek-accent": SleekAccentTemplate,
  "modern-purple": ModernPurpleTemplate,
  "universal-thermal": UniversalThermalTemplate,
};

export function InvoiceTemplateRenderer({
  templateId,
  invoice,
  profile,
  isPreview,
  publicUrl,
  showGroups = false,
  showGroupTotals = false,
  isChallan = false,
  isQuotation = false,
  documentType = 'invoice',
  showPricing = true,
  textSize = 'normal',
  overallTextSize = 'normal',
  paperSize = 'a4',
}: InvoiceTemplateRendererProps) {
  const isThermal = paperSize === 'thermal' || templateId === 'universal-thermal';
  const effectivePaperSize: PaperSize = isThermal ? 'thermal' : paperSize === 'a5' ? 'a5' : 'a4';

  const TemplateComponent = isThermal
    ? UniversalThermalTemplate
    : TEMPLATE_MAP[templateId || "modern-template"] || ModernTemplate;

  // Resolve document type flags
  const effectiveChallan = Boolean(isChallan || documentType === 'challan');
  const effectiveQuotation = Boolean(isQuotation || documentType === 'quotation');
  const effectiveDocType = effectiveQuotation ? 'quotation' : effectiveChallan ? 'challan' : 'invoice';

  // Construct mode-specific QR URL so scanning each mode opens that exact document type
  let qrUrl = publicUrl;
  if (publicUrl) {
    try {
      const urlObj = new URL(publicUrl, 'http://localhost');
      urlObj.searchParams.set('type', effectiveDocType);
      if (effectiveDocType === 'quotation') {
        urlObj.searchParams.set('pricing', showPricing === false ? 'without_money' : 'with_money');
      }
      qrUrl = publicUrl.startsWith('http') 
        ? urlObj.toString() 
        : `${urlObj.pathname}${urlObj.search}`;
    } catch {
      const sep = publicUrl.includes('?') ? '&' : '?';
      const pricingParam = effectiveDocType === 'quotation' ? `&pricing=${showPricing === false ? 'without_money' : 'with_money'}` : '';
      qrUrl = `${publicUrl}${sep}type=${effectiveDocType}${pricingParam}`;
    }
  }

  // Normalize profile to make sure company_address falls back to billing_address
  const normalizedProfile = profile
    ? {
        ...profile,
        company_address:
          profile.company_address || profile.billing_address || null,
      }
    : null;

  const printWidthClass =
    effectivePaperSize === 'thermal'
      ? 'print:w-[80mm] print:max-w-[80mm]'
      : effectivePaperSize === 'a5'
      ? 'print:w-[148mm] print:max-w-[148mm]'
      : 'print:w-[210mm] print:max-w-[210mm]';

  return (
    <div
      className={`flex flex-col w-full print:block ${printWidthClass} print:p-0 print:m-0 pdf-density-${textSize} pdf-content-${overallTextSize}`}
    >
      <TemplateComponent
        invoice={invoice}
        profile={normalizedProfile}
        isPreview={isPreview}
        showGroups={showGroups}
        showGroupTotals={showGroupTotals}
        publicUrl={qrUrl}
        isChallan={effectiveChallan}
        isQuotation={effectiveQuotation}
        documentType={effectiveDocType}
        showPricing={showPricing}
        textSize={textSize}
        overallTextSize={overallTextSize}
        paperSize={effectivePaperSize}
      />
    </div>
  );
}

