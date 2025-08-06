import { NextResponse } from 'next/server';
import { corsResponse } from '@/lib/cors';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, code } = body;
    
    if (!email || !code) {
      return corsResponse(
        { error: 'Email and promo code are required' },
        { status: 400 }
      );
    }

    // Validate the promo code (dummy implementation - replace with your actual validation)
    const promoCodesData = [
      {
        code: "mechaminds",
        discount: 10,
        description: "Diskon 10% untuk komunitas MechaMinds"
      },
      {
        code: "smksuhat",
        discount: 40,
        description: "Diskon 40% untuk SMK Suhat"
      },
      {
        code: "indonesiaemas",
        discount: 20,
        description: "Diskon 20% untuk Indonesia Emas"
      }
    ];
    
    const foundPromo = promoCodesData.find(
      p => p.code.toLowerCase() === code.toLowerCase()
    );
    
    if (!foundPromo) {
      return corsResponse(
        { error: 'Invalid promo code' },
        { status: 400 }
      );
    }

    // Save the promo code for the user
    const { data, error } = await supabase
      .from('user_promo_codes')
      .insert({
        email,
        code: foundPromo.code,
        discount: foundPromo.discount,
        description: foundPromo.description,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error saving promo code:', error);
      return corsResponse(
        { error: 'Failed to save promo code' },
        { status: 500 }
      );
    }
    
    return corsResponse({
      success: true,
      promoCode: data
    });
    
  } catch (error: any) {
    console.error('Error saving promo code:', error);
    return corsResponse(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
