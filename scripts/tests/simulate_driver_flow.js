
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

// Function to create a client with a specific user token
const createAuthClient = (token) => {
    return createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    })
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function simulateFlow() {
    console.log('🚀 Starting Robust Driver Flow Simulation...')

    // 1. Create unique test users
    const timestamp = Date.now()
    const customerEmail = `cust_${timestamp}@test.com`
    const driverEmail = `driver_${timestamp}@test.com`
    const merchantEmail = `merchant_${timestamp}@test.com` // NEW
    const password = 'password123'

    // --- CUSTOMER SETUP ---
    console.log(`Creating Customer: ${customerEmail}`)
    const { data: custAuth, error: custError } = await supabase.auth.signUp({ email: customerEmail, password })
    if (custError) throw new Error(`Customer Setup Failed: ${custError.message}`)
    const customerId = custAuth.user.id
    await supabase.from('profiles').upsert({ id: customerId, full_name: 'Test Customer', role: 'customer' })

    // --- DRIVER SETUP ---
    console.log(`Creating Driver: ${driverEmail}`)
    const { data: driverAuth, error: driverError } = await supabase.auth.signUp({ email: driverEmail, password })
    if (driverError) throw new Error(`Driver Setup Failed: ${driverError.message}`)
    const driverId = driverAuth.user.id
    // Profile AND Driver Record
    await supabase.from('profiles').upsert({ id: driverId, full_name: 'Test Driver', role: 'driver' })
    await supabase.from('drivers').insert({
        user_id: driverId,
        status: 'approved',
        is_active: true, // Must be online to see orders? Maybe RPC checks this? (Usually toggle_driver_status sets this)
        vehicle_type: 'motor',
        vehicle_plate: 'B 1234 TST'
    })

    // --- MERCHANT SETUP ---
    console.log(`Creating Merchant User: ${merchantEmail}`)
    const { data: merchAuth, error: merchError } = await supabase.auth.signUp({ email: merchantEmail, password })
    if (merchError) throw new Error(`Merchant Setup Failed: ${merchError.message}`)
    const merchantUserId = merchAuth.user.id
    await supabase.from('profiles').upsert({ id: merchantUserId, full_name: 'Test Merchant Owner', role: 'merchant', merchant_status: 'approved' })

    // Create Merchant Business Record
    const merchantRec = {
        owner_id: merchantUserId,
        name: `Test Resto ${timestamp}`,
        address: 'Jalan Test No. 1',
        image_url: 'https://via.placeholder.com/150',
        latitude: -6.200,
        longitude: 106.816,
        is_open: true,
        rating: 4.5
    }
    const { data: merchant, error: mError } = await supabase.from('merchants').insert(merchantRec).select().single()
    if (mError) throw new Error(`Merchant Record Creation Failed: ${mError.message}`)
    console.log(`✅ Merchant Created: ${merchant.name} (${merchant.id})`)

    // --- LOGIN ---
    const { data: custLogin } = await supabase.auth.signInWithPassword({ email: customerEmail, password })
    const { data: driverLogin } = await supabase.auth.signInWithPassword({ email: driverEmail, password })
    const { data: merchLogin } = await supabase.auth.signInWithPassword({ email: merchantEmail, password })

    const custClient = createAuthClient(custLogin.session.access_token)
    const driverClient = createAuthClient(driverLogin.session.access_token)
    const merchClient = createAuthClient(merchLogin.session.access_token)

    // --- ORDER CREATION ---
    console.log('Creating Order...')
    const orderData = {
        customer_id: customerId,
        merchant_id: merchant.id,
        subtotal: 50000,
        delivery_fee: 10000,
        total_amount: 60000,
        payment_method: 'cod',
        status: 'pending',
        delivery_address: 'Test Address 123',
        customer_lat: -6.200,
        customer_lng: 106.816
    }

    const { data: order, error: orderError } = await custClient
        .from('orders')
        .insert(orderData)
        .select()
        .single()

    if (orderError) throw new Error(`Order Creation Failed: ${orderError.message}`)
    console.log(`✅ Order Created: ${order.id} (Status: ${order.status})`)

    // --- MERCHANT ACCEPTS ORDER (Set to 'ready') ---
    console.log('Merchant accepting order to prepare...')
    // Merchant usually goes pending -> accepted -> preparing -> ready
    // Let's skip to ready for speed, if allowed. RLS usually allows merchant owner to update status.
    const { error: updateError } = await merchClient
        .from('orders')
        .update({ status: 'ready' })
        .eq('id', order.id)

    if (updateError) throw new Error(`Merchant Update Failed: ${updateError.message}`)
    console.log('✅ Order status set to "ready" by Merchant')

    // --- DRIVER CHECK ---
    console.log('Driver checking for orders...')
    const { data: availableOrders, error: rpcError } = await driverClient.rpc('get_available_orders', {
        p_lat: -6.200,
        p_lng: 106.816,
        p_radius_km: 50
    })

    if (rpcError) {
        console.error('❌ get_available_orders RPC Failed:', rpcError.message)
    } else {
        console.log(`Found ${availableOrders.length} orders via RPC`)
        const found = availableOrders.find(o => o.id === order.id)
        if (found) console.log('✅ Created order IS VISIBLE to driver!')
        else {
            console.warn('⚠️ Created order NOT visible in RPC results!')
            // Debug: Check if order status is actually ready in DB (public read might be restricted, try merchant client)
            const { data: check } = await merchClient.from('orders').select('status').eq('id', order.id).single()
            console.log(`Debug Check Status: ${check?.status}`)
        }
    }

    // --- DRIVER ACCEPT ---
    console.log(`Driver accepting order ${order.id}...`)
    // IMPORTANT: driver_accept_order usually calls:
    // UPDATE orders SET driver_id = user.id, status = 'pickup', picked_up_at = NOW() WHERE id = p_order_id AND driver_id IS NULL AND status = 'ready'
    const { data: acceptResult, error: acceptError } = await driverClient.rpc('driver_accept_order', {
        p_order_id: order.id
    })

    if (acceptError) {
        console.error('❌ driver_accept_order RPC Failed:', acceptError.message)
    } else {
        console.log('Accept Result:', acceptResult)
        if (acceptResult?.success) console.log('✅ Order Accepted Successfully')
        else console.warn('⚠️ Order Accept returned fail/false')
    }

    // Verify Final Status
    const { data: finalOrder } = await driverClient.from('orders').select('status, driver_id').eq('id', order.id).single()
    console.log(`Final Order Status: ${finalOrder?.status}, Driver: ${finalOrder?.driver_id}`)

    if (finalOrder?.driver_id === driverId) {
        console.log('✅ Driver correctly assigned. Flow Verified!')
    } else {
        console.error('❌ Driver NOT assigned.')
    }
}

simulateFlow().catch(err => console.error('Fatal Error:', err))
