/**
 * ============================================================
 * BANTOO E2E TEST DATA SEEDER
 * ============================================================
 * 
 * Creates complete test data for end-to-end testing:
 * - Customer account (with profile)
 * - Merchant account (with store + menu items)
 * - Driver account (with vehicle details)
 * 
 * Usage:
 *   node scripts/seeds/seed_e2e_test_data.js
 * 
 * Prerequisites:
 *   - .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 *   - Supabase project with email confirmation disabled (or auto-confirm enabled)
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ============================================================
// Load Environment Variables
// ============================================================

function loadEnv() {
    // Try .env first, then .env.local
    const envPaths = [
        path.resolve(__dirname, '../../.env'),
        path.resolve(__dirname, '../../.env.local'),
    ]

    for (const envPath of envPaths) {
        try {
            const content = fs.readFileSync(envPath, 'utf8')
            const vars = {}
            content.split('\n').forEach(line => {
                const trimmed = line.trim()
                if (!trimmed || trimmed.startsWith('#')) return
                const eqIdx = trimmed.indexOf('=')
                if (eqIdx === -1) return
                const key = trimmed.substring(0, eqIdx).trim()
                const value = trimmed.substring(eqIdx + 1).trim()
                vars[key] = value
            })
            if (vars.VITE_SUPABASE_URL && vars.VITE_SUPABASE_ANON_KEY) {
                console.log(`✅ Loaded env from: ${envPath}`)
                return vars
            }
        } catch { /* try next */ }
    }
    return null
}

const env = loadEnv()
if (!env) {
    console.error('❌ Could not find .env or .env.local with Supabase credentials')
    process.exit(1)
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

// ============================================================
// Test Data Configuration
// ============================================================

const TEST_DATA = {
    customer: {
        email: 'e2e.customer@bantoo.app',
        password: 'TestPass123!',
        fullName: 'E2E Customer',
        phone: '081200001111',
    },
    merchant: {
        email: 'e2e.merchant@bantoo.app',
        password: 'TestPass123!',
        fullName: 'E2E Merchant Owner',
        phone: '081200002222',
        store: {
            name: 'Warung E2E Test',
            address: 'Jl. Testing No. 42, Kota Bandung',
            category: 'makanan-berat',
            description: 'Warung test otomatis untuk E2E testing',
            latitude: -6.9175,
            longitude: 107.6191,
            delivery_fee: 5000,
            delivery_time: '15-25 min',
            is_open: true,
        },
        menuItems: [
            {
                name: 'Nasi Goreng Spesial',
                category: 'makanan-berat',
                price: 15000,
                description: 'Nasi goreng dengan telur, ayam, dan sayuran',
                is_available: true,
                is_popular: true,
            },
            {
                name: 'Mie Ayam Bakso',
                category: 'makanan-berat',
                price: 12000,
                description: 'Mie ayam dengan bakso sapi pilihan',
                is_available: true,
                is_popular: true,
            },
            {
                name: 'Es Teh Manis',
                category: 'minuman',
                price: 5000,
                description: 'Teh manis dingin segar',
                is_available: true,
                is_popular: false,
            },
            {
                name: 'Ayam Goreng Crispy',
                category: 'makanan-berat',
                price: 18000,
                description: 'Ayam goreng tepung renyah',
                is_available: true,
                is_popular: false,
            },
            {
                name: 'Soto Ayam',
                category: 'makanan-berat',
                price: 13000,
                description: 'Soto ayam dengan kuah kuning',
                is_available: true,
                is_popular: false,
            },
        ],
    },
    driver: {
        email: 'e2e.driver@bantoo.app',
        password: 'TestPass123!',
        fullName: 'E2E Driver',
        phone: '081200003333',
        vehicle: {
            vehicle_type: 'motorcycle',
            vehicle_brand: 'Honda Beat',
            vehicle_plate: 'D 1234 E2E',
        },
    },
}

// ============================================================
// Helper Functions
// ============================================================

async function createUserAccount(userData) {
    const { email, password, fullName, phone } = userData

    console.log(`\n📝 Creating user: ${fullName} (${email})...`)

    // 1. Sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone_number: phone,
            }
        }
    })

    if (authError) {
        // User might already exist
        if (authError.message?.includes('already registered') || authError.message?.includes('already been registered')) {
            console.log(`   ⚠️  User already exists, trying to login...`)
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
            if (loginError) {
                console.error(`   ❌ Login failed:`, loginError.message)
                return null
            }
            console.log(`   ✅ Logged in as existing user: ${loginData.user.id}`)
            return loginData.user
        }
        console.error(`   ❌ Sign up failed:`, authError.message)
        return null
    }

    if (!authData.user) {
        console.error(`   ❌ No user returned from signup`)
        return null
    }

    const userId = authData.user.id
    console.log(`   ✅ Auth user created: ${userId}`)

    // 2. Check if session is available (auto-confirm enabled)
    if (!authData.session) {
        console.log(`   ⚠️  No session — email confirmation may be required.`)
        console.log(`   💡 Disable "Confirm Email" in Supabase → Auth → Providers → Email`)
    }

    // 3. Update profile with phone number
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            phone: phone,
            email: email,
        })
        .eq('id', userId)

    if (profileError) {
        console.warn(`   ⚠️  Profile update warning:`, profileError.message)
    } else {
        console.log(`   ✅ Profile updated`)
    }

    return authData.user
}

async function signInAs(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
        console.error(`   ❌ Sign in failed for ${email}:`, error.message)
        return null
    }
    return data
}

// ============================================================
// Main Seed Functions
// ============================================================

async function seedCustomer() {
    console.log('\n' + '='.repeat(50))
    console.log('👤 SEEDING CUSTOMER')
    console.log('='.repeat(50))

    const user = await createUserAccount(TEST_DATA.customer)
    if (!user) return null

    // Ensure role is customer
    await supabase
        .from('profiles')
        .update({ role: 'customer', active_role: 'customer' })
        .eq('id', user.id)

    console.log(`   ✅ Customer ready: ${TEST_DATA.customer.email}`)
    return user
}

async function seedMerchant() {
    console.log('\n' + '='.repeat(50))
    console.log('🏪 SEEDING MERCHANT')
    console.log('='.repeat(50))

    const user = await createUserAccount(TEST_DATA.merchant)
    if (!user) return null

    // Sign in as merchant to have proper auth context
    await signInAs(TEST_DATA.merchant.email, TEST_DATA.merchant.password)

    // 1. Create merchant store
    console.log(`\n   🏪 Creating store: ${TEST_DATA.merchant.store.name}...`)

    // Check if merchant already exists
    const { data: existingMerchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

    let merchantId

    if (existingMerchant) {
        console.log(`   ⚠️  Merchant store already exists: ${existingMerchant.id}`)
        merchantId = existingMerchant.id

        // Update to ensure it's open and approved
        await supabase
            .from('merchants')
            .update({
                ...TEST_DATA.merchant.store,
                status: 'approved',
                is_open: true,
            })
            .eq('id', merchantId)
        console.log(`   ✅ Merchant updated to approved + open`)
    } else {
        const { data: newMerchant, error: merchantError } = await supabase
            .from('merchants')
            .insert({
                owner_id: user.id,
                ...TEST_DATA.merchant.store,
                status: 'approved',
                image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
            })
            .select('id')
            .single()

        if (merchantError) {
            console.error(`   ❌ Merchant creation failed:`, merchantError.message)
            return null
        }

        merchantId = newMerchant.id
        console.log(`   ✅ Merchant created: ${merchantId}`)
    }

    // 2. Update profile role
    await supabase
        .from('profiles')
        .update({ role: 'merchant', active_role: 'merchant' })
        .eq('id', user.id)

    // 3. Add user_roles entry
    const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(
            { user_id: user.id, role: 'merchant' },
            { onConflict: 'user_id,role' }
        )
    if (roleError) {
        console.warn(`   ⚠️  user_roles upsert warning:`, roleError.message)
    }

    // 4. Create menu items
    console.log(`\n   🍽️  Creating menu items...`)

    // Delete existing menu items for this merchant (clean slate)
    await supabase
        .from('menu_items')
        .delete()
        .eq('merchant_id', merchantId)

    for (const item of TEST_DATA.merchant.menuItems) {
        const { error: menuError } = await supabase
            .from('menu_items')
            .insert({
                merchant_id: merchantId,
                name: item.name,
                category: item.category,
                price: item.price,
                description: item.description,
                is_available: item.is_available,
                is_popular: item.is_popular,
                image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            })

        if (menuError) {
            console.error(`   ❌ Menu item "${item.name}" failed:`, menuError.message)
        } else {
            console.log(`   ✅ Menu: ${item.name} — Rp ${item.price.toLocaleString()}`)
        }
    }

    console.log(`   ✅ Merchant fully seeded with ${TEST_DATA.merchant.menuItems.length} menu items`)
    return { user, merchantId }
}

async function seedDriver() {
    console.log('\n' + '='.repeat(50))
    console.log('🏍️  SEEDING DRIVER')
    console.log('='.repeat(50))

    const user = await createUserAccount(TEST_DATA.driver)
    if (!user) return null

    // Sign in as driver
    await signInAs(TEST_DATA.driver.email, TEST_DATA.driver.password)

    // Check if driver record already exists
    const { data: existingDriver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

    if (existingDriver) {
        console.log(`   ⚠️  Driver record already exists, updating...`)
        await supabase
            .from('drivers')
            .update({
                ...TEST_DATA.driver.vehicle,
                status: 'approved',
                is_active: true,
            })
            .eq('user_id', user.id)
    } else {
        const { error: driverError } = await supabase
            .from('drivers')
            .insert({
                user_id: user.id,
                ...TEST_DATA.driver.vehicle,
                status: 'approved',
                is_active: true,
            })

        if (driverError) {
            console.error(`   ❌ Driver creation failed:`, driverError.message)
            return null
        }
    }

    // Update profile role
    await supabase
        .from('profiles')
        .update({ role: 'driver', active_role: 'driver' })
        .eq('id', user.id)

    // Add user_roles entry
    const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(
            { user_id: user.id, role: 'driver' },
            { onConflict: 'user_id,role' }
        )
    if (roleError) {
        console.warn(`   ⚠️  user_roles upsert warning:`, roleError.message)
    }

    console.log(`   ✅ Driver ready: ${TEST_DATA.driver.vehicle.vehicle_brand} (${TEST_DATA.driver.vehicle.vehicle_plate})`)
    return user
}

// ============================================================
// Run Seed
// ============================================================

async function main() {
    console.log('🚀 BANTOO E2E Test Data Seeder')
    console.log('='.repeat(50))
    console.log(`Supabase URL: ${env.VITE_SUPABASE_URL}`)
    console.log(`Timestamp: ${new Date().toISOString()}`)

    const results = {
        customer: null,
        merchant: null,
        driver: null,
    }

    try {
        results.customer = await seedCustomer()
        results.merchant = await seedMerchant()
        results.driver = await seedDriver()
    } catch (err) {
        console.error('\n❌ Unexpected error during seeding:', err)
    }

    // Sign out after seeding
    await supabase.auth.signOut()

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📋 SEED SUMMARY')
    console.log('='.repeat(50))
    console.log('')
    console.log('Test Credentials:')
    console.log('─'.repeat(40))
    console.log(`👤 Customer:`)
    console.log(`   Email:    ${TEST_DATA.customer.email}`)
    console.log(`   Phone:    ${TEST_DATA.customer.phone}`)
    console.log(`   Password: ${TEST_DATA.customer.password}`)
    console.log(`   Status:   ${results.customer ? '✅ Ready' : '❌ Failed'}`)
    console.log('')
    console.log(`🏪 Merchant:`)
    console.log(`   Email:    ${TEST_DATA.merchant.email}`)
    console.log(`   Phone:    ${TEST_DATA.merchant.phone}`)
    console.log(`   Password: ${TEST_DATA.merchant.password}`)
    console.log(`   Store:    ${TEST_DATA.merchant.store.name}`)
    console.log(`   Menu:     ${TEST_DATA.merchant.menuItems.length} items`)
    console.log(`   Status:   ${results.merchant ? '✅ Ready' : '❌ Failed'}`)
    console.log('')
    console.log(`🏍️  Driver:`)
    console.log(`   Email:    ${TEST_DATA.driver.email}`)
    console.log(`   Phone:    ${TEST_DATA.driver.phone}`)
    console.log(`   Password: ${TEST_DATA.driver.password}`)
    console.log(`   Vehicle:  ${TEST_DATA.driver.vehicle.vehicle_brand} (${TEST_DATA.driver.vehicle.vehicle_plate})`)
    console.log(`   Status:   ${results.driver ? '✅ Ready' : '❌ Failed'}`)
    console.log('')

    const allSuccess = results.customer && results.merchant && results.driver
    if (allSuccess) {
        console.log('🎉 All test data seeded successfully!')
    } else {
        console.log('⚠️  Some seed operations failed. Check logs above.')
    }

    console.log('')
}

main().catch(console.error)
