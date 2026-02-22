-- ============================================================
-- FIX: ADD MISSING PREPARING_AT COLUMN
-- The orders table is missing the preparing_at timestamp column
-- which is required by the update_order_status RPC when accepting orders.
-- ============================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS preparing_at TIMESTAMPTZ;
