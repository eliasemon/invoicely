'use server';

import { supabaseAdmin, getUserId } from '@/lib/supabase/admin';
import { GroupData } from '@/components/create/LineItemGroup';

export async function createInvoice(data: {
  invoiceId?: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  template: string;
  groups: GroupData[];
  discountType?: 'amount' | 'percentage';
  discountValue?: number;
  shippingCost?: number;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  // 1. Generate Invoice Number (simple format for now)
  const { count } = await supabaseAdmin
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', userId);
  
  const nextNum = (count || 0) + 1;
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;

  // 2. Calculate Total
  const subtotal = data.groups.reduce((acc, g) => 
    acc + g.items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.unitPrice), 0), 
  0);

  const discountAmount = data.discountType === 'percentage' 
    ? subtotal * ((data.discountValue || 0) / 100) 
    : (data.discountValue || 0);

  const totalAmount = Math.max(0, subtotal - discountAmount) + (data.shippingCost || 0);

  // 3. Upsert all unique line items to global catalog
  const uniqueItems = new Map<string, number>();
  data.groups.forEach(g => {
    g.items.forEach(item => {
      if (item.name.trim()) {
        uniqueItems.set(item.name.trim(), item.unitPrice);
      }
    });
  });

  const upsertPromises = Array.from(uniqueItems.entries()).map(([name, price]) => 
    supabaseAdmin.from('global_items').upsert({
      name,
      unit_price: price,
      updated_at: new Date().toISOString()
    }, { onConflict: 'name' })
  );

  await Promise.all(upsertPromises);

  // 4. Fetch user profile to snapshot settings
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const now = new Date();
  const dueDateValue = new Date(now);
  dueDateValue.setDate(dueDateValue.getDate() + 30);

  const payload = {
      client_name: data.clientName,
      client_phone: data.clientPhone,
      client_address: data.clientAddress || null,
      status: 'UNPAID',
      template: data.template,
      total_amount: totalAmount,
      line_items_snapshot: data.groups,
      discount_type: data.discountType || null,
      discount_value: data.discountValue || null,
      shipping_cost: data.shippingCost || null,
      issued_at: now.toISOString(),
      due_date: dueDateValue.toISOString(),
      
      // Snapshot Profile details if enabled
      currency: profile?.default_currency || 'USD',
      currency_symbol: profile?.currency_symbol || (() => {
        const fallbackCurrency = profile?.default_currency || 'USD';
        try {
          const parts = new Intl.NumberFormat('en', { style: 'currency', currency: fallbackCurrency, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
          return parts.find(p => p.type === 'currency')?.value || fallbackCurrency;
        } catch {
          return fallbackCurrency;
        }
      })(),
      signature_url: profile?.signature_enabled ? profile.signature_url : null,
      signatory_name: profile?.signature_enabled ? profile.signatory_name : null,
      bank_name: profile?.bank_enabled ? profile.bank_name : null,
      bank_account_holder: profile?.bank_enabled ? profile.bank_account_holder : null,
      bank_account_number: profile?.bank_enabled ? profile.bank_account_number : null,
      bank_swift: profile?.bank_enabled ? profile.bank_swift : null,
      updated_at: now.toISOString()
  };

  let invoice;
  let error;

  if (data.invoiceId) {
    const res = await supabaseAdmin
      .from('invoices')
      .update(payload)
      .eq('id', data.invoiceId)
      .eq('profile_id', userId)
      .select()
      .single();
    invoice = res.data;
    error = res.error;
  } else {
    const res = await supabaseAdmin
      .from('invoices')
      .insert({
        profile_id: userId,
        invoice_number: invoiceNumber,
        ...payload
      })
      .select()
      .single();
    invoice = res.data;
    error = res.error;
  }

  if (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice');
  }

  return invoice;
}

export async function getInvoices() {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }

  return data;
}

export async function getInvoice(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('profile_id', userId)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }

  return data;
}

export async function getPublicInvoice(id: string) {
  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (invoiceError || !invoice) {
    console.error('Error fetching public invoice:', invoiceError);
    return null;
  }

  let profile = null;
  if (invoice.profile_id) {
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', invoice.profile_id)
      .single();
    profile = profileData;
  }

  return { ...invoice, profile };
}

export async function updateInvoiceStatus(id: string, status: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { error } = await supabaseAdmin
    .from('invoices')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('profile_id', userId);

  if (error) {
    console.error('Error updating invoice status:', error);
    throw new Error('Failed to update status');
  }
}

export async function searchClients(query: string) {
  const userId = await getUserId();
  if (!userId) return [];

  if (!query || query.trim().length < 2) return [];

  // Query distinct clients based on name or phone from previous invoices
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('client_name, client_phone, client_address')
    .eq('profile_id', userId)
    .or(`client_name.ilike.%${query}%,client_phone.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error searching clients:', error);
    return [];
  }

  // Deduplicate by name
  const uniqueClients = new Map<string, any>();
  data?.forEach(row => {
    if (row.client_name && !uniqueClients.has(row.client_name)) {
      uniqueClients.set(row.client_name, {
        name: row.client_name,
        phone: row.client_phone || '',
        address: row.client_address || ''
      });
    }
  });

  return Array.from(uniqueClients.values());
}

export async function saveDraftInvoice(data: {
  invoiceId?: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  template: string;
  groups: GroupData[];
  discountType?: 'amount' | 'percentage';
  discountValue?: number;
  shippingCost?: number;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { count } = await supabaseAdmin
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', userId);
  
  const nextNum = (count || 0) + 1;
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;

  const subtotal = data.groups.reduce((acc, g) => 
    acc + g.items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.unitPrice), 0), 
  0);

  const discountAmount = data.discountType === 'percentage' 
    ? subtotal * ((data.discountValue || 0) / 100) 
    : (data.discountValue || 0);

  const totalAmount = Math.max(0, subtotal - discountAmount) + (data.shippingCost || 0);

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const payload = {
      client_name: data.clientName,
      client_phone: data.clientPhone,
      client_address: data.clientAddress || null,
      status: 'DRAFT',
      template: data.template,
      total_amount: totalAmount,
      line_items_snapshot: data.groups,
      discount_type: data.discountType || null,
      discount_value: data.discountValue || null,
      shipping_cost: data.shippingCost || null,
      amount_paid: 0,
      
      currency: profile?.default_currency || 'USD',
      currency_symbol: profile?.currency_symbol || (() => {
        const fallbackCurrency = profile?.default_currency || 'USD';
        try {
          const parts = new Intl.NumberFormat('en', { style: 'currency', currency: fallbackCurrency, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
          return parts.find(p => p.type === 'currency')?.value || fallbackCurrency;
        } catch {
          return fallbackCurrency;
        }
      })(),
      signature_url: profile?.signature_enabled ? profile.signature_url : null,
      signatory_name: profile?.signature_enabled ? profile.signatory_name : null,
      bank_name: profile?.bank_enabled ? profile.bank_name : null,
      bank_account_holder: profile?.bank_enabled ? profile.bank_account_holder : null,
      bank_account_number: profile?.bank_enabled ? profile.bank_account_number : null,
      bank_swift: profile?.bank_enabled ? profile.bank_swift : null,
      updated_at: new Date().toISOString()
  };

  let invoice;
  let error;

  if (data.invoiceId) {
    const res = await supabaseAdmin
      .from('invoices')
      .update(payload)
      .eq('id', data.invoiceId)
      .eq('profile_id', userId)
      .select()
      .single();
    invoice = res.data;
    error = res.error;
  } else {
    const res = await supabaseAdmin
      .from('invoices')
      .insert({
        profile_id: userId,
        invoice_number: invoiceNumber,
        ...payload
      })
      .select()
      .single();
    invoice = res.data;
    error = res.error;
  }

  if (error) {
    console.error('Error saving draft:', error);
    throw new Error('Failed to save draft');
  }

  return invoice;
}

export async function recordPayment(id: string, amount: number) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  // Fetch current invoice to calculate new status
  const { data: invoice, error: fetchError } = await supabaseAdmin
    .from('invoices')
    .select('total_amount, amount_paid')
    .eq('id', id)
    .eq('profile_id', userId)
    .single();

  if (fetchError || !invoice) {
    throw new Error('Invoice not found');
  }

  const currentPaid = Number(invoice.amount_paid || 0);
  const newAmountPaid = currentPaid + Number(amount);
  
  let newStatus = 'PARTIAL';
  if (newAmountPaid >= Number(invoice.total_amount)) {
    newStatus = 'PAID';
  } else if (newAmountPaid <= 0) {
    newStatus = 'UNPAID';
  }

  const { error } = await supabaseAdmin
    .from('invoices')
    .update({ 
      amount_paid: newAmountPaid, 
      status: newStatus,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .eq('profile_id', userId);

    if (error) {
    console.error('Error recording payment:', error);
    throw new Error('Failed to record payment');
  }
}

export async function deleteInvoice(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data: invoice } = await supabaseAdmin
    .from('invoices')
    .select('status')
    .eq('id', id)
    .eq('profile_id', userId)
    .single();

  if (!invoice) throw new Error('Invoice not found');
  if (invoice.status !== 'DRAFT') {
    throw new Error('Only draft invoices can be deleted');
  }

  const { error } = await supabaseAdmin
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('profile_id', userId);

  if (error) {
    console.error('Error deleting invoice:', error);
    throw new Error('Failed to delete invoice');
  }
}
