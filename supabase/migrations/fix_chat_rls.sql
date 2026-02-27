-- ==========================================
-- FIX CHAT RLS POLICIES
-- ==========================================
-- Masalah: RLS INSERT hanya mengizinkan status 'pickup', 'picked_up', 'delivering'
-- Tetapi status aktual juga bisa 'accepted', 'preparing', 'ready'
-- Fix: Perluas status yang diizinkan untuk semua status aktif (bukan cancelled/delivered/completed)

-- Drop old policies
DROP POLICY IF EXISTS "Customer can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Driver can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Customer can send chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Driver can send chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.chat_messages;

-- =====================
-- SELECT POLICIES (read messages)
-- =====================

-- Customer bisa baca chat di ordernya
CREATE POLICY "Customer can view chat messages"
ON public.chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = chat_messages.order_id
        AND o.customer_id = auth.uid()
    )
);

-- Driver bisa baca chat di order yang dia tangani
CREATE POLICY "Driver can view chat messages"
ON public.chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = chat_messages.order_id
        AND o.driver_id = auth.uid()
    )
);

-- =====================
-- INSERT POLICIES (send messages)
-- =====================

-- Customer bisa kirim pesan selama order masih aktif (bukan cancelled/delivered/completed)
CREATE POLICY "Customer can send chat messages"
ON public.chat_messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid()
    AND sender_role = 'customer'
    AND EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = chat_messages.order_id
        AND o.customer_id = auth.uid()
        AND o.status NOT IN ('cancelled', 'completed')
    )
);

-- Driver bisa kirim pesan selama order masih aktif
CREATE POLICY "Driver can send chat messages"
ON public.chat_messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid()
    AND sender_role = 'driver'
    AND EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = chat_messages.order_id
        AND o.driver_id = auth.uid()
        AND o.status NOT IN ('cancelled', 'completed')
    )
);

-- =====================
-- UPDATE POLICY (mark as read)
-- =====================

-- User bisa update is_read pada pesan yang dikirim oleh pihak lain
CREATE POLICY "Users can mark messages as read"
ON public.chat_messages FOR UPDATE
USING (
    sender_id != auth.uid()
    AND EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = chat_messages.order_id
        AND (o.customer_id = auth.uid() OR o.driver_id = auth.uid())
    )
)
WITH CHECK (
    sender_id != auth.uid()
);
