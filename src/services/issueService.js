import { supabase } from './supabaseClient'

/**
 * Issue Service - Handle support tickets/complaints
 */
export const issueService = {
    /**
     * Create a new issue/complaint
     */
    async createIssue({ orderId, category, description, evidenceUrls = [] }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Determine reporter type based on active role
        const { data: profile } = await supabase
            .from('profiles')
            .select('active_role')
            .eq('id', user.id)
            .single()

        const reporterType = profile?.active_role || 'customer'

        const { data, error } = await supabase
            .from('issues')
            .insert({
                order_id: orderId,
                reporter_id: user.id,
                reporter_type: reporterType,
                category,
                description,
                evidence_urls: evidenceUrls,
                status: 'open'
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Get issues created by current user
     */
    async getMyIssues() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('issues')
            .select(`
                *,
                order:orders(id, order_number, total_amount)
            `)
            .eq('reporter_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Get single issue
     */
    async getIssue(issueId) {
        const { data, error } = await supabase
            .from('issues')
            .select(`
                *,
                order:orders(
                    id, order_number, total_amount, status,
                    merchant:merchants(id, name)
                ),
                reporter:profiles!reporter_id(id, full_name, phone),
                resolver:profiles!resolved_by(id, full_name)
            `)
            .eq('id', issueId)
            .single()

        if (error) throw error
        return data
    },

    /**
     * Upload evidence photo
     */
    async uploadEvidence(file) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data, error } = await supabase.storage
            .from('issue-evidence')
            .upload(fileName, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
            .from('issue-evidence')
            .getPublicUrl(fileName)

        return publicUrl
    },

    // ===== ADMIN FUNCTIONS =====

    /**
     * Get all issues (admin)
     */
    async getAllIssues(status = null) {
        let query = supabase
            .from('issues')
            .select(`
                *,
                order:orders(id, order_number, total_amount),
                reporter:profiles!reporter_id(id, full_name, phone)
            `)
            .order('created_at', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    /**
     * Update issue status (admin)
     */
    async updateIssueStatus(issueId, status, resolution = null) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const updateData = { status }

        if (status === 'resolved' || status === 'closed') {
            updateData.resolved_by = user.id
            updateData.resolved_at = new Date().toISOString()
            if (resolution) {
                updateData.resolution = resolution
            }
        }

        const { data, error } = await supabase
            .from('issues')
            .update(updateData)
            .eq('id', issueId)
            .select()
            .single()

        if (error) throw error
        return data
    }
}

export default issueService
