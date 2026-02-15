import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDriverSchema() {
    console.log('Checking drivers table schema...')
    const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error:', error)
        return
    }

    if (data && data.length > 0) {
        console.log('Driver columns:', Object.keys(data[0]))
    } else {
        console.log('No drivers found, cannot determine schema.')
        // Fallback: try to insert a dummy (then rollback/delete) or just rely on assumptions
        // But usually there is at least one driver. 
        // If empty, I will assume based on PartnerRegistrationContext which sends: 
        // bank_name, bank_account_name, bank_account_number
    }
}

checkDriverSchema()
