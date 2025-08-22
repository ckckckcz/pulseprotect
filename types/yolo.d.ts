
export interface VerificationResponse {
    status: string;
    source: string;
    confidence: number;
    explanation: string;
    data: {
        product: {
            nie?: string | null;
            name?: string | null;
            manufacturer?: string | null;
            dosage_form?: string | null;
            strength?: string | null;
            category?: string | null;
            composition?: string | null;
            updated_at?: string | null;
            status?: string | null,
        };
    };
}