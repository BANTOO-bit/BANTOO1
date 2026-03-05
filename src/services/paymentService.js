import { supabase } from './supabaseClient'

/**
 * Payment Service (Mock Simulation)
 * 
 * Simulates a third-party payment gateway like Midtrans or Xendit.
 * In a real-world scenario, the frontend should NOT update the database
 * to mark an order as 'paid'. Instead, the Payment Gateway's webhook
 * should hit a secure backend endpoint (like Supabase Edge Functions)
 * which updates the database.
 */
export const paymentService = {
    /**
     * Simulates creating a transaction and returning a mock payment token/URL.
     */
    async createPaymentTransaction(orderId, amount, method) {
        // In reality, this would call your backend endpoint, which calls Midtrans API,
        // gets a Snap Token, and returns it to the client.

        if (import.meta.env.DEV) console.log(`[MOCK] Creating transaction for Order:${orderId}, Amount:${amount}, Method:${method}`)

        // Wait 1.5 seconds to simulate network latency
        await new Promise(resolve => setTimeout(resolve, 1500))

        return {
            success: true,
            payment_token: `mock-token-${Date.now()}`,
            redirect_url: `/payment-simulation/${orderId}?method=${method}&amount=${amount}`
        }
    },

    /**
     * Simulates the Webhook callback from the Payment Gateway.
     * Marks the order as paid in the database.
     */
    async simulateWebhookUpdate(orderId) {
        if (import.meta.env.DEV) console.log(`[MOCK] Webhook received: Order ${orderId} is paid.`)

        // Wait 2 seconds to simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000))

        const { data, error } = await supabase
            .from('orders')
            .update({
                payment_status: 'paid',
                paid_at: new Date().toISOString()
                // Do not change object tracking status, let the merchant/driver flow continue
            })
            .eq('id', orderId)
            .select()
            .single()

        if (error) {
            console.error('[MOCK] Failed to update order payment status:', error)
            throw new Error('Gagal memproses status pembayaran')
        }

        return data
    }
}

export default paymentService
