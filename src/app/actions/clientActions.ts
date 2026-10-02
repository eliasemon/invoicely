'use server';

import { supabaseAdmin, getUserId, getLinkedUserIds } from '@/lib/supabase/admin';

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
  try {
    const userId = await getUserId();
    if (!userId) return [];

    const linkedIds = getLinkedUserIds(userId);

    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .in('profile_id', linkedIds)
      .order('name', { ascending: true });

    if (clientsError || !clients) {
      console.error('Error fetching clients:', clientsError);
      return [];
    }

    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('client_id, total_amount, amount_paid, status, currency, currency_symbol')
      .in('profile_id', linkedIds);

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
      const summary = clientMap.get(invoice.client_id);
      if (!summary) return;

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

    return Array.from(clientMap.values());
  } catch (err: any) {
    if (err && typeof err === 'object' && 'digest' in err && (err.digest === 'DYNAMIC_SERVER_USAGE' || String(err.digest).startsWith('NEXT_'))) {
      throw err;
    }
    console.error('Exception in getClients:', err);
    return [];
  }
}

export async function getClientSummary(clientId: string): Promise<ClientSummary | null> {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    const linkedIds = getLinkedUserIds(userId);

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .in('profile_id', linkedIds)
      .single();

    if (clientError || !client) {
      console.error('Error fetching client details:', clientError);
      return null;
    }

    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('total_amount, amount_paid, status, currency, currency_symbol')
      .eq('client_id', clientId)
      .in('profile_id', linkedIds);

    if (invoicesError) {
      console.error('Error fetching client invoices:', invoicesError);
    }

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
  } catch (err: any) {
    if (err && typeof err === 'object' && 'digest' in err && (err.digest === 'DYNAMIC_SERVER_USAGE' || String(err.digest).startsWith('NEXT_'))) {
      throw err;
    }
    console.error('Exception fetching client summary:', err);
    return null;
  }
}

export async function updateClient(id: string, data: { name: string, phone?: string, address?: string, email?: string }) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const linkedIds = getLinkedUserIds(userId);

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
    .in('profile_id', linkedIds);

  if (error) {
    console.error('Error updating client:', error);
    throw new Error(error.message || 'Failed to update client');
  }
}
