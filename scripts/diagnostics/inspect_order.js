import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectOrder() {
    const targetIdPartial = '221b7be9-aa1b-4420-ba34-610aa2ab2342'
    console.log(`Inspecting Order containing: ${targetIdPartial}`)

    // 1. Sign In (any user with read access, or use anon if policies allow)
    // Using customer.test as it works
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'customer.test@bantoo.app',
        password: 'password123'
    })

    if (authError) console.log('Auth warning (might rely on public policies):', authError.message)

    // 2. Fetch Order
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            merchant:merchants(*)
        `)
        .eq('id', targetIdPartial) // Assuming the screenshot showed the actual UUID

    if (error) {
        console.error('Error:', error)
        return
    }

    if (orders.length === 0) {
        console.log('Order not found with exact ID. Searching by partial match...')
        // Fallback search
        const { data: partialOrders } = await supabase
            .from('orders')
            .select('*')
            .ilike('id', `%${targetIdPartial}%`)

        if (partialOrders && partialOrders.length > 0) {
            console.log('Found similar orders:', partialOrders.map(o => o.id))
        } else {
            console.log('No matching orders found.')
        }
        return
    }

    const order = orders[0]
    console.log('\n--- ORDER DETAILS ---')
    console.log(`ID: ${order.id}`)
    console.log(`Status: ${order.status}`)
    console.log(`Created At: ${order.created_at}`)
    console.log(`Merchant: ${order.merchant?.name} (ID: ${order.merchant_id})`)
    console.log(`Merchant Location: ${order.merchant?.latitude}, ${order.merchant?.longitude}`)
    console.log(`Delivery Address: ${order.delivery_address}`)
    console.log(`Delivery Coords: ${order.delivery_latitude}, ${order.delivery_longitude}`)
    console.log(`Driver ID: ${order.driver_id}`)
}

inspectOrder()
