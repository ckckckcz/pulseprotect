-- This script creates the payment_intent table if it doesn't exist already

CREATE TABLE IF NOT EXISTS public.payment_intent (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    package_id VARCHAR(50) NOT NULL,
    package_name VARCHAR(100),
    period VARCHAR(20) NOT NULL CHECK (period IN ('monthly', 'yearly')),
    amount NUMERIC(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_intent_email ON public.payment_intent(email);
CREATE INDEX IF NOT EXISTS idx_payment_intent_status ON public.payment_intent(status);
