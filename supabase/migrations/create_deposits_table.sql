-- Migration: Create deposits table for driver admin topups / cod fee payments
-- Author: ANTIGRAVITY
-- Created: 2026-02-23

-- 1. Create the `deposits` table
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL, -- e.g., 'cash', 'transfer'
    bank_name VARCHAR(100), -- If transfer, which bank
    proof_url TEXT, -- URL to the uploaded transfer proof receipt
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT, -- Useful if rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add an index to speed up driver dashboard queries
CREATE INDEX IF NOT EXISTS deposits_user_id_idx ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS deposits_status_idx ON public.deposits(status);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Drivers can read their own deposits
CREATE POLICY "Users can view their own deposits" 
ON public.deposits FOR SELECT 
USING (auth.uid() = user_id);

-- Drivers can insert their own deposits
CREATE POLICY "Users can insert their own deposits" 
ON public.deposits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Only admins / authorized roles should be able to update deposits (e.g. approve/reject)
CREATE POLICY "Only admins can update deposits" 
ON public.deposits FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 5. Add Storage Bucket for Transfer Proofs (deposits)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('deposits', 'deposits', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Anyone can read deposit proofs (so admins can see them fast)
CREATE POLICY "Public Access for Deposit Proofs" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'deposits' );

-- Storage Policy: Users can upload deposit proofs
CREATE POLICY "Users can upload their own deposit proofs" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
    bucket_id = 'deposits' 
    AND auth.uid() = owner
);

-- Note: We assume the walletService handles updating wallets upon 'approve' status.
-- Usually, this is done via a Supabase Trigger or a direct DB RPC function, 
-- but we'll manage this at application level for now until an Admin UI is built.
