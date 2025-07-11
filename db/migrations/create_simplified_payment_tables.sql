-- Create simplified membership table (no foreign keys)
CREATE TABLE IF NOT EXISTS membership (
  id_membership SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL UNIQUE, -- Added UNIQUE constraint here
  monthly_price DECIMAL(15, 2) NOT NULL,
  yearly_price DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment table with no foreign keys, using email instead of user ID
CREATE TABLE IF NOT EXISTS payment (
  id_payment SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL, -- Use email instead of user ID
  membership_type VARCHAR(20) NOT NULL, -- directly store 'free', 'plus', or 'pro'
  order_id VARCHAR(100) NOT NULL UNIQUE,
  transaction_type VARCHAR(50), -- purchase, renewal, refund, etc.
  metode_pembayaran VARCHAR(50), -- payment channel/method
  harga DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- pending, success, failed, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add an index on order_id for faster lookups
  CONSTRAINT payment_order_id_idx UNIQUE (order_id)
);

-- Insert default membership types if not exists
INSERT INTO membership (type, monthly_price, yearly_price)
VALUES 
  ('free', 0, 0),
  ('plus', 70000, 58000),
  ('pro', 140000, 116000)
ON CONFLICT (type) DO NOTHING;
