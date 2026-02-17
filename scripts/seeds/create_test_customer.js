import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function createCustomer() {
    console.log('--- CREATING TEST CUSTOMER ---')

    const email = 'customer.test@bantoo.app'
    const password = 'password123'
    const name = 'Customer Test'
    const phone = '08999991111'

    console.log(`Registering ${email}...`)

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        // options: {
        //     data: {
        //         full_name: name,
        //         phone_number: phone,
        //         role: 'user' // Default role for customer
        //     }
        // }
    })

    if (error) {
        console.error('Error creating customer:', error)
        return
    }

    if (data.user) {
        console.log(`\n[SUCCESS] User created!`)
        console.log(`ID: ${data.user.id}`)
        console.log(`Email: ${email}`)
        console.log(`Password: ${password}`)

        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length > 0) {
            console.log('Identity created.')
        }
        if (!data.session) {
            console.log('\n[NOTE] Session is null. Email confirmation might be required.')
            console.log('If so, you might need to confirm the email manually in Supabase dashboard or disable "Confirm Email" in Auth settings.')
        } else {
            console.log('\n[NOTE] Session active. Auto-confirm likely enabled.')
        }
    } else {
        console.log('\n[UNKNOWN] User data returned but user object missing??', data)
    }
}

createCustomer()
