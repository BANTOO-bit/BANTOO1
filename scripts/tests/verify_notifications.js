import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
// Note: Anon key might not have permission to select * from notifications if RLS is on and not logged in.
// But we need to test connectivity. Ideally we use Service Role key for admin checks, 
// but we don't have it in .env (as noted in previous turn). 
// FOr now, let's try with Anon Key, it might fail RLS.
// Actually, I saw `SUPABASE_SERVICE_ROLE_KEY` is missing.

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkNotifications() {
    console.log('Checking notifications table...')

    // Try to select 1 row
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error selecting notifications:', error.message)
        return
    }

    console.log('Successfully accessed notifications table.')
    if (data.length > 0) {
        console.log('Sample row:', data[0])
        console.log('Columns:', Object.keys(data[0]))
    } else {
        console.log('Table is empty, but exists.')
        // Try to insert a dummy to see valid columns? No, that might dirty DB.
        // We'll just assume standard columns from financeService usage.
    }
}

checkNotifications()
