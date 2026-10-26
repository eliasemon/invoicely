import { normalizePhoneNumber } from './phone';

export type ShareDocumentType = 'invoice' | 'challan' | 'quotation';

export interface DocumentShareParams {
  documentId: string;
  documentType: ShareDocumentType;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerWhatsapp?: string;
  companyName?: string;
  baseUrl?: string;
  // Financial info
  subtotal?: number;
  discountAmount?: number;
  shippingCost?: number;
  totalAmount?: number;
  amountPaid?: number;
  remainingAmount?: number;
  currency?: string;
  currencySymbol?: string;
  status?: string;
  issueDate?: string;
  dueDate?: string;
  // Options
  quotationWithPricing?: boolean;
}

function formatMoney(amount: number | undefined, currencySymbol = '$', currency = 'USD'): string {
  const val = Number(amount || 0);
  const formatted = val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currencySymbol ? `${currencySymbol}${formatted}` : `${formatted} ${currency}`;
}

export function getPublicDocumentUrl(
  documentId: string,
  documentType: ShareDocumentType,
  baseUrl = '',
  quotationWithPricing = true
): string {
  const host = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const cleanHost = host.replace(/\/$/, '');

  if (documentType === 'quotation') {
    return `${cleanHost}/public/invoice/${documentId}?type=quotation&pricing=${
      quotationWithPricing ? 'with_money' : 'without_money'
    }`;
  }
  if (documentType === 'challan') {
    return `${cleanHost}/public/invoice/${documentId}?type=challan`;
  }
  return `${cleanHost}/public/invoice/${documentId}`;
}

/**
 * Generates an emoji-rich, structured WhatsApp message with bold formatting and public link
 */
export function generateWhatsAppMessage(params: DocumentShareParams): string {
  const {
    documentId,
    documentType,
    invoiceNumber,
    customerName = 'Valued Customer',
    companyName = 'Our Company',
    subtotal = 0,
    discountAmount = 0,
    shippingCost = 0,
    totalAmount = 0,
    amountPaid = 0,
    remainingAmount = 0,
    currency = 'USD',
    currencySymbol = '$',
    status = 'UNPAID',
    issueDate,
    dueDate,
    quotationWithPricing = true,
    baseUrl = '',
  } = params;

  const publicUrl = getPublicDocumentUrl(documentId, documentType, baseUrl, quotationWithPricing);
  const docTitle =
    documentType === 'invoice'
      ? `Commercial Invoice #${invoiceNumber}`
      : documentType === 'challan'
      ? `Delivery Challan #${invoiceNumber}`
      : `Quotation #${invoiceNumber}`;

  const greeting = `Hello *${customerName}* 👋,`;

  if (documentType === 'challan') {
    return [
      greeting,
      ``,
      `Please find attached details for *Delivery Challan #${invoiceNumber}* from *${companyName}*.`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🚚 *DELIVERY DETAILS*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      issueDate ? `📅 *Date:* ${issueDate}` : '',
      `🏢 *Client:* ${customerName}`,
      `📄 *Challan No:* #${invoiceNumber}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🔗 *VIEW & DOWNLOAD CHALLAN (PDF):*`,
      publicUrl,
      `━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `Please inspect items upon arrival and let us know if everything is in order. 📦`,
      ``,
      `Best regards,`,
      `*${companyName}*`,
    ]
      .filter((line) => line !== null && line !== undefined)
      .join('\n');
  }

  if (documentType === 'quotation') {
    const lines = [
      greeting,
      ``,
      `Here is our *Quotation #${invoiceNumber}* prepared by *${companyName}*.`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📋 *QUOTATION SUMMARY*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      issueDate ? `📅 *Date:* ${issueDate}` : '',
      `🏢 *Prepared For:* ${customerName}`,
      `📄 *Ref:* #${invoiceNumber}`,
    ];

    if (quotationWithPricing) {
      lines.push(
        ``,
        `💰 *ESTIMATED TOTALS*`,
        `────────────────────`,
        `📦 *Subtotal:* ${formatMoney(subtotal, currencySymbol, currency)}`,
        discountAmount > 0
          ? `🏷️ *Discount:* -${formatMoney(discountAmount, currencySymbol, currency)}`
          : '',
        `💵 *Total Estimate:* ${formatMoney(totalAmount || subtotal, currencySymbol, currency)}`
      );
    }

    lines.push(
      ``,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🔗 *VIEW & DOWNLOAD QUOTATION (PDF):*`,
      publicUrl,
      `━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `Please review this proposal and feel free to reach out with any questions. ✨`,
      ``,
      `Best regards,`,
      `*${companyName}*`
    );

    return lines.filter(Boolean).join('\n');
  }

  // Invoice Mode
  const statusEmoji =
    status === 'PAID' ? '✅ PAID' : status === 'PARTIAL' ? '⚡ PARTIALLY PAID' : '⚠️ UNPAID';

  const breakdownLines = [
    `💰 *FINANCIAL BREAKDOWN*`,
    `────────────────────`,
    `📦 *Subtotal:* ${formatMoney(subtotal, currencySymbol, currency)}`,
  ];

  if (discountAmount > 0) {
    breakdownLines.push(`🏷️ *Discount:* -${formatMoney(discountAmount, currencySymbol, currency)}`);
  }
  if (shippingCost > 0) {
    breakdownLines.push(`🚚 *Shipping:* +${formatMoney(shippingCost, currencySymbol, currency)}`);
  }
  breakdownLines.push(
    `💵 *Total Amount:* ${formatMoney(totalAmount, currencySymbol, currency)}`,
    `💳 *Paid to Date:* ${formatMoney(amountPaid, currencySymbol, currency)}`,
    `⏳ *Balance Due:* ${formatMoney(remainingAmount, currencySymbol, currency)}`
  );

  return [
    greeting,
    ``,
    `Here is your *${docTitle}* from *${companyName}*.`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📄 *INVOICE DETAILS*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    issueDate ? `📅 *Issue Date:* ${issueDate}` : '',
    dueDate ? `⏳ *Due Date:* ${dueDate}` : '',
    `📊 *Payment Status:* ${statusEmoji}`,
    ``,
    ...breakdownLines,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🔗 *VIEW & DOWNLOAD INVOICE (PDF):*`,
    publicUrl,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Thank you for your business! 🙏`,
    `If you have any questions regarding this invoice, please let us know.`,
    ``,
    `Best regards,`,
    `*${companyName}*`,
  ]
    .filter((line) => line !== null && line !== undefined)
    .join('\n');
}

/**
 * Generates Email Subject and Body with structured text and public PDF link
 */
export function generateEmailContent(params: DocumentShareParams): {
  subject: string;
  body: string;
} {
  const {
    documentId,
    documentType,
    invoiceNumber,
    customerName = 'Valued Customer',
    companyName = 'Our Company',
    subtotal = 0,
    discountAmount = 0,
    shippingCost = 0,
    totalAmount = 0,
    amountPaid = 0,
    remainingAmount = 0,
    currency = 'USD',
    currencySymbol = '$',
    status = 'UNPAID',
    issueDate,
    dueDate,
    quotationWithPricing = true,
    baseUrl = '',
  } = params;

  const publicUrl = getPublicDocumentUrl(documentId, documentType, baseUrl, quotationWithPricing);

  let docTitle = `Invoice #${invoiceNumber}`;
  if (documentType === 'challan') docTitle = `Delivery Challan #${invoiceNumber}`;
  if (documentType === 'quotation') docTitle = `Quotation #${invoiceNumber}`;

  const subject = `${docTitle} from ${companyName}`;

  if (documentType === 'challan') {
    const body = `Dear ${customerName},

Please find the details for Delivery Challan #${invoiceNumber} issued by ${companyName}.

--------------------------------------------------
DELIVERY DETAILS
--------------------------------------------------
Date: ${issueDate || 'N/A'}
Recipient: ${customerName}
Challan Number: #${invoiceNumber}

--------------------------------------------------
VIEW & DOWNLOAD CHALLAN (PDF):
${publicUrl}
--------------------------------------------------

Please inspect the goods upon delivery. Feel free to contact us if you need any assistance.

Best regards,
${companyName}`;
    return { subject, body };
  }

  if (documentType === 'quotation') {
    const pricingSection = quotationWithPricing
      ? `
ESTIMATED TOTALS:
- Subtotal: ${formatMoney(subtotal, currencySymbol, currency)}${
          discountAmount > 0
            ? `\n- Discount: -${formatMoney(discountAmount, currencySymbol, currency)}`
            : ''
        }
- Total Estimate: ${formatMoney(totalAmount || subtotal, currencySymbol, currency)}
`
      : '';

    const body = `Dear ${customerName},

Please find our Quotation #${invoiceNumber} prepared by ${companyName}.

--------------------------------------------------
QUOTATION SUMMARY
--------------------------------------------------
Date: ${issueDate || 'N/A'}
Prepared For: ${customerName}
Reference: #${invoiceNumber}
${pricingSection}
--------------------------------------------------
VIEW & DOWNLOAD QUOTATION (PDF):
${publicUrl}
--------------------------------------------------

Please review this quotation and let us know if you have any questions or require any adjustments.

Best regards,
${companyName}`;
    return { subject, body };
  }

  // Invoice Mode
  const body = `Dear ${customerName},

Please find the details for Commercial Invoice #${invoiceNumber} from ${companyName}.

--------------------------------------------------
INVOICE SUMMARY
--------------------------------------------------
Issue Date: ${issueDate || 'N/A'}
Due Date: ${dueDate || 'N/A'}
Payment Status: ${status}

FINANCIAL BREAKDOWN:
- Subtotal: ${formatMoney(subtotal, currencySymbol, currency)}${
    discountAmount > 0 ? `\n- Discount: -${formatMoney(discountAmount, currencySymbol, currency)}` : ''
  }${shippingCost > 0 ? `\n- Shipping: +${formatMoney(shippingCost, currencySymbol, currency)}` : ''}
- Total Amount: ${formatMoney(totalAmount, currencySymbol, currency)}
- Paid to Date: ${formatMoney(amountPaid, currencySymbol, currency)}
- Remaining Balance: ${formatMoney(remainingAmount, currencySymbol, currency)}

--------------------------------------------------
VIEW & DOWNLOAD INVOICE (PDF):
${publicUrl}
--------------------------------------------------

Thank you for your business. Please reach out if you have any questions regarding payment.

Best regards,
${companyName}`;

  return { subject, body };
}

/**
 * Build WhatsApp Click-to-Chat URL
 */
export function buildWhatsAppUrl(rawPhone?: string, text?: string): string {
  const encodedText = encodeURIComponent(text || '');

  if (!rawPhone || !rawPhone.trim()) {
    // If no phone is provided, open WhatsApp with text ready to select contact
    return `https://api.whatsapp.com/send?text=${encodedText}`;
  }

  const normalized = normalizePhoneNumber(rawPhone);
  if (normalized.isValid && normalized.e164) {
    const digits = normalized.e164.replace(/\D/g, '');
    return `https://api.whatsapp.com/send?phone=${digits}&text=${encodedText}`;
  }

  // Fallback: extract any digits from raw input
  const fallbackDigits = rawPhone.replace(/\D/g, '');
  if (fallbackDigits.length >= 7) {
    return `https://api.whatsapp.com/send?phone=${fallbackDigits}&text=${encodedText}`;
  }

  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Build mailto URL
 */
export function buildMailtoUrl(email?: string, subject?: string, body?: string): string {
  const cleanEmail = (email || '').trim();
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);

  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${cleanEmail}${query}`;
}
