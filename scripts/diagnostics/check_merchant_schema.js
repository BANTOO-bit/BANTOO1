
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Load .env file manually if needed, or rely on dotenv.config()
dotenv.config()

// Fallback to process.env if not loaded
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMerchantSchema() {
    console.log('Checking merchants table schema...')

    // Select one row to see columns
    const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching merchant:', error)
        return
    }

    if (data && data.length > 0) {
        console.log('Merchant columns:', Object.keys(data[0]))
    } else {
        console.log('No merchants found to inspect. Cannot determine schema from empty table via client.')
        // If empty, we might need to check via RPC or just try to update a dummy column to see error?
        // But likely there is at least one merchant (the user).
    }
}

checkMerchantSchema()
