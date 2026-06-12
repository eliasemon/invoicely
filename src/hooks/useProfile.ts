'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getProfile } from '@/app/actions/profileActions';

export interface UserProfile {
  id: string;
  
  // Basic Info
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  company_address: string | null;
  company_logo: string | null;
  
  // Business Info
  business_registration: string | null;
  tax_id: string | null;
  
  // Regional Settings
  default_currency: string;
  currency_symbol: string;
  
  // Contact Details
  email: string | null;
  phone: string | null;
  website: string | null;
  billing_address: string | null;
  
  // Bank Details
  bank_enabled: boolean;
  bank_name: string | null;
  bank_account_holder: string | null;
  bank_account_number: string | null;
  bank_swift: string | null;
  
  // Signature
  signature_enabled: boolean;
  signature_url: string | null;
  signatory_name: string | null;
  qr_code_enabled: boolean;
  
  // Onboarding
  onboarding_completed?: boolean;
  
  // Terms
  terms_and_conditions: string | null;

  // Brand Voice
  brand_voice_enabled: boolean;
  brand_voice: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      if (!user?.uid) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getProfile();
        
        if (mounted) {
          setProfile(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('Error fetching profile:', err);
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  return { profile, loading, error };
}
