-- =====================================================================================
-- Migration: Create Audit Logs Table
-- Applies to: audit_logs
-- Resolves Evaluasi Item 20
-- =====================================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast searching
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS: Only admins can view audit logs, insert is via SECURITY DEFINER logic (or service role)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all audit logs" 
    ON audit_logs FOR SELECT 
    USING (is_admin());

CREATE POLICY "Service roles or backend can insert audit logs"
    ON audit_logs FOR INSERT 
    WITH CHECK (true); -- Usually restricted to service_role in a real setup or triggers
