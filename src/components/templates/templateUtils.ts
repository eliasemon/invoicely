import { Invoice } from '@/core/ports/database.types';

export interface TemplateProps {
  invoice: Invoice;
  profile?: {
    id?: string;
    company_name?: string | null;
    company_address?: string | null;
    company_logo?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    billing_address?: string | null;
    default_currency?: string;
    currency_symbol?: string;
    bank_enabled?: boolean;
    bank_name?: string | null;
    bank_account_holder?: string | null;
    bank_account_number?: string | null;
    bank_swift?: string | null;
    signature_enabled?: boolean;
    signature_url?: string | null;
    signatory_name?: string | null;
    qr_code_enabled?: boolean;
    tax_id?: string | null;
    business_registration?: string | null;
  } | null;
  isPreview?: boolean;
  showGroups?: boolean;
  showGroupTotals?: boolean;
  publicUrl?: string;
}

export function formatDate(date: Date | string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
  } catch {
    return 'N/A';
  }
}

export function formatMoney(amount: number, symbol: string = '$'): string {
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getIssueDate(invoice: Invoice): Date {
  if (invoice.issued_at) return new Date(invoice.issued_at);
  return new Date(invoice.createdAt);
}

export function getDueDate(invoice: Invoice, fallbackDays: number = 30): Date {
  if (invoice.due_date) return new Date(invoice.due_date);
  const issueDate = getIssueDate(invoice);
  const d = new Date(issueDate);
  d.setDate(d.getDate() + fallbackDays);
  return d;
}

export function getSubtotal(invoice: Invoice): number {
  if (invoice.groups && invoice.groups.length > 0) {
    return invoice.groups.reduce((acc, g) => 
      acc + g.items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.unitPrice), 0), 
    0);
  }
  return invoice.amount || 0;
}

export function getDiscountAmount(invoice: Invoice, subtotal: number): number {
  if (!invoice.discount_value) return 0;
  if (invoice.discount_type === 'percentage') {
    return subtotal * (invoice.discount_value / 100);
  }
  return invoice.discount_value;
}

export function getShippingCost(invoice: Invoice): number {
  return invoice.shipping_cost || 0;
}

export function getTotal(invoice: Invoice): number {
  const subtotal = getSubtotal(invoice);
  const discount = getDiscountAmount(invoice, subtotal);
  const shipping = getShippingCost(invoice);
  return Math.max(0, subtotal - discount) + shipping;
}

export function getAllItems(invoice: Invoice): { name: string; quantity: number; unitPrice: number; groupName?: string }[] {
  const items: { name: string; quantity: number; unitPrice: number; groupName?: string }[] = [];
  invoice.groups?.forEach(group => {
    group.items.forEach(item => {
      items.push({ ...item, groupName: group.name });
    });
  });
  return items;
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion'];

  let words = '';
  let scaleIdx = 0;

  num = Math.floor(num);

  while (num > 0) {
    let chunk = num % 1000;
    if (chunk > 0) {
      let chunkWords = '';
      if (chunk > 99) {
        chunkWords += ones[Math.floor(chunk / 100)] + ' Hundred ';
        chunk %= 100;
      }
      if (chunk > 19) {
        chunkWords += tens[Math.floor(chunk / 10)] + (chunk % 10 !== 0 ? '-' : ' ');
        chunk %= 10;
      }
      if (chunk > 0) {
        chunkWords += ones[chunk] + ' ';
      }
      words = chunkWords + scales[scaleIdx] + ' ' + words;
    }
    num = Math.floor(num / 1000);
    scaleIdx++;
  }

  return words.trim();
}
