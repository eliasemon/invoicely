'use server';

import { supabaseAdmin, getUserId } from '@/lib/supabase/admin';

export interface CurrencySummary {
  currency: string;
  currencySymbol: string | null;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
}

export interface ClientSummary {
  name: string;
  phone: string;
  address: string;
  invoiceCount: number;
  currencies: Record<string, CurrencySummary>;
}

export async function getClients(): Promise<ClientSummary[]> {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data: invoices, error } = await supabaseAdmin
    .from('invoices')
    .select('client_name, client_phone, client_address, total_amount, amount_paid, status, created_at, currency, currency_symbol')
    .eq('profile_id', userId)
    .order('created_at', { ascending: true }); // Order by created_at to get latest phone/address

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  const clientMap = new Map<string, ClientSummary>();

  invoices?.forEach(invoice => {
    if (!invoice.client_name) return;
    
    const existing = clientMap.get(invoice.client_name);
    const amount = Number(invoice.total_amount || 0);
    const paid = Number(invoice.amount_paid || 0);
    
    const outstanding = ['DRAFT', 'PAID'].includes(invoice.status) 
      ? 0 
      : Math.max(0, amount - paid);

    const currencyCode = invoice.currency || 'USD';

    if (existing) {
      existing.invoiceCount += 1;
      if (invoice.client_phone) existing.phone = invoice.client_phone;
      if (invoice.client_address) existing.address = invoice.client_address;

      if (!existing.currencies[currencyCode]) {
        existing.currencies[currencyCode] = {
          currency: currencyCode,
          currencySymbol: invoice.currency_symbol || null,
          totalBilled: 0,
          totalPaid: 0,
          totalOutstanding: 0
        };
      }
      existing.currencies[currencyCode].totalBilled += amount;
      existing.currencies[currencyCode].totalPaid += paid;
      existing.currencies[currencyCode].totalOutstanding += outstanding;

    } else {
      const currencies: Record<string, CurrencySummary> = {};
      currencies[currencyCode] = {
        currency: currencyCode,
        currencySymbol: invoice.currency_symbol || null,
        totalBilled: amount,
        totalPaid: paid,
        totalOutstanding: outstanding
      };

      clientMap.set(invoice.client_name, {
        name: invoice.client_name,
        phone: invoice.client_phone || '',
        address: invoice.client_address || '',
        invoiceCount: 1,
        currencies
      });
    }
  });

  return Array.from(clientMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getClientSummary(clientName: string): Promise<ClientSummary | null> {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data: invoices, error } = await supabaseAdmin
    .from('invoices')
    .select('client_name, client_phone, client_address, total_amount, amount_paid, status, created_at, currency, currency_symbol')
    .eq('profile_id', userId)
    .eq('client_name', clientName)
    .order('created_at', { ascending: true });

  if (error || !invoices || invoices.length === 0) {
    if (error) console.error('Error fetching client summary:', error);
    return null;
  }

  const summary: ClientSummary = {
    name: clientName,
    phone: '',
    address: '',
    invoiceCount: 0,
    currencies: {}
  };

  invoices.forEach(invoice => {
    const amount = Number(invoice.total_amount || 0);
    const paid = Number(invoice.amount_paid || 0);
    const outstanding = ['DRAFT', 'PAID'].includes(invoice.status) 
      ? 0 
      : Math.max(0, amount - paid);

    summary.invoiceCount += 1;

    if (invoice.client_phone) summary.phone = invoice.client_phone;
    if (invoice.client_address) summary.address = invoice.client_address;

    const currencyCode = invoice.currency || 'USD';

    if (!summary.currencies[currencyCode]) {
      summary.currencies[currencyCode] = {
        currency: currencyCode,
        currencySymbol: invoice.currency_symbol || null,
        totalBilled: 0,
        totalPaid: 0,
        totalOutstanding: 0
      };
    }
    summary.currencies[currencyCode].totalBilled += amount;
    summary.currencies[currencyCode].totalPaid += paid;
    summary.currencies[currencyCode].totalOutstanding += outstanding;
  });

  return summary;
}
