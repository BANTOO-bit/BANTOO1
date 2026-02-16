
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRPCs() {
    console.log('Checking for Driver RPC functions...')

    const rpcsToCheck = [
        'get_available_orders',
        'driver_accept_order',
        'driver_update_order_status',
        'update_driver_location',
        'toggle_driver_status'
    ]

    for (const rpcName of rpcsToCheck) {
        // Try calling with dummy args designed to fail validation but pass "function exists" check
        // OR just check if we get a "function not found" error
        try {
            const { error } = await supabase.rpc(rpcName, {})

            if (error) {
                if (error.code === '42883' || error.message.includes('does not exist')) {
                    console.log(`❌ ${rpcName}: MISSING`)
                } else {
                    // If it's another error (like param mismatch), the function EXISTS
                    console.log(`✅ ${rpcName}: EXISTS (Error: ${error.message})`)
                }
            } else {
                console.log(`✅ ${rpcName}: EXISTS`)
            }
        } catch (e) {
            console.log(`❌ ${rpcName}: ERROR ${e.message}`)
        }
    }
}

checkRPCs()
