import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function findUsers() {
    console.log('--- FINDING TEST USERS ---')

    // 1. Find a Customer
    const { data: customers, error: customerError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role') // Note: email might be in auth.users, profiles usually has it too if synced
        .eq('role', 'customer')
        .limit(1)

    if (customers && customers.length > 0) {
        console.log(`\n[CUSTOMER]\nEmail: ${customers[0].email || 'Check Auth Table'}\nName: ${customers[0].full_name}`)
    } else {
        console.log('\n[CUSTOMER] No customer profile found.')
    }

    // 2. Find a Driver
    // Join drivers -> profiles
    const { data: drivers, error: driverError } = await supabase
        .from('drivers')
        .select(`
            status,
            profiles:user_id (email, full_name)
        `)
        .eq('status', 'approved')
        .limit(1)

    if (drivers && drivers.length > 0) {
        console.log(`\n[DRIVER]\nEmail: ${drivers[0].profiles?.email}\nName: ${drivers[0].profiles?.full_name}\nStatus: ${drivers[0].status}`)
    } else {
        console.log('\n[DRIVER] No approved driver found.')
    }

    // 3. Find a Merchant
    const { data: merchants, error: merchantError } = await supabase
        .from('merchants')
        .select('id, name, address')
        .limit(1)

    if (merchants && merchants.length > 0) {
        console.log(`\n[MERCHANT]\nName: ${merchants[0].name}\nAddress: ${merchants[0].address}`)
    } else {
        console.log('\n[MERCHANT] No merchant found.')
    }
}

findUsers()
