import { supabase } from './supabaseClient'

/**
 * Admin Audit Log Service
 * Records all admin actions for security and compliance tracking.
 */
export const auditLogService = {
    /**
     * Log an admin action
     * @param {string} action - Action name (e.g., 'approve_merchant', 'reject_withdrawal')
     * @param {string} targetType - Target entity type ('order', 'merchant', 'driver', 'user', 'withdrawal', 'promo', 'setting')
     * @param {string|null} targetId - UUID of the target entity
     * @param {object} details - Additional details about the action
     */
    async log(action, targetType = null, targetId = null, details = {}) {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return // Silently fail if not authenticated

            await supabase.from('admin_audit_log').insert({
                admin_id: user.id,
                action,
                target_type: targetType,
                target_id: targetId,
                details
            })
        } catch (err) {
            // Audit log should never break app flow
            console.warn('[AuditLog] Failed to log action:', action, err.message)
        }
    },

    /**
     * Get audit logs with pagination
     */
    async getAll({ page = 1, limit = 50, action = null, targetType = null } = {}) {
        let query = supabase
            .from('admin_audit_log')
            .select(`
                id, action, target_type, target_id, details, created_at,
                admin:profiles!admin_audit_log_admin_id_fkey(id, full_name, email)
            `)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

        if (action) query = query.eq('action', action)
        if (targetType) query = query.eq('target_type', targetType)

        const { data, error } = await query
        if (error) throw error
        return data || []
    }
}
