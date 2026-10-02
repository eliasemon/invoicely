'use server';

import { supabaseAdmin, getUserId, getLinkedUserIds } from '@/lib/supabase/admin';
import { GroupData } from '@/components/create/LineItemGroup';
import { revalidatePath } from 'next/cache';

async function resolveClientId(userId: string, data: { clientId?: string, clientName?: string, clientPhone?: string, clientAddress?: string }) {
  if (data.clientId) return data.clientId;
  const trimmedName = data.clientName?.trim();
  if (!trimmedName) return null;
  
  try {
    const linkedIds = getLinkedUserIds(userId);
    const { data: existing } = await supabaseAdmin
      .from('clients')
      .select('id')
      .in('profile_id', linkedIds)
      .ilike('name', trimmedName)
      .limit(1);
      
    if (existing && existing.length > 0) return existing[0].id;
    
    const { data: newClient } = await supabaseAdmin
      .from('clients')
      .insert({
        profile_id: userId,
        name: trimmedName,
        phone: data.clientPhone?.trim() || null,
        address: data.clientAddress?.trim() || null
      })
      .select('id')
      .single();
      
    return newClient?.id || null;
  } catch (err) {
    console.warn('Error resolving client ID:', err);
    return null;
  }
}

async function getNextInvoiceNumber(userId: string) {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;
  
  try {
    const linkedIds = getLinkedUserIds(userId);
    const { data: existingInvoices } = await supabaseAdmin
      .from('invoices')
      .select('invoice_number')
      .in('profile_id', linkedIds)
      .ilike('invoice_number', `${prefix}%`);

    let maxNum = 0;
    if (existingInvoices && existingInvoices.length > 0) {
      for (const inv of existingInvoices) {
        if (inv.invoice_number && inv.invoice_number.startsWith(prefix)) {
          const suffix = inv.invoice_number.substring(prefix.length);
          const parsed = parseInt(suffix, 10);
          if (!isNaN(parsed) && parsed > maxNum) {
            maxNum = parsed;
          }
        }
      }
    }
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  } catch (e) {
    console.warn('Error computing next invoice number:', e);
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }
}

async function ensureProfile(userId: string) {
  try {
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileData) return profileData;

    const { data: newProfile } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        default_currency: 'USD',
        invoice_edit_enabled: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    return newProfile;
  } catch (err) {
    console.warn('Error ensuring user profile:', err);
    return null;
  }
}

export async function createInvoice(data: {
  invoiceId?: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  groups: GroupData[];
  discountType?: 'amount' | 'percentage';
  discountValue?: number;
  shippingCost?: number;
  issuedAt?: string;
  dueDate?: string;
  subjectEnabled?: boolean;
  subject?: string;
  subjectInvoice?: string;
  subjectChallan?: string;
  subjectQuotation?: string;
  invoiceModeEnabled?: boolean;
  challanModeEnabled?: boolean;
  quotationModeEnabled?: boolean;
  noteEnabled?: boolean;
  noteText?: string;
  template?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { success: false, error: 'You are not logged in. Please sign in to save invoices.' };
    }

    // 1. Generate Invoice Number if new invoice
    const invoiceNumber = data.invoiceId ? undefined : await getNextInvoiceNumber(userId);

    // 2. Calculate Total
    const subtotal = data.groups.reduce((acc, g) => 
      acc + g.items.reduce((itemAcc, item) => itemAcc + ((item.isFlatRate ? 1 : item.quantity) * item.unitPrice), 0), 
    0);

    const discountAmount = data.discountType === 'percentage' 
      ? subtotal * ((data.discountValue || 0) / 100) 
      : (data.discountValue || 0);

    const totalAmount = Math.max(0, subtotal - discountAmount) + (data.shippingCost || 0);

    // 3. Ensure user profile exists to satisfy foreign key constraints
    const profile = await ensureProfile(userId);
    const itemCurrency = profile?.default_currency || 'USD';

  // 4. Upsert unique line items to global catalog safely
  try {
    const uniqueItems = new Map<string, number>();
    data.groups.forEach(g => {
      g.items.forEach(item => {
        if (item.name && item.name.trim()) {
          uniqueItems.set(item.name.trim(), item.unitPrice || 0);
        }
      });
    });

    const upsertPromises = Array.from(uniqueItems.entries()).map(async ([name, price]) => {
      const { data: existingItem } = await supabaseAdmin
        .from('global_items')
        .select('unit_price')
        .eq('name', name)
        .maybeSingle();

      const existingPrices = (existingItem?.unit_price && typeof existingItem.unit_price === 'object')
        ? existingItem.unit_price
        : {};
      const updatedPrices = { ...existingPrices, [itemCurrency]: price };

      return supabaseAdmin.from('global_items').upsert({
        name,
        unit_price: updatedPrices,
        updated_at: new Date().toISOString()
      }, { onConflict: 'name' });
    });

    await Promise.all(upsertPromises);
  } catch (syncErr) {
    console.warn('Could not sync items with global catalog:', syncErr);
  }

  let existingInvoice = null;
  if (data.invoiceId) {
    const linkedIds = getLinkedUserIds(userId);
    const { data: inv } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', data.invoiceId)
      .in('profile_id', linkedIds)
      .maybeSingle();
    existingInvoice = inv;
    
    if (inv && inv.status !== 'DRAFT') {
      if (profile?.invoice_edit_enabled === false) {
        throw new Error('Invoice editing is disabled');
      }
    }
  }

  const now = new Date();
  const dueDateValue = new Date(now);
  dueDateValue.setDate(dueDateValue.getDate() + 30);
  
  let issuedAt = data.issuedAt;
  if (!issuedAt) {
    if (existingInvoice && existingInvoice.status !== 'DRAFT') {
      issuedAt = existingInvoice.issued_at;
    } else {
      issuedAt = now.toISOString();
    }
  }

  let dueDate = data.dueDate;
  if (!dueDate) {
    if (existingInvoice && existingInvoice.status !== 'DRAFT') {
      dueDate = existingInvoice.due_date;
    } else {
      dueDate = dueDateValue.toISOString();
    }
  }
  
  const resolvedClientId = await resolveClientId(userId, data);

  const currentAmountPaid = existingInvoice ? Number(existingInvoice.amount_paid || 0) : 0;

  let newStatus = 'UNPAID';
  if (currentAmountPaid >= totalAmount && totalAmount > 0) {
    newStatus = 'PAID';
  } else if (currentAmountPaid > 0) {
    newStatus = 'PARTIAL';
  }

  const payload = {
      client_id: resolvedClientId,
      client_name: data.clientName,
      client_phone: data.clientPhone,
      client_address: data.clientAddress || null,
      status: newStatus,
      total_amount: totalAmount,
      line_items_snapshot: data.groups,
      discount_type: data.discountType || null,
      discount_value: data.discountValue || null,
      shipping_cost: data.shippingCost || null,
      issued_at: issuedAt,
      due_date: dueDate,
      amount_paid: currentAmountPaid,
      
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
      terms_and_conditions_enabled: profile?.terms_and_conditions_enabled ?? true,
      terms_and_conditions: profile?.terms_and_conditions_enabled ? profile.terms_and_conditions : null,
      brand_voice_enabled: profile?.brand_voice_enabled ?? true,
      brand_voice: profile?.brand_voice_enabled ? profile.brand_voice : null,
      subject_enabled: data.subjectEnabled ?? true,
      subject: data.subject || null,
      subject_invoice: data.subjectInvoice || 'Bill for Items/Services',
      subject_challan: data.subjectChallan || 'Delivery Challan for Items/Services',
      subject_quotation: data.subjectQuotation || 'Quotation for Items/Services',
      invoice_mode_enabled: data.invoiceModeEnabled ?? true,
      challan_mode_enabled: data.challanModeEnabled ?? true,
      quotation_mode_enabled: data.quotationModeEnabled ?? true,
      note_enabled: data.noteEnabled ?? true,
      note_text: data.noteText || null,
      template: data.template || 'sleek-accent',
      updated_at: now.toISOString()
  } as any;

  if (existingInvoice && existingInvoice.status !== 'DRAFT') {
    const editLog = {
      type: 'EDIT',
      date: now.toISOString(),
      note: 'Invoice updated'
    };
    payload.logs = [...(existingInvoice.logs || []), editLog];
  }

  let invoice;
  let error;

  if (data.invoiceId) {
    const linkedIds = getLinkedUserIds(userId);
    const res = await supabaseAdmin
      .from('invoices')
      .update(payload)
      .eq('id', data.invoiceId)
      .in('profile_id', linkedIds)
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
      return { success: false, error: error.message || 'Failed to create invoice' };
    }

    return { success: true, data: invoice };
  } catch (err: any) {
    console.error('Exception creating invoice:', err);
    return { success: false, error: err?.message || 'Unexpected error creating invoice' };
  }
}

export async function getInvoices(filters?: { search?: string, status?: string, clientName?: string, clientId?: string }) {
  try {
    const userId = await getUserId();
    if (!userId) return [];

    const linkedIds = getLinkedUserIds(userId);

    let query = supabaseAdmin
      .from('invoices')
      .select('*')
      .in('profile_id', linkedIds)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status.toUpperCase());
    }

    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    } else if (filters?.clientName) {
      query = query.eq('client_name', filters.clientName);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      query = query.or(`client_name.ilike.%${searchLower}%,client_phone.ilike.%${searchLower}%,invoice_number.ilike.%${searchLower}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }

    return data || [];
  } catch (err: any) {
    if (err && typeof err === 'object' && 'digest' in err && (err.digest === 'DYNAMIC_SERVER_USAGE' || String(err.digest).startsWith('NEXT_'))) {
      throw err;
    }
    console.error('Exception fetching invoices:', err);
    return [];
  }
}

export async function getInvoice(id: string) {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    // Validate UUID to prevent Supabase error 22P02
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return null;

    const linkedIds = getLinkedUserIds(userId);

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .in('profile_id', linkedIds)
      .maybeSingle();

    if (error) {
      console.error('Error fetching invoice:', error.message || error);
      return null;
    }

    return data;
  } catch (err: any) {
    if (err && typeof err === 'object' && 'digest' in err && (err.digest === 'DYNAMIC_SERVER_USAGE' || String(err.digest).startsWith('NEXT_'))) {
      throw err;
    }
    console.error('Exception fetching invoice:', err);
    return null;
  }
}

export async function getPublicInvoice(id: string) {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return null;

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (invoiceError || !invoice) {
      console.error('Error fetching public invoice:', invoiceError?.message || invoiceError);
      return null;
    }

    let profile = null;
    if (invoice.profile_id) {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', invoice.profile_id)
        .maybeSingle();
      profile = profileData;
    }

    return { ...invoice, profile };
  } catch (err) {
    console.error('Exception fetching public invoice:', err);
    return null;
  }
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
  try {
    const userId = await getUserId();
    if (!userId) return [];

    if (!query || query.trim().length < 2) return [];

    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('id, name, phone, address')
      .eq('profile_id', userId)
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Error searching clients:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception searching clients:', err);
    return [];
  }
}

export async function saveDraftInvoice(data: {
  invoiceId?: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  clientAddress?: string;
  groups: GroupData[];
  discountType?: 'amount' | 'percentage';
  discountValue?: number;
  shippingCost?: number;
  issuedAt?: string;
  dueDate?: string;
  subjectEnabled?: boolean;
  subject?: string;
  subjectInvoice?: string;
  subjectChallan?: string;
  subjectQuotation?: string;
  invoiceModeEnabled?: boolean;
  challanModeEnabled?: boolean;
  quotationModeEnabled?: boolean;
  noteEnabled?: boolean;
  noteText?: string;
  template?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { success: false, error: 'You are not logged in. Please sign in to save drafts.' };
    }

    const resolvedClientName = data.clientName?.trim() || 'Draft Client';
    const resolvedClientPhone = data.clientPhone?.trim() || '';

    let invoiceNumber: string | undefined = undefined;
    if (!data.invoiceId) {
      invoiceNumber = await getNextInvoiceNumber(userId);
    }

    const subtotal = (data.groups || []).reduce((acc, g) => 
      acc + (g.items || []).reduce((itemAcc, item) => itemAcc + ((item.isFlatRate ? 1 : item.quantity) * (item.unitPrice || 0)), 0), 
    0);

    const discountAmount = data.discountType === 'percentage' 
      ? subtotal * ((data.discountValue || 0) / 100) 
      : (data.discountValue || 0);

    const totalAmount = Math.max(0, subtotal - discountAmount) + (data.shippingCost || 0);

    const profile = await ensureProfile(userId);
      
    const resolvedClientId = await resolveClientId(userId, {
      clientId: data.clientId,
      clientName: resolvedClientName,
      clientPhone: resolvedClientPhone,
      clientAddress: data.clientAddress
    });

    let existingInvoice = null;
    if (data.invoiceId) {
      const linkedIds = getLinkedUserIds(userId);
      const { data: inv } = await supabaseAdmin
        .from('invoices')
        .select('*')
        .eq('id', data.invoiceId)
        .in('profile_id', linkedIds)
        .maybeSingle();
      existingInvoice = inv;
    }

    const currentAmountPaid = existingInvoice ? Number(existingInvoice.amount_paid || 0) : 0;
    const currentStatus = existingInvoice ? existingInvoice.status : 'DRAFT';

    let newStatus = currentStatus;
    if (currentStatus !== 'DRAFT') {
      if (currentAmountPaid >= totalAmount && totalAmount > 0) {
        newStatus = 'PAID';
      } else if (currentAmountPaid > 0) {
        newStatus = 'PARTIAL';
      } else {
        newStatus = 'UNPAID';
      }
    }

    const payload: any = {
      client_id: resolvedClientId,
      client_name: resolvedClientName,
      client_phone: resolvedClientPhone,
      client_address: data.clientAddress || null,
      status: newStatus,
      total_amount: totalAmount,
      line_items_snapshot: data.groups || [],
      discount_type: data.discountType || null,
      discount_value: data.discountValue || null,
      shipping_cost: data.shippingCost || null,
      amount_paid: currentAmountPaid,
      
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
      terms_and_conditions_enabled: profile?.terms_and_conditions_enabled ?? true,
      terms_and_conditions: profile?.terms_and_conditions_enabled ? profile.terms_and_conditions : null,
      brand_voice_enabled: profile?.brand_voice_enabled ?? true,
      brand_voice: profile?.brand_voice_enabled ? profile.brand_voice : null,
      subject_enabled: data.subjectEnabled ?? true,
      subject: data.subject || null,
      subject_invoice: data.subjectInvoice || 'Bill for Items/Services',
      subject_challan: data.subjectChallan || 'Delivery Challan for Items/Services',
      subject_quotation: data.subjectQuotation || 'Quotation for Items/Services',
      invoice_mode_enabled: data.invoiceModeEnabled ?? true,
      challan_mode_enabled: data.challanModeEnabled ?? true,
      quotation_mode_enabled: data.quotationModeEnabled ?? true,
      note_enabled: data.noteEnabled ?? true,
      note_text: data.noteText || null,
      template: data.template || 'sleek-accent',
      updated_at: new Date().toISOString()
    };

    if (data.issuedAt) {
      payload.issued_at = data.issuedAt;
    } else if (!existingInvoice || existingInvoice.status === 'DRAFT') {
      // Keep draft fresh
      payload.issued_at = new Date().toISOString();
    }
    
    if (data.dueDate) {
      payload.due_date = data.dueDate;
    } else if (!existingInvoice || existingInvoice.status === 'DRAFT') {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      payload.due_date = defaultDueDate.toISOString();
    }

    let invoice;
    let error;

    if (data.invoiceId) {
      const linkedIds = getLinkedUserIds(userId);
      const res = await supabaseAdmin
        .from('invoices')
        .update(payload)
        .eq('id', data.invoiceId)
        .in('profile_id', linkedIds)
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
      return { success: false, error: error.message || 'Failed to save draft' };
    }

    return { success: true, data: invoice };
  } catch (err: any) {
    console.error('Exception saving draft:', err);
    return { success: false, error: err?.message || 'Unexpected error saving draft' };
  }
}

export async function recordPayment(id: string, amount: number, note?: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) throw new Error('Invalid invoice ID');

  const linkedIds = getLinkedUserIds(userId);

  // Fetch current invoice to calculate new status
  const { data: invoice, error: fetchError } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', id)
    .in('profile_id', linkedIds)
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

  const paymentLog = {
    id: crypto.randomUUID(),
    type: 'PAYMENT',
    amount,
    note: note || '',
    date: new Date().toISOString()
  };

  const currentLogs = invoice.logs || [];
  const newLogs = [...currentLogs, paymentLog];

  const { error } = await supabaseAdmin
    .from('invoices')
    .update({ 
      amount_paid: newAmountPaid, 
      status: newStatus,
      logs: newLogs,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .in('profile_id', linkedIds);

  if (error) {
    console.error('Error recording payment:', error);
    throw new Error('Failed to record payment');
  }
}

export async function deleteInvoice(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) throw new Error('Invalid invoice ID');

  const linkedIds = getLinkedUserIds(userId);

  const { data: invoice } = await supabaseAdmin
    .from('invoices')
    .select('status')
    .eq('id', id)
    .in('profile_id', linkedIds)
    .single();

  if (!invoice) throw new Error('Invoice not found');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('invoice_edit_enabled')
    .in('id', linkedIds)
    .maybeSingle();

  const editEnabled = profile?.invoice_edit_enabled ?? true;

  if (invoice.status !== 'DRAFT' && !editEnabled) {
    throw new Error('Only draft invoices can be deleted unless invoice editing is enabled');
  }

  const { error } = await supabaseAdmin
    .from('invoices')
    .delete()
    .eq('id', id)
    .in('profile_id', linkedIds);

  if (error) {
    console.error('Error deleting invoice:', error);
    throw new Error('Failed to delete invoice');
  }
}

export async function deletePayment(invoiceId: string, paymentLogId: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(invoiceId)) throw new Error('Invalid invoice ID');

  const linkedIds = getLinkedUserIds(userId);

  const { data: invoice, error: fetchError } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .in('profile_id', linkedIds)
    .single();

  if (fetchError || !invoice) {
    throw new Error('Invoice not found');
  }

  const logs = invoice.logs || [];
  const paymentLog = logs.find((l: any) => l.id === paymentLogId && l.type === 'PAYMENT');
  
  if (!paymentLog) {
    throw new Error('Payment log not found');
  }

  // Ensure this payment hasn't already been contra'd
  const hasContra = logs.some((l: any) => l.type === 'CONTRA' && l.original_payment_id === paymentLogId);
  if (hasContra) {
    throw new Error('Payment already deleted');
  }

  const amountToSubtract = Number(paymentLog.amount);
  const currentPaid = Number(invoice.amount_paid || 0);
  const newAmountPaid = Math.max(0, currentPaid - amountToSubtract);
  
  let newStatus = 'PARTIAL';
  if (newAmountPaid >= Number(invoice.total_amount) && Number(invoice.total_amount) > 0) {
    newStatus = 'PAID';
  } else if (newAmountPaid <= 0) {
    newStatus = 'UNPAID';
  }

  const contraLog = {
    id: crypto.randomUUID(),
    type: 'CONTRA',
    original_payment_id: paymentLogId,
    amount: -amountToSubtract,
    note: 'Payment reversed',
    date: new Date().toISOString()
  };

  const newLogs = [...logs, contraLog];

  const { error } = await supabaseAdmin
    .from('invoices')
    .update({ 
      amount_paid: newAmountPaid, 
      status: newStatus,
      logs: newLogs,
      updated_at: new Date().toISOString() 
    })
    .eq('id', invoiceId)
    .in('profile_id', linkedIds);

  if (error) {
    console.error('Error deleting payment:', error);
    throw new Error('Failed to delete payment');
  }
}

export async function updateInvoiceSettings(invoiceId: string, settings: {
  subject_enabled?: boolean;
  subject?: string | null;
  subject_invoice?: string | null;
  subject_challan?: string | null;
  subject_quotation?: string | null;
  invoice_mode_enabled?: boolean;
  challan_mode_enabled?: boolean;
  quotation_mode_enabled?: boolean;
  note_enabled?: boolean;
  note_text?: string | null;
  template?: string;
}) {
  const userId = await getUserId();
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const linkedIds = getLinkedUserIds(userId);

  // Security guard: verify that the caller is the owner of the invoice
  const { data: inv, error: fetchErr } = await supabaseAdmin
    .from('invoices')
    .select('id, profile_id, invoice_mode_enabled, challan_mode_enabled, quotation_mode_enabled')
    .eq('id', invoiceId)
    .single();

  if (fetchErr || !inv) {
    throw new Error('Invoice not found');
  }

  if (!linkedIds.includes(inv.profile_id)) {
    throw new Error('Unauthorized: Only the invoice owner can modify settings');
  }

  // Ensure at least one mode remains enabled
  const finalInvoiceMode = settings.invoice_mode_enabled !== undefined ? settings.invoice_mode_enabled : (inv.invoice_mode_enabled ?? true);
  const finalChallanMode = settings.challan_mode_enabled !== undefined ? settings.challan_mode_enabled : (inv.challan_mode_enabled ?? true);
  const finalQuotationMode = settings.quotation_mode_enabled !== undefined ? settings.quotation_mode_enabled : (inv.quotation_mode_enabled ?? true);

  if (!finalInvoiceMode && !finalChallanMode && !finalQuotationMode) {
    throw new Error('At least one document format must remain enabled for public view.');
  }

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .update({
      ...settings,
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating invoice settings:', error);
    throw new Error('Failed to update invoice settings');
  }

  try {
    revalidatePath(`/public/invoice/${invoiceId}`);
    revalidatePath(`/invoices/${invoiceId}`);
  } catch (revErr) {
    console.warn('Revalidation warning:', revErr);
  }

  return data;
}

export async function checkIsInvoiceOwner(invoiceId: string): Promise<boolean> {
  try {
    const userId = await getUserId();
    if (!userId) return false;
    const linkedIds = getLinkedUserIds(userId);
    const { data: inv } = await supabaseAdmin
      .from('invoices')
      .select('profile_id')
      .eq('id', invoiceId)
      .maybeSingle();
    if (!inv || !inv.profile_id) return false;
    return linkedIds.includes(inv.profile_id);
  } catch {
    return false;
  }
}


