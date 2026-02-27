-- ============================================================
-- BANTOO APP — Improvement SQL
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. CLEAN DUPLICATES FIRST: Remove duplicate reviews, keep the newest one
-- ============================================================
-- This is needed because duplicates may already exist before the constraint.

DELETE FROM reviews
WHERE id NOT IN (
    SELECT DISTINCT ON (order_id, customer_id) id
    FROM reviews
    ORDER BY order_id, customer_id, created_at DESC
);

-- 2. UNIQUE CONSTRAINT: Prevent duplicate reviews per order
-- ============================================================
-- This ensures a customer can only review an order ONCE.
-- Without this, clicking "Beri Ulasan" multiple times could create duplicates.

ALTER TABLE reviews 
DROP CONSTRAINT IF EXISTS unique_review_per_order;

ALTER TABLE reviews 
ADD CONSTRAINT unique_review_per_order 
UNIQUE (order_id, customer_id);

-- 2. AUTO-COMPLETE ORDERS: delivered → completed after review
-- ============================================================
-- When a customer submits a review, auto-update order to 'completed'.
-- This provides a clean transition from 'delivered' to 'completed'.

CREATE OR REPLACE FUNCTION auto_complete_order_on_review()
RETURNS TRIGGER AS $$
BEGIN
    -- When a review is created, auto-complete the order
    UPDATE orders
    SET status = 'completed',
        updated_at = NOW()
    WHERE id = NEW.order_id
    AND status = 'delivered';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_auto_complete ON reviews;
CREATE TRIGGER on_review_auto_complete
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION auto_complete_order_on_review();

-- 3. SAFETY: Auto-complete old delivered orders (fallback for no-review cases)
-- ============================================================
-- For orders where customer never reviews: auto-complete after 48 hours.
-- Run this as a cron job or Supabase scheduled function.
-- You can call this via: SELECT auto_complete_old_delivered_orders();

CREATE OR REPLACE FUNCTION auto_complete_old_delivered_orders()
RETURNS integer AS $$
DECLARE
    affected_count integer;
BEGIN
    UPDATE orders 
    SET status = 'completed',
        updated_at = NOW()
    WHERE status = 'delivered' 
    AND updated_at < NOW() - INTERVAL '48 hours';
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DONE! Summary:
-- ✅ 1. Reviews now have UNIQUE (order_id, customer_id) constraint
-- ✅ 2. Orders auto-complete to 'completed' when customer reviews
-- ✅ 3. Fallback: old delivered orders auto-complete after 48 hours
-- ============================================================
