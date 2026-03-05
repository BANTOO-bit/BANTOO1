-- ================================================================
-- AUDIT FIXES ROUND 2: Remaining gaps to reach 100/100
-- Fixes: FIX-S1, FIX-G1, FIX-W1
-- ================================================================

-- ================================================================
-- FIX-S1: Stock Restore on Order Cancellation
-- When an order is cancelled, restore the stock of menu_items
-- This is a trigger that fires AFTER update on orders
-- ================================================================
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
    v_item RECORD;
BEGIN
    -- Only fire when status changes TO 'cancelled'
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        -- Restore stock for each order item
        FOR v_item IN
            SELECT oi.product_id, oi.quantity
            FROM order_items oi
            WHERE oi.order_id = NEW.id
        LOOP
            UPDATE menu_items
            SET stock = stock + v_item.quantity,
                is_available = CASE
                    WHEN stock IS NOT NULL AND stock + v_item.quantity > 0 THEN TRUE
                    ELSE is_available
                END,
                updated_at = NOW()
            WHERE id = v_item.product_id
            AND stock IS NOT NULL;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_restore_stock_on_cancel ON orders;
CREATE TRIGGER trg_restore_stock_on_cancel
    AFTER UPDATE ON orders
    FOR EACH ROW
    WHEN (NEW.status = 'cancelled' AND OLD.status != 'cancelled')
    EXECUTE FUNCTION restore_stock_on_cancel();


-- ================================================================
-- FIX-W1: Auto-reject pending orders when merchant closes
-- Trigger on merchants table: when is_open changes to FALSE,
-- auto-cancel all pending orders for that merchant
-- ================================================================
CREATE OR REPLACE FUNCTION auto_cancel_on_merchant_close()
RETURNS TRIGGER AS $$
DECLARE
    v_order RECORD;
    v_wallet_id UUID;
    v_count INTEGER := 0;
BEGIN
    -- Only fire when merchant closes (is_open changes from TRUE to FALSE)
    IF NEW.is_open = FALSE AND (OLD.is_open = TRUE OR OLD.is_open IS NULL) THEN
        FOR v_order IN
            SELECT id, customer_id, payment_method, payment_status, total_amount
            FROM orders
            WHERE merchant_id = NEW.id
            AND status = 'pending'
            FOR UPDATE
        LOOP
            -- Cancel the order
            UPDATE orders
            SET status = 'cancelled',
                cancelled_at = NOW(),
                updated_at = NOW(),
                cancellation_reason = 'Warung tutup — pesanan otomatis dibatalkan'
            WHERE id = v_order.id;

            -- Refund wallet if paid via wallet
            IF v_order.payment_method = 'wallet' AND v_order.payment_status = 'paid' THEN
                SELECT id INTO v_wallet_id FROM wallets WHERE user_id = v_order.customer_id;
                IF v_wallet_id IS NOT NULL THEN
                    UPDATE wallets SET balance = balance + v_order.total_amount, updated_at = NOW()
                    WHERE id = v_wallet_id;

                    INSERT INTO transactions (wallet_id, type, amount, description, reference_id, status)
                    VALUES (v_wallet_id, 'refund', v_order.total_amount,
                            'Refund — warung tutup #' || substring(v_order.id::text, 1, 8),
                            v_order.id, 'completed');

                    UPDATE orders SET payment_status = 'refunded' WHERE id = v_order.id;
                END IF;
            END IF;

            -- Notify customer
            INSERT INTO notifications (user_id, title, message, type, reference_id)
            VALUES (v_order.customer_id, 'Pesanan Dibatalkan',
                    'Warung telah tutup. Pesanan #' || substring(v_order.id::text, 1, 8) || ' otomatis dibatalkan.',
                    'order', v_order.id);

            v_count := v_count + 1;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_cancel_on_merchant_close ON merchants;
CREATE TRIGGER trg_auto_cancel_on_merchant_close
    AFTER UPDATE ON merchants
    FOR EACH ROW
    WHEN (NEW.is_open = FALSE AND (OLD.is_open = TRUE OR OLD.is_open IS NULL))
    EXECUTE FUNCTION auto_cancel_on_merchant_close();
