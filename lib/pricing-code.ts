import { supabase } from './supabase';

export interface PromoCode {
  code: string;
  discount: number;
  description: string;
}

// Available promo codes - hardcoded for now
// In a production app, these would come from a database
const availablePromoCodes: PromoCode[] = [
  {
    code: 'mechaminds',
    discount: 10,
    description: 'Diskon 10% untuk komunitas MechaMinds',
  },
  {
    code: 'smksuhat',
    discount: 40,
    description: 'Diskon 40% untuk SMK Suhat',
  },
  {
    code: 'indonesiaemas',
    discount: 20,
    description: 'Diskon 20% untuk Indonesia Emas',
  },
];

/**
 * Validates a promo code and saves it to the database if valid
 */
export const validateAndSavePromoCode = async (
  email: string,
  code: string
): Promise<PromoCode | null> => {
  try {
    // First check if code is valid
    const normalizedCode = code.trim().toLowerCase();
    const promoCode = availablePromoCodes.find(
      p => p.code.toLowerCase() === normalizedCode
    );

    if (!promoCode) {
      console.log(`Invalid promo code: ${code}`);
      return null;
    }

    // Check if user has already used this code - using direct REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/used_promo_codes?select=kode_promo&email=eq.${encodeURIComponent(
        email
      )}&kode_promo=eq.${encodeURIComponent(normalizedCode)}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      }
    );

    if (!checkResponse.ok) {
      throw new Error(`Failed to check promo code: ${checkResponse.status}`);
    }

    const existingCodes = await checkResponse.json();

    if (existingCodes && existingCodes.length > 0) {
      console.log(`User ${email} has already used promo code ${normalizedCode}`);
      return promoCode; // Return the code anyway if it was already used by this user
    }

    // Save the promo code usage with direct REST API
    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/used_promo_codes`,
      {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          email,
          kode_promo: normalizedCode,
        }),
      }
    );

    if (!insertResponse.ok) {
      throw new Error(`Failed to save promo code: ${insertResponse.status}`);
    }

    console.log(`Successfully applied promo code ${normalizedCode} for ${email}`);
    return promoCode;
  } catch (error) {
    console.error('Error in validateAndSavePromoCode:', error);
    return null;
  }
};

/**
 * Gets the latest promo code used by a user
 */
export const getLatestPromoCode = async (
  email: string
): Promise<PromoCode | null> => {
  try {
    // Get the latest promo code used by the user - using direct REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/used_promo_codes?select=kode_promo&email=eq.${encodeURIComponent(
        email
      )}&order=created_at.desc&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get promo codes: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    // Find the promo code details
    const promoCode = availablePromoCodes.find(
      p => p.code.toLowerCase() === data[0].kode_promo.toLowerCase()
    );

    return promoCode || null;
  } catch (error) {
    console.error('Error in getLatestPromoCode:', error);
    return null;
  }
};

/**
 * Deletes a promo code usage for a user
 */
export const deletePromoCode = async (
  email: string,
  code: string
): Promise<boolean> => {
  try {
    const normalizedCode = code.trim().toLowerCase();

    // Delete promo code using direct REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/used_promo_codes?email=eq.${encodeURIComponent(
        email
      )}&kode_promo=eq.${encodeURIComponent(normalizedCode)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete promo code: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error in deletePromoCode:', error);
    return false;
  }
};