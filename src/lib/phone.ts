import { parsePhoneNumberFromString, PhoneNumber } from 'libphonenumber-js';

export interface PhoneValidationResult {
  isValid: boolean;
  e164?: string;
  national?: string;
  country?: string;
  whatsappJid?: string;
  error?: string;
}

/**
 * Normalizes and validates a phone number with smart handling for Bangladesh and international numbers.
 * - Parses international numbers with '+' directly.
 * - Handles Bangladesh local numbers starting with '01...' by applying 'BD' default country.
 * - Never blindly prepends 880 to arbitrary numbers.
 */
export function normalizePhoneNumber(rawNumber: string, defaultCountry: string = 'BD'): PhoneValidationResult {
  if (!rawNumber || typeof rawNumber !== 'string') {
    return { isValid: false, error: 'Phone number is empty' };
  }

  const trimmed = rawNumber.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is empty' };
  }

  // If already starts with '+', parse directly with international detection
  let phoneNumber: PhoneNumber | undefined;
  if (trimmed.startsWith('+')) {
    phoneNumber = parsePhoneNumberFromString(trimmed);
  } else {
    // Check if user typed country code without '+' (e.g., '88017...', '1555...', '447...')
    if (trimmed.startsWith('880') && trimmed.length >= 11) {
      phoneNumber = parsePhoneNumberFromString('+' + trimmed);
    } else {
      // Parse using default country
      phoneNumber = parsePhoneNumberFromString(trimmed, defaultCountry as any);
      // Fallback if not valid: try US
      if (!phoneNumber?.isValid() && defaultCountry !== 'US') {
        const alt = parsePhoneNumberFromString(trimmed, 'US');
        if (alt?.isValid()) {
          phoneNumber = alt;
        }
      }
    }
  }

  if (!phoneNumber || !phoneNumber.isValid()) {
    return {
      isValid: false,
      error: 'Invalid phone number format. Please provide a valid international or national number.',
    };
  }

  const e164 = phoneNumber.format('E.164'); // e.g. +8801712345678 or +15551234567
  const digits = e164.replace(/\D/g, '');

  return {
    isValid: true,
    e164,
    national: phoneNumber.formatNational(),
    country: phoneNumber.country,
    whatsappJid: `${digits}@c.us`,
  };
}

/**
 * Validate email address only if nonempty
 */
export function validateEmail(email?: string | null): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    // Empty email is valid because email is optional
    return { isValid: true };
  }

  const trimmed = email.trim();
  // Standard RFC 5322 regex approximation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  return { isValid: true };
}

/**
 * Returns true if nonempty string matches email format
 */
export function isValidEmail(email?: string | null): boolean {
  if (!email || !email.trim()) return false;
  return validateEmail(email).isValid;
}

/**
 * Perfectly sanitizes an email address:
 * - Trims whitespace
 * - Converts to lowercase
 * - Returns null if empty or invalid format
 */
export function sanitizeEmail(email?: string | null): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  return isValidEmail(trimmed) ? trimmed : null;
}

/**
 * Perfectly sanitizes a phone number:
 * - Trims whitespace
 * - If valid, returns normalized E.164 (e.g. +8801712345678)
 * - Returns null if empty string
 */
export function sanitizePhone(phone?: string | null, defaultCountry: string = 'BD'): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const normalized = normalizePhoneNumber(trimmed, defaultCountry);
  if (normalized.isValid && normalized.e164) {
    return normalized.e164;
  }
  return trimmed;
}
