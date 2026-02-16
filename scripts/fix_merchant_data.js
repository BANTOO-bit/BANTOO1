
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

async function fixData() {
    console.log('🔧 Fixing Merchant Data...')

    // 1. Find "Warung Makan Bu Sri"
    const { data: merchants, error } = await supabase
        .from('merchants')
        .select('id, name, address')
        .ilike('name', '%Warung Makan Bu Sri%')

    if (error) throw error

    if (!merchants || merchants.length === 0) {
        console.log('No matching merchant found.')
        return
    }

    const target = merchants[0]
    console.log(`Found Merchant: ${target.name} (${target.id})`)
    console.log(`Old Address: ${target.address}`)

    // 2. Update Address
    const newAddress = 'Jl. Raya Ungaran No. 10, Semarang'

    // START DB FIX
    // NOTE: Direct update via Anon key might be blocked by RLS if not owner.
    // However, for this environment we often have broad RLS or we are owner.
    // If this fails, we might need a service role key or user owner login simulation.
    // Let's try direct update first.

    const { error: updateError } = await supabase
        .from('merchants')
        .update({ address: newAddress })
        .eq('id', target.id)

    if (updateError) {
        console.error('❌ Update Failed:', updateError.message)
        console.log('Trying with Service Role if available or manual intervention needed.')
    } else {
        console.log(`✅ Address updated to: "${newAddress}"`)
    }
}

fixData().catch(console.error)
