-- Check if membership table already has data
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM membership) THEN
    -- Insert default membership types
    INSERT INTO membership (type, monthly_price, yearly_price) VALUES 
    ('free', 0, 0),
    ('plus', 70000, 58000),
    ('pro', 140000, 116000);
    
    RAISE NOTICE 'Membership data seeded successfully';
  ELSE
    RAISE NOTICE 'Membership data already exists, skipping seed';
  END IF;
END $$;
