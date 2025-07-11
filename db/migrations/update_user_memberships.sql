-- 1. Set default value for account_membership column in user table
ALTER TABLE public.user 
ALTER COLUMN account_membership SET DEFAULT 'free';

-- Update existing users who have null account_membership
UPDATE public.user
SET account_membership = 'free'
WHERE account_membership IS NULL;

-- 2. Create a function to update user membership when a new payment is recorded
CREATE OR REPLACE FUNCTION update_user_membership()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user's membership based on the new payment record
    UPDATE public.user
    SET account_membership = NEW.membership_type
    WHERE email = NEW.email
    AND (account_membership IS NULL OR account_membership = 'free' OR NEW.membership_type IN ('plus', 'pro'));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger to run the function when a payment is inserted
DROP TRIGGER IF EXISTS update_membership_on_payment ON public.payment;

CREATE TRIGGER update_membership_on_payment
AFTER INSERT ON public.payment
FOR EACH ROW
WHEN (NEW.status = 'success')
EXECUTE FUNCTION update_user_membership();
