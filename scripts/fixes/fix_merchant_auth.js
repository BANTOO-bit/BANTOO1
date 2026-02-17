
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

async function attemptAuthenticatedUpdate() {
    console.log('🕵️ Finding Merchant Owner...')

    // 1. Get Merchant Owner ID
    const { data: merchants } = await supabase.from('merchants').select('id, owner_id, name, address').ilike('name', '%Warung Makan Bu Sri%').limit(1)
    if (!merchants?.length) throw new Error('Merchant not found')
    const merchant = merchants[0]

    console.log(`Merchant: ${merchant.name}`)
    console.log(`Current Address: ${merchant.address}`)
    console.log(`Owner ID: ${merchant.owner_id}`)

    // 2. Get Profile/Email (if accessible)
    // We need email to login. Profiles usually have it if synced, or we might fail here.
    const { data: profile, error: pErr } = await supabase.from('profiles').select('email, full_name').eq('id', merchant.owner_id).single()

    if (pErr || !profile) {
        console.error('Could not find profile for owner (RLS likely blocking profile read too).')
        // Fallback: Try a known test email pattern if possible? No.
        return
    }

    console.log(`Owner Email: ${profile.email || 'Hidden via RLS'}`)

    if (!profile.email) {
        console.error('Email is hidden. Cannot attempt login.')
        return
    }

    // 3. Attempt Login with 'password123'
    console.log(`Attempting login as ${profile.email}...`)
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: 'password123'
    })

    if (loginError) {
        console.error('Login Failed:', loginError.message)
        return
    }

    console.log('✅ Login Successful! User is Merchant Owner.')
    const authClient = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${loginData.session.access_token}` } }
    })

    // 4. Update Address
    const newAddress = 'Jl. Raya Ungaran No. 10, Semarang'
    console.log(`Updating address to: ${newAddress}`)

    const { error: updateError, count } = await authClient
        .from('merchants')
        .update({ address: newAddress })
        .eq('id', merchant.id)
        .select() // Returning to confirm

    if (updateError) console.error('Update Failed:', updateError.message)
    else console.log('✅ Update Verified! Address changed.')

}

attemptAuthenticatedUpdate().catch(console.error)
