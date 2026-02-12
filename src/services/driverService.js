import { supabase } from './supabaseClient'
import logger from '../utils/logger'

/**
 * Driver Service
 * Handles driver-related operations including verification
 */
export const driverService = {
    /**
     * Get drivers for verification (admin panel)
     */
    async getDriversForVerification(status = 'pending') {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select(`
                    *,
                    user:profiles!user_id(id, full_name, email, phone, avatar_url)
                `)
                .eq('status', status)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            logger.error('Failed to fetch drivers for verification', error, 'driverService')
            throw error
        }
    },

    /**
     * Get driver for review (admin panel)
     */
    async getDriverForReview(id) {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select(`
                    *,
                    user:profiles!user_id(id, full_name, email, phone, avatar_url)
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            logger.error('Failed to fetch driver for review', error, 'driverService')
            throw error
        }
    },

    /**
     * Approve driver registration
     */
    async approveDriver(driverId, adminId) {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .update({
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                    approved_by: adminId
                })
                .eq('id', driverId)
                .select()
                .single()

            if (error) throw error
            logger.info(`Driver ${driverId} approved by admin ${adminId}`, 'driverService')
            return data
        } catch (error) {
            logger.error('Failed to approve driver', error, 'driverService')
            throw error
        }
    },

    /**
     * Reject driver registration
     */
    async rejectDriver(driverId, reason = '') {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .update({
                    status: 'rejected',
                    rejected_at: new Date().toISOString(),
                    rejection_reason: reason
                })
                .eq('id', driverId)
                .select()
                .single()

            if (error) throw error
            logger.info(`Driver ${driverId} rejected with reason: ${reason}`, 'driverService')
            return data
        } catch (error) {
            logger.error('Failed to reject driver', error, 'driverService')
            throw error
        }
    }
}

export default driverService
