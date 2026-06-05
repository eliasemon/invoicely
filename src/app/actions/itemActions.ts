'use server';

import { supabaseAdmin, getUserId } from '@/lib/supabase/admin';

export async function searchItems(query: string) {
  // Authentication check is optional for global catalog, but let's keep it to ensure only logged-in users search
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabaseAdmin
    .from('global_items')
    .select('name, unit_price')
    .ilike('name', `%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error searching items:', error);
    return [];
  }

  return data;
}

export async function upsertItem(name: string, unitPrice: number, currency: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  // Fetch the existing item to merge prices
  const { data: existingItem } = await supabaseAdmin
    .from('global_items')
    .select('unit_price')
    .eq('name', name)
    .single();

  const existingPrices = existingItem?.unit_price || {};
  const updatedPrices = { ...existingPrices, [currency]: unitPrice };

  const { error } = await supabaseAdmin
    .from('global_items')
    .upsert(
      { 
        name, 
        unit_price: updatedPrices,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'name' }
    );

  if (error) {
    console.error('Error upserting item:', error);
    throw new Error('Failed to update item');
  }
}
