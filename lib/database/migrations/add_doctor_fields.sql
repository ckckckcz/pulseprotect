-- Migration to add new columns to doctor table
ALTER TABLE public.dokter 
  ADD COLUMN IF NOT EXISTS pendidikan JSONB,
  ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS jumlah_ulasan INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bahasa JSONB;

-- Update existing doctor records with sample data if they don't have these fields
UPDATE public.dokter
SET 
  pendidikan = '[{"institusi": "Sample University", "gelar": "Dokter", "tahun": "2010"}]'::jsonb,
  rating = 4.5,
  jumlah_ulasan = 50,
  bahasa = '["Indonesia", "English"]'::jsonb,
  updated_at = CURRENT_TIMESTAMP
WHERE pendidikan IS NULL AND rating IS NULL;

-- Create index on rating for performance
CREATE INDEX IF NOT EXISTS idx_dokter_rating ON public.dokter (rating);
