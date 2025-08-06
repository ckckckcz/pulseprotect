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

    // Save locally first so we have it even if API fails
    try {
      localStorage.setItem(
        `promo_code_${email}`,
        JSON.stringify({
          ...foundPromo,
          timestamp: Date.now(),
        })
      );
    } catch (storageError) {
      // Continue even if localStorage fails
      // console.error("localStorage error:", storageError);
    }

    // Try to save to server, but don't block the promo application if it fails
    try {
      const response = await fetch("/api/promo-codes/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: foundPromo.code,
          discount: foundPromo.discount,
          description: foundPromo.description,
        }),
      });

      if (!response.ok) {
        // Continue anyway - we already saved locally
        // console.error("Failed to save promo code to server:", response.statusText);
      }
    } catch (apiError) {
      // API error shouldn't prevent promo from being applied
      // console.error("API error while saving promo code:", apiError);
    }

    // Return the promo code regardless of API success
    return foundPromo;
  } catch (error) {
    // console.error("Error in validateAndSavePromoCode:", error);

    // Last resort fallback - try to find the promo code directly
    const fallbackPromo = availablePromoCodes.find(
      (promo) => promo.code.toLowerCase() === code.toLowerCase()
    );

    return fallbackPromo || null;
  }
}

// Get the latest promo code for a user
export async function getLatestPromoCode(email: string): Promise<PromoCode | null> {
  try {
    // Try to get from local storage first
    try {
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
    } catch (storageError) {
      // Continue if localStorage fails
      // console.error("Error reading from localStorage:", storageError);
    }

    // If not in local storage or too old, try to fetch from server
    try {
      const response = await fetch(
        `/api/promo-codes/get?email=${encodeURIComponent(email)}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.promoCode) {
          // Save to local storage
          try {
            localStorage.setItem(
              `promo_code_${email}`,
              JSON.stringify({
                code: data.promoCode.code,
                discount: data.promoCode.discount,
                description: data.promoCode.description,
                timestamp: Date.now(),
              })
            );
          } catch (storageError) {
            // Ignore localStorage errors
          }

          return {
            code: data.promoCode.code,
            discount: data.promoCode.discount,
            description: data.promoCode.description,
          };
        }
      }
    } catch (apiError) {
      // API error - continue to return null
      // console.error("API error while getting promo code:", apiError);
    }

    return null;
  } catch (error) {
    // console.error("Error in getLatestPromoCode:", error);
    return null;
  }
}

// Delete promo code for a user
export async function deletePromoCode(email: string, code: string): Promise<boolean> {
  try {
    // Remove from local storage first
    try {
      localStorage.removeItem(`promo_code_${email}`);
    } catch (storageError) {
      // Continue if localStorage fails
      // console.error("Error removing from localStorage:", storageError);
    }

    // Try to delete from server
    try {
      const response = await fetch("/api/promo-codes/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      // Return true even if API fails - we've already removed it locally
      return true;
    } catch (apiError) {
      // console.error("API error while deleting promo code:", apiError);
      return true; // Return true anyway since we've deleted it locally
    }
  } catch (error) {
    // console.error("Error in deletePromoCode:", error);
    return false;
  }
}

// New function to check if a promo code is valid without saving it
export function checkPromoCode(code: string): PromoCode | null {
  return (
    availablePromoCodes.find(
      (promo) => promo.code.toLowerCase() === code.toLowerCase()
    ) || null
  );
}