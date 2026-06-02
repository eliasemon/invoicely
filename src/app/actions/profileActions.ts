'use server';

import { supabaseAdmin, getUserId } from '@/lib/supabase/admin';
import { UserProfile } from '@/core/ports/database.types';

export async function getProfile() {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned", which is fine for first time
    console.error('Error fetching profile:', error);
    throw new Error('Failed to fetch profile');
  }

  return data as UserProfile | null;
}

export async function updateProfile(profileData: Partial<UserProfile>) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  // Strip metadata fields that should not be sent from the client
  const { id: _id, created_at: _ca, updated_at: _ua, ...cleanData } = profileData as any;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      ...cleanData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile');
  }

  return data as UserProfile;
}

export async function uploadCompanyLogo(formData: FormData) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const file = formData.get('logo') as File;
  if (!file) throw new Error('No file provided');

  // Validate file size and type
  if (file.size > 5 * 1024 * 1024) throw new Error('File too large (max 5MB)');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  // Create a unique file name and sanitize user ID for storage paths
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '_');
  const ext = file.name.split('.').pop();
  const fileName = `logo-${Date.now()}.${ext}`;
  const filePath = `${sanitizedUserId}/${fileName}`;

  // 1. Upload to storage bucket using server admin client (bypasses RLS)
  const { error: uploadError } = await supabaseAdmin.storage
    .from('company-logos')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error('Error uploading logo to storage:', uploadError);
    throw new Error('Failed to upload logo');
  }

  // 2. Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('company-logos')
    .getPublicUrl(filePath);

  // 3. Update the profile with the new logo URL
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      company_logo: publicUrl,
      updated_at: new Date().toISOString()
    });

  if (updateError) {
    console.error('Error updating profile with new logo:', updateError);
    throw new Error('Failed to update profile with logo');
  }

  return publicUrl;
}

export async function deleteCompanyLogo(logoUrl: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '_');

  // Ensure the URL belongs to this user's path before attempting delete
  if (!logoUrl.includes(sanitizedUserId)) {
     throw new Error('Unauthorized to delete this logo');
  }

  // Extract file path from URL
  const urlParts = logoUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const filePath = `${sanitizedUserId}/${fileName}`;

  // 1. Delete from storage bucket
  const { error: deleteError } = await supabaseAdmin.storage
    .from('company-logos')
    .remove([filePath]);

  if (deleteError) {
    console.error('Error deleting logo from storage:', deleteError);
    throw new Error('Failed to delete logo');
  }

  // 2. Clear from profile
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      company_logo: null,
      updated_at: new Date().toISOString()
    });

  if (updateError) {
    console.error('Error clearing logo from profile:', updateError);
    throw new Error('Failed to clear logo from profile');
  }
}

export async function uploadSignature(base64Data: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  // Validate it's a data URL
  if (!base64Data.startsWith('data:image/png;base64,')) {
    throw new Error('Invalid signature format');
  }

  // Convert base64 to buffer safely using an ArrayBuffer
  const base64String = base64Data.split(',')[1];
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '_');
  const fileName = `signature-${Date.now()}.png`;
  const filePath = `${sanitizedUserId}/${fileName}`;

  // 1. Upload to storage bucket using the ArrayBuffer from Uint8Array
  const { error: uploadError } = await supabaseAdmin.storage
    .from('signatures')
    .upload(filePath, bytes.buffer, {
      upsert: true,
      contentType: 'image/png',
    });

  if (uploadError) {
    console.error('Error uploading signature to storage:', uploadError);
    throw new Error(`Failed to upload signature: ${uploadError.message}`);
  }

  // 2. Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('signatures')
    .getPublicUrl(filePath);

  // 3. Persist the signature URL to the profiles table
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      signature_url: publicUrl,
      updated_at: new Date().toISOString()
    });

  if (updateError) {
    console.error('Error updating profile with signature URL:', updateError);
    throw new Error('Failed to save signature URL to profile');
  }

  return publicUrl;
}
