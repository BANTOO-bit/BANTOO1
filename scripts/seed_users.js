import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Load env vars manually without dotenv
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

const users = [
    {
        name: 'Tes Customer',
        phone: '081111111111',
        password: 'password123',
        role: 'user'
    },
    {
        name: 'Tes Warung',
        phone: '082222222222',
        password: 'password123',
        role: 'merchant',
        shopName: 'Warung Sejahtera',
        address: 'Jl. Testing No. 1'
    },
    {
        name: 'Tes Driver',
        phone: '083333333333',
        password: 'password123',
        role: 'driver',
        plate: 'B 1234 TES',
        vehicle: 'motorcycle'
    }
]

async function seed() {
    console.log('Starting seed process...')

    for (const user of users) {
        const email = `${user.phone}@bantoo.app`
        console.log(`Creating user: ${user.name} (${user.role})...`)

        // 1. Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: user.password,
            options: {
                data: {
                    full_name: user.name,
                    phone_number: user.phone,
                    role: 'user' // Initial role is always user
                }
            }
        })

        if (authError) {
            console.error(`Error creating auth for ${user.name}:`, authError.message)
            continue
        }

        const userId = authData.user?.id
        if (!userId) {
            console.error(`Failed to get ID for ${user.name}`)
            continue
        }

        console.log(`User created! ID: ${userId}`)

        // 2. Add Partner Data
        if (user.role === 'merchant') {
            console.log(`Registering Merchant data...`)
            const { error: merchantError } = await supabase
                .from('merchants')
                .insert({
                    owner_id: userId,
                    name: user.shopName,
                    address: user.address,
                    status: 'approved', // Auto approve
                    is_open: true
                })

            if (merchantError) console.error('Error creating merchant:', merchantError.message)
            else console.log('Merchant created and approved!')
        }

        if (user.role === 'driver') {
            console.log(`Registering Driver data...`)
            const { error: driverError } = await supabase
                .from('drivers')
                .insert({
                    user_id: userId,
                    vehicle_type: user.vehicle,
                    vehicle_plate: user.plate,
                    status: 'approved', // Auto approve
                    is_active: true
                })

            if (driverError) console.error('Error creating driver:', driverError.message)
            else console.log('Driver created and approved!')
        }
    }

    console.log('\nSeed completed!')
    console.log('Login Credentials:')
    users.forEach(u => {
        console.log(`- ${u.role.toUpperCase()}: ${u.phone} / ${u.password}`)
    })
}

seed()
