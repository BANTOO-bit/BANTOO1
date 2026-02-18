-- ==========================================
-- CHAT MESSAGES TABLE
-- ==========================================
-- Real-time chat between customer and driver per order.

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'driver')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_order_id ON public.chat_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(order_id, created_at);

-- RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Customer can see messages on their own orders
CREATE POLICY "Customer can view chat messages"
ON public.chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = chat_messages.order_id
        AND o.customer_id = auth.uid()
    )
);

-- Driver can see messages on their assigned orders
CREATE POLICY "Driver can view chat messages"
ON public.chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = chat_messages.order_id
        AND o.driver_id = auth.uid()
    )
);

-- Customer can send messages on their own orders
CREATE POLICY "Customer can send chat messages"
ON public.chat_messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid()
    AND sender_role = 'customer'
    AND EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = chat_messages.order_id
        AND o.customer_id = auth.uid()
        AND o.status IN ('pickup', 'picked_up', 'delivering')
    )
);

-- Driver can send messages on their assigned orders
CREATE POLICY "Driver can send chat messages"
ON public.chat_messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid()
    AND sender_role = 'driver'
    AND EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = chat_messages.order_id
        AND o.driver_id = auth.uid()
        AND o.status IN ('pickup', 'picked_up', 'delivering')
    )
);

-- Both can update is_read on messages sent TO them (mark as read)
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

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
