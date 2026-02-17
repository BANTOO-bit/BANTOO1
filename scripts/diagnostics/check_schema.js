import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    console.log('Checking addresses table schema with auth...')

    // 1. Sign In
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'customer.test@bantoo.app',
        password: 'password123'
    })

    if (authError) {
        console.error('Auth failed:', authError.message)
        return
    }

    const userId = authData.user.id
    console.log('Logged in as:', userId)

    // 2. Try Insert
    const { data: insertData, error: insertError } = await supabase
        .from('addresses')
        .insert({
            user_id: userId,
            label: 'Test',
            recipient_name: 'Test',
            phone: '123',
            address: 'Test',
            latitude: -6.2,
            longitude: 106.8,
            is_default: false
        })
        .select()


    if (insertError) {
        console.error('Error inserting:', insertError)
    } else {
        console.log('Insert successful (unexpected for dummy user).')
    }
}

checkSchema()
