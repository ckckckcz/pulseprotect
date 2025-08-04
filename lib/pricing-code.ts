import { supabase } from './supabase';
import { Database } from './supabase';

interface PromoCode {
  code: string;
  discount: number;
  description: string;
}

interface UsedPromoCode {
  id: number;
  email: string;
  kode_promo: string;
  created_at: string;
}

// Function to save a promo code to the database
export async function savePromoCode(email: string, promoCode: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('used_promo_codes')
      .insert({
        email,
        kode_promo: promoCode.toLowerCase(),
      });

    if (error) {
      console.error('Error saving promo code:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error saving promo code:', error);
    return false;
  }
}

// Function to retrieve the latest valid promo code for a user
export async function getLatestPromoCode(email: string): Promise<PromoCode | null> {
  try {
    const { data, error } = await supabase
      .from('used_promo_codes')
      .select('kode_promo')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No promo code found for this user
        return null;
      }
      console.error('Error retrieving promo code:', error);
      return null;
    }

    if (!data) return null;

    // Map the database promo code to the PromoCode interface
    const promoCodes: PromoCode[] = [
      { code: 'mechaminds', discount: 10, description: 'Diskon 10% untuk komunitas MechaMinds' },
      { code: 'smksuhat', discount: 40, description: 'Diskon 40% untuk SMK Suhat' },
      { code: 'indonesiaemas', discount: 20, description: 'Diskon 20% untuk Indonesia Emas' },
    ];

    return promoCodes.find(promo => promo.code.toLowerCase() === data.kode_promo.toLowerCase()) || null;
  } catch (error) {
    console.error('Unexpected error retrieving promo code:', error);
    return null;
  }
}

// Function to validate a promo code
export async function validateAndSavePromoCode(email: string, promoCode: string): Promise<PromoCode | null> {
  const promoCodes: PromoCode[] = [
    { code: 'mechaminds', discount: 10, description: 'Diskon 10% untuk komunitas MechaMinds' },
    { code: 'smksuhat', discount: 40, description: 'Diskon 40% untuk SMK Suhat' },
    { code: 'indonesiaemas', discount: 20, description: 'Diskon 20% untuk Indonesia Emas' },
  ];

  const foundPromo = promoCodes.find(promo => promo.code.toLowerCase() === promoCode.toLowerCase().trim());

  if (!foundPromo) {
    return null;
  }

  // Save the valid promo code to the database
  const saved = await savePromoCode(email, foundPromo.code);
  if (!saved) {
    return null;
  }

  return foundPromo;
}

// Function to delete a promo code (optional, for removing applied promo)
export async function deletePromoCode(email: string, promoCode: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('used_promo_codes')
      .delete()
      .eq('email', email)
      .eq('kode_promo', promoCode.toLowerCase());

    if (error) {
      console.error('Error deleting promo code:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error deleting promo code:', error);
    return false;
  }
}