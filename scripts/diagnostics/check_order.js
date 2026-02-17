import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkLatestOrder() {
    console.log('Checking latest updated order...')

    // 1. Sign In as Customer Test (Known Working)
    const email = 'customer.test@bantoo.app'
    const password = 'password123'

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (authError) {
        console.error('Auth failed for customer.test:', authError.message)
        return
    }
    const myId = authData.user.id
    console.log(`Logged in as: ${email} (${myId})`)

    // 2. Find ANY Order (latest modified)
    const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select(`
            id, 
            status, 
            total_amount, 
            created_at,
            updated_at,
            merchant_id,
            merchant:merchant_id(name),
            driver_id
        `)
        .order('updated_at', { ascending: false })
        .limit(5)

    if (orderError) {
        console.error('Error fetching orders:', orderError.message)
    } else {
        if (orders && orders.length > 0) {
            console.log(`Found ${orders.length} recently updated orders.`)
            orders.forEach(o => {
                console.log(`- Order #${o.id} | Status: '${o.status}' | Driver: ${o.driver_id} | Merchant: ${o.merchant?.name}`)
            })
        } else {
            console.log('No recent orders found.')
        }
    }
}

checkLatestOrder()
