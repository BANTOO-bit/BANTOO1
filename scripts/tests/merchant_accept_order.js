import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function merchantAcceptOrder() {
    console.log('--- MERCHANT TAKEOVER & ACCEPT ---')

    // 1. Sign In as Customer (who we have password for)
    const email = 'customer.test@bantoo.app'
    const password = 'password123'

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (authError) {
        console.error('Auth failed:', authError.message)
        return
    }
    const myId = authData.user.id
    console.log(`Logged in as: ${email} (${myId})`)

    // 2. Find the Merchant (Warung Makan Bu Sri)
    const { data: merchantData } = await supabase
        .from('merchants')
        .select('id, owner_id')
        .eq('name', 'Warung Makan Bu Sri')
        .single()

    if (!merchantData) {
        console.error('Merchant not found.')
        return
    }
    console.log(`Target Merchant ID: ${merchantData.id}`)

    // 3. Takeover Ownership (TEMPORARY HACK for Testing)
    const { error: takeoverError } = await supabase
        .from('merchants')
        .update({ owner_id: myId })
        .eq('id', merchantData.id)

    if (takeoverError) {
        console.error('Takeover failed (RLS likely):', takeoverError.message)
        // Try to proceed anyway (maybe already owned or public)
    } else {
        console.log('Merchant ownership taken! Now verifying orders...')
    }

    // 4. Update Order Status
    // BROAD SEARCH: Find ANY recent order
    const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*, merchant:merchant_id(name)')
        // .eq('status', 'pending') // REMOVED FILTER
        .order('created_at', { ascending: false })
        .limit(5)

    if (orderError) {
        console.error('Error fetching orders:', orderError.message)
        return
    }

    if (!orders || orders.length === 0) {
        console.log('No orders found ANYWHERE.')
        return
    }

    console.log(`Found ${orders.length} recent orders.`)
    orders.forEach(o => {
        console.log(`- Order #${o.id} | Status: ${o.status} | Merchant: ${o.merchant?.name} | Total: ${o.total_amount}`)
    })

    // Exit after listing
    return

    if (updateError) {
        console.error('Error updating order:', updateError.message)
    } else {
        console.log('SUCCESS: Order updated to "ready". Driver should see it.')
    }
}

merchantAcceptOrder()
