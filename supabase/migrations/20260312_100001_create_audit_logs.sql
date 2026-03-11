-- =====================================================================================
-- Migration: Create Admin Audit Logs Table
-- Applies to: admin_audit_log
-- Resolves Evaluasi Item 20
-- =====================================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast searching
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);

-- RLS: Only admins can view audit logs, insert is via SECURITY DEFINER logic (or service role)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all audit logs" 
    ON admin_audit_log FOR SELECT 
    USING (is_admin());

CREATE POLICY "Admins can insert audit logs"
    ON admin_audit_log FOR INSERT 
    WITH CHECK (is_admin());
