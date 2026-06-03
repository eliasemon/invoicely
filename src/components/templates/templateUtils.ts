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
  } | null;
  isPreview?: boolean;
  showGroups?: boolean;
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

export function getDueDate(createdAt: Date | string, days: number = 30): Date {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + days);
  return d;
}

export function getSubtotal(invoice: Invoice): number {
  return invoice.amount || 0;
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
