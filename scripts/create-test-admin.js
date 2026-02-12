import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Load env vars from .env.local (same pattern as seed_users.js)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../.env.local')

let supabaseUrl = ''
let supabaseKey = ''

try {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value.trim()
            if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseKey = value.trim()
        }
    })
} catch (e) {
    console.error('Could not read .env.local')
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: .env.local not found or missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
    const phone = '081234567890'
    const email = '081234567890@bantoo.app'
    const password = 'password123'

    console.log(`Creating admin account for ${phone}...`)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Test Admin',
                role: 'admin',
                phone_number: phone
            }
        }
    })

    if (error) {
        console.error('Error creating admin:', error.message)
    } else {
        console.log('Admin created successfully!')
        console.log('Phone:', phone)
        console.log('Password:', password)
    }
}

createAdmin()
