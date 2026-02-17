
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

async function checkAddressSchema() {
    console.log('Checking addresses table schema...')

    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching address:', error)
        // If error code is '42P01' (undefined_table), it means table doesn't exist
        return
    }

    if (data && data.length > 0) {
        console.log('Address columns:', Object.keys(data[0]))
    } else {
        console.log('No addresses found, but table likely exists.')
    }
}

checkAddressSchema()
