
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugOrder() {
    console.log('🕵️ Deep Debugging Active Order...')

    // 1. Find Merchant ID
    const { data: merchants } = await supabase.from('merchants').select('id, name, address').ilike('name', '%Warung Makan Bu Sri%')
    if (!merchants?.length) {
        console.log('No merchant found!')
        return
    }
    const merchant = merchants[0]
    console.log(`Merchant: ${merchant.name} (${merchant.id})`)
    console.log(`Merchant Address in DB: ${merchant.address}`)

    // 2. List recent orders for this merchant
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(5)

    if (!orders?.length) {
        console.log('No orders found for this merchant at all.')
        return
    }

    console.log(`Found ${orders.length} recent orders. Checking top one...`)
    const order = orders[0]
    console.log(`Order ID: ${order.id}`)
    console.log(`Status: ${order.status}`)
    console.log(`Driver ID: ${order.driver_id}`)

    // Check for specific fields that might hold the address snapshot
    if (order.pickup_address) console.log(`pickup_address: ${order.pickup_address}`)
    if (order.origin_address) console.log(`origin_address: ${order.origin_address}`)
    if (order.merchant_address) console.log(`merchant_address (on order): ${order.merchant_address}`)

    // Attempt FIX on Recent Order if it matches
    const newAddress = 'Jl. Raya Ungaran No. 10, Semarang'
    let updates = {}

    if (order.pickup_address && order.pickup_address !== newAddress) updates.pickup_address = newAddress
    if (order.origin_address && order.origin_address !== newAddress) updates.origin_address = newAddress

    if (Object.keys(updates).length > 0) {
        console.log('Updating Order Snapshot Address...')
        const { error: upErr } = await supabase.from('orders').update(updates).eq('id', order.id)
        if (upErr) console.error('Update Failed:', upErr)
        else console.log('✅ Order Snapshot Updated!')
    } else {
        console.log('No snapshot field found on order needing update. It might rely on Merchant JOIN.')
        console.log('If so, please ensure the Merchant update propagated.')
    }
}

debugOrder().catch(console.error)
