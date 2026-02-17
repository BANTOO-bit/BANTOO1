
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function listTables() {
    console.log('Listing tables...')
    // Querying the information_schema to list tables
    // This requires specific permissions, but let's try.
    // Alternatively, we can just try to access common table names and see if they error.

    const tablesToCheck = ['withdrawals', 'transactions', 'payouts', 'wallet', 'balance_history']

    for (const table of tablesToCheck) {
        const { error } = await supabase.from(table).select('id').limit(1)
        if (!error) {
            console.log(`Table found: ${table}`)
        } else {
            // console.log(`Table likely missing: ${table} (${error.message})`)
        }
    }
}

listTables()
