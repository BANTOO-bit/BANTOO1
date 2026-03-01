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
    console.error('Error: .env not found or missing credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setAdminRole() {
    const email = 'projectnariswara@gmail.com'
    const password = 'Indonesia1'

    console.log(`Logging in as ${email}...`)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (authError) {
        console.error('Error logging in:', authError.message)
        return
    }

    console.log('Login successful. Updating profile role to admin...')

    const userId = authData.user.id

    const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', active_role: 'admin' })
        .eq('id', userId)

    if (updateError) {
        console.error('Error updating profile:', updateError.message)
    } else {
        console.log('Profile successfully updated to admin!')
    }
}

setAdminRole()
