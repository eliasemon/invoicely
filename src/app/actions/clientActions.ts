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
  id: string;
  name: string;
  phone: string;
  address: string;
  invoiceCount: number;
  currencies: Record<string, CurrencySummary>;
}

export async function getClients(): Promise<ClientSummary[]> {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data: clients, error: clientsError } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('profile_id', userId)
    .order('name', { ascending: true });

  if (clientsError || !clients) {
    console.error('Error fetching clients:', clientsError);
    return [];
  }

  const { data: invoices, error: invoicesError } = await supabaseAdmin
    .from('invoices')
    .select('client_id, total_amount, amount_paid, status, currency, currency_symbol')
    .eq('profile_id', userId);

  if (invoicesError) {
    console.error('Error fetching invoices for clients:', invoicesError);
  }

  const clientMap = new Map<string, ClientSummary>();

  clients.forEach(c => {
    clientMap.set(c.id, {
      id: c.id,
      name: c.name,
      phone: c.phone || '',
      address: c.address || '',
      invoiceCount: 0,
      currencies: {}
    });
  });

  invoices?.forEach(invoice => {
    if (!invoice.client_id) return;
    const existing = clientMap.get(invoice.client_id);
    if (!existing) return;

    const amount = Number(invoice.total_amount || 0);
    const paid = Number(invoice.amount_paid || 0);
    const outstanding = ['DRAFT', 'PAID'].includes(invoice.status) 
      ? 0 
      : Math.max(0, amount - paid);

    const currencyCode = invoice.currency || 'USD';

    existing.invoiceCount += 1;

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
  });

  return Array.from(clientMap.values());
}

export async function getClientSummary(id: string): Promise<ClientSummary | null> {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  console.log('Fetching client summary for:', id, 'User ID:', userId);

  const { data: client, error: clientError } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('profile_id', userId)
    .single();

  if (clientError || !client) {
    console.error('Error fetching client:', clientError, 'Client Data:', client);
    return null;
  }

  const { data: invoices, error: invoicesError } = await supabaseAdmin
    .from('invoices')
    .select('total_amount, amount_paid, status, currency, currency_symbol')
    .eq('profile_id', userId)
    .eq('client_id', id);

  const summary: ClientSummary = {
    id: client.id,
    name: client.name,
    phone: client.phone || '',
    address: client.address || '',
    invoiceCount: 0,
    currencies: {}
  };

  invoices?.forEach(invoice => {
    const amount = Number(invoice.total_amount || 0);
    const paid = Number(invoice.amount_paid || 0);
    const outstanding = ['DRAFT', 'PAID'].includes(invoice.status) 
      ? 0 
      : Math.max(0, amount - paid);

    summary.invoiceCount += 1;

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

export async function updateClient(id: string, data: { name: string, phone?: string, address?: string, email?: string }) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { error } = await supabaseAdmin
    .from('clients')
    .update({
      name: data.name,
      phone: data.phone || null,
      address: data.address || null,
      email: data.email || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('profile_id', userId);

  if (error) {
    console.error('Error updating client:', error);
    throw new Error('Failed to update client');
  }
}
