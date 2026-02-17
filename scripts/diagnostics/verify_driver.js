
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load env
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envConfig = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
        envConfig[key.trim()] = value.trim()
    }
})

const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY)

async function verify() {
    console.log('Checking driver application status...')

    // 1. Get profile by email if possible, or just list latest drivers
    const { data: drivers, error } = await supabase
        .from('drivers')
        .select(`
            id, status, created_at, user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5)

    if (error) {
        console.error('Error fetching drivers:', error)
    } else {
        console.log('Latest 5 Driver Applications:')
        if (drivers.length === 0) {
            console.log('No driver applications found.')
        } else {
            for (const d of drivers) {
                const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', d.user_id).single()
                console.log(`- [${d.status}] Driver ID: ${d.id} (Name: ${profile?.full_name || 'Unknown'}, Email: ${profile?.email || 'N/A'})`)
            }
        }
    }
}

verify()
