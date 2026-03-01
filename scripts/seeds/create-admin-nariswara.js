import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../../.env')

let supabaseUrl = ''
let supabaseKey = ''

try {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, ...rest] = line.split('=')
        const value = rest.join('=')
        if (key && value) {
            if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value.trim()
            if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseKey = value.trim()
        }
    })
} catch (e) {
    console.error('Could not read .env', e)
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: .env not found or missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
    const email = 'projectnariswara@gmail.com'
    const password = 'Indonesia1'

    console.log(`Creating admin account for ${email}...`)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Admin Project Nariswara',
                role: 'admin'
            }
        }
    })

    if (error) {
        console.error('Error creating admin:', error.message)
    } else {
        console.log('Admin created successfully!')
        console.log('Email:', email)
        console.log('Password:', password)
    }
}

createAdmin()
