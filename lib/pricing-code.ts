"use client";

interface PromoCode {
  code: string;
  discount: number;
  description: string;
}

const availablePromoCodes: PromoCode[] = [
  {
    code: "mechaminds",
    discount: 10,
    description: "Diskon 10% untuk komunitas MechaMinds",
  },
  {
    code: "smksuhat",
    discount: 40,
    description: "Diskon 40% untuk SMK Suhat",
  },
  {
    code: "indonesiaemas",
    discount: 20,
    description: "Diskon 20% untuk Indonesia Emas",
  },
];

// Save promo code for a user
export async function validateAndSavePromoCode(
  email: string,
  code: string
): Promise<PromoCode | null> {
  try {
    // Find if code exists
    const foundPromo = availablePromoCodes.find(
      (promo) => promo.code.toLowerCase() === code.toLowerCase()
    );

    if (!foundPromo) {
      return null;
    }

    // Save to server
    const response = await fetch("/api/promo-codes/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        code: foundPromo.code,
      }),
    });

    if (!response.ok) {
      console.error("Failed to save promo code:", response.statusText);
      return null;
    }

    // Save locally too
    localStorage.setItem(
      `promo_code_${email}`,
      JSON.stringify({
        ...foundPromo,
        timestamp: Date.now(),
      })
    );

    return foundPromo;
  } catch (error) {
    console.error("Error saving promo code:", error);
    return null;
  }
}

// Get the latest promo code for a user
export async function getLatestPromoCode(email: string): Promise<PromoCode | null> {
  try {
    // Try to get from local storage first
    const localPromo = localStorage.getItem(`promo_code_${email}`);
    if (localPromo) {
      const parsed = JSON.parse(localPromo);
      // Check if it's not too old (e.g., not older than 24 hours)
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return {
          code: parsed.code,
          discount: parsed.discount,
          description: parsed.description,
        };
      }
    }

    // If not in local storage or too old, fetch from server
    const response = await fetch(
      `/api/promo-codes/get?email=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.promoCode) {
      return null;
    }

    // Save to local storage
    localStorage.setItem(
      `promo_code_${email}`,
      JSON.stringify({
        code: data.promoCode.code,
        discount: data.promoCode.discount,
        description: data.promoCode.description,
        timestamp: Date.now(),
      })
    );

    return {
      code: data.promoCode.code,
      discount: data.promoCode.discount,
      description: data.promoCode.description,
    };
  } catch (error) {
    console.error("Error getting promo code:", error);
    return null;
  }
}

// Delete promo code for a user
export async function deletePromoCode(email: string, code: string): Promise<boolean> {
  try {
    // Remove from local storage
    localStorage.removeItem(`promo_code_${email}`);

    // Also delete from server (you'd need to implement this API endpoint)
    const response = await fetch("/api/promo-codes/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting promo code:", error);
    return false;
  }
}