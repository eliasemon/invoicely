'use server';

import { supabaseAdmin, getUserId, getLinkedUserIds } from '@/lib/supabase/admin';
import { UserProfile } from '@/core/ports/database.types';

export async function getProfile(): Promise<UserProfile | null> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return null;
    }

    const linkedIds = getLinkedUserIds(userId);

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('id', linkedIds);

    if (error) {
      console.warn('Error fetching profile from database:', error.message || error);
      return null;
    }

    // Prefer exact current userId match if it has profile info, otherwise any linked profile that has content
    let profile = data?.find(p => p.id === userId && (p.company_name || p.full_name));
    if (!profile && data && data.length > 0) {
      profile = data.find(p => p.company_name || p.full_name) || data[0];
    }

    if (!profile) {
      // Auto-create/ensure profile exists if missing
      const { data: newProfile, error: upsertErr } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          default_currency: 'USD',
          invoice_edit_enabled: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (upsertErr) {
        console.warn('Error creating default profile:', upsertErr);
        return null;
      }
      return newProfile as UserProfile | null;
    }

    return profile as UserProfile | null;
  } catch (err: any) {
    if (err && typeof err === 'object' && 'digest' in err && (err.digest === 'DYNAMIC_SERVER_USAGE' || String(err.digest).startsWith('NEXT_'))) {
      throw err;
    }
    console.error('Exception in getProfile:', err);
    return null;
  }
}

export async function updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const linkedIds = getLinkedUserIds(userId);

    // Strip metadata fields that should not be sent from the client
    const { id: _id, created_at: _ca, updated_at: _ua, ...cleanData } = profileData as any;

    const upsertPromises = linkedIds.map(id =>
      supabaseAdmin
        .from('profiles')
        .upsert({
          id,
          ...cleanData,
          updated_at: new Date().toISOString()
        })
        .select()
        .maybeSingle()
    );

    const results = await Promise.all(upsertPromises);
    const primaryResult = results.find(r => r.data?.id === userId) || results[0];

    if (primaryResult.error) {
      console.error('Error updating profile:', primaryResult.error);
      throw new Error(primaryResult.error.message || 'Failed to update profile');
    }

    return primaryResult.data as UserProfile;
  } catch (err: any) {
    console.error('Exception in updateProfile:', err);
    throw new Error(err?.message || 'Failed to update profile');
  }
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

  // 3. Update all linked profiles with the new logo URL
  const linkedIds = getLinkedUserIds(userId);
  await Promise.all(
    linkedIds.map(id =>
      supabaseAdmin
        .from('profiles')
        .upsert({
          id,
          company_logo: publicUrl,
          updated_at: new Date().toISOString()
        })
    )
  );

  return publicUrl;
}

export async function deleteCompanyLogo(logoUrl: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  const linkedIds = getLinkedUserIds(userId);
  const isAuthorized = linkedIds.some(id => {
    const sanitized = id.replace(/[^a-zA-Z0-9-]/g, '_');
    return logoUrl.includes(sanitized);
  });

  // Ensure the URL belongs to this user's path before attempting delete
  if (!isAuthorized) {
    throw new Error('Unauthorized to delete this logo');
  }

  // Extract file path from URL
  const urlParts = logoUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const userFolder = urlParts[urlParts.length - 2];
  const filePath = `${userFolder}/${fileName}`;

  // 1. Delete from storage bucket
  const { error: deleteError } = await supabaseAdmin.storage
    .from('company-logos')
    .remove([filePath]);

  if (deleteError) {
    console.error('Error deleting logo from storage:', deleteError);
    throw new Error('Failed to delete logo');
  }

  // 2. Clear from linked profiles
  await Promise.all(
    linkedIds.map(id =>
      supabaseAdmin
        .from('profiles')
        .upsert({
          id,
          company_logo: null,
          updated_at: new Date().toISOString()
        })
    )
  );
}

export async function uploadSignature(base64Data: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not authenticated');

  // Validate it's a supported image data URL
  const match = base64Data.match(/^data:(image\/(png|jpeg|jpg|webp));base64,/);
  if (!match) {
    throw new Error('Invalid signature format. Only PNG, JPEG, and WebP images are allowed.');
  }

  const rawMime = match[1];
  const mimeType = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime;
  const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png';

  // Convert base64 to buffer safely using an ArrayBuffer
  const base64String = base64Data.split(',')[1];
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '_');
  const fileName = `signature-${Date.now()}.${ext}`;
  const filePath = `${sanitizedUserId}/${fileName}`;

  // 1. Upload to storage bucket using the ArrayBuffer from Uint8Array
  const { error: uploadError } = await supabaseAdmin.storage
    .from('signatures')
    .upload(filePath, bytes.buffer, {
      upsert: true,
      contentType: mimeType,
    });

  if (uploadError) {
    console.error('Error uploading signature to storage:', uploadError);
    throw new Error(`Failed to upload signature: ${uploadError.message}`);
  }

  // 2. Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('signatures')
    .getPublicUrl(filePath);

  // 3. Persist the signature URL to all linked profiles
  const linkedIds = getLinkedUserIds(userId);
  await Promise.all(
    linkedIds.map(id =>
      supabaseAdmin
        .from('profiles')
        .upsert({
          id,
          signature_url: publicUrl,
          updated_at: new Date().toISOString()
        })
    )
  );

  return publicUrl;
}
