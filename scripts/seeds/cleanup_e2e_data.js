/**
 * BANTOO E2E Test Data Cleanup
 * Removes all E2E test accounts and associated data from Supabase.
 * 
 * Usage: node scripts/seeds/cleanup_e2e_data.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadEnv() {
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
                vars[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim()
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
if (!env) { console.error('❌ Could not find .env'); process.exit(1) }

// Need service_role key for admin.deleteUser — fall back to anon key for data cleanup only
const serviceRoleKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
const supabaseAdmin = serviceRoleKey
    ? createClient(env.VITE_SUPABASE_URL, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null

const E2E_EMAILS = [
    'e2e.customer@bantoo.app',
    'e2e.merchant@bantoo.app',
    'e2e.driver@bantoo.app',
]

async function cleanup() {
    console.log('\n🧹 BANTOO E2E Test Data Cleanup')
    console.log('='.repeat(50))

    // 1. Find user IDs by email
    const userIds = []
    for (const email of E2E_EMAILS) {
        // Sign in to get user ID
        const { data } = await supabase.auth.signInWithPassword({ email, password: 'TestPass123!' })
        if (data?.user?.id) {
            userIds.push({ id: data.user.id, email })
            console.log(`   Found: ${email} → ${data.user.id}`)
            await supabase.auth.signOut()
        } else {
            console.log(`   ⚠️  Not found: ${email}`)
        }
    }

    if (userIds.length === 0) {
        console.log('\n✅ No E2E test accounts found — already clean!')
        return
    }

    const ids = userIds.map(u => u.id)

    // 2. Delete related data (order matters for foreign keys)
    const tables = [
        { name: 'order_items', column: null, via: 'orders' },
        { name: 'orders', column: 'customer_id', ids },
        { name: 'orders', column: 'driver_id', ids },
        { name: 'menu_items', column: null, via: 'merchants' },
        { name: 'merchants', column: 'owner_id', ids },
        { name: 'drivers', column: 'user_id', ids },
        { name: 'wallets', column: 'user_id', ids },
        { name: 'user_roles', column: 'user_id', ids },
        { name: 'notifications', column: 'user_id', ids },
    ]

    // Delete orders first (by customer_id)
    console.log('\n📦 Deleting orders...')
    const { data: orders } = await supabase.from('orders').select('id').in('customer_id', ids)
    if (orders?.length) {
        const orderIds = orders.map(o => o.id)
        await supabase.from('order_items').delete().in('order_id', orderIds)
        console.log(`   ✅ Deleted order_items for ${orderIds.length} orders`)
        await supabase.from('orders').delete().in('id', orderIds)
        console.log(`   ✅ Deleted ${orderIds.length} orders`)
    } else {
        console.log('   No orders found')
    }

    // Delete merchant menu items
    console.log('\n🍽️  Deleting merchant data...')
    const { data: merchants } = await supabase.from('merchants').select('id').in('owner_id', ids)
    if (merchants?.length) {
        const merchantIds = merchants.map(m => m.id)
        await supabase.from('menu_items').delete().in('merchant_id', merchantIds)
        console.log(`   ✅ Deleted menu_items for ${merchantIds.length} merchants`)
        await supabase.from('merchants').delete().in('id', merchantIds)
        console.log(`   ✅ Deleted ${merchantIds.length} merchants`)
    } else {
        console.log('   No merchants found')
    }

    // Delete drivers
    console.log('\n🏍️  Deleting driver data...')
    const { error: driverErr } = await supabase.from('drivers').delete().in('user_id', ids)
    console.log(driverErr ? `   ⚠️  ${driverErr.message}` : '   ✅ Deleted drivers')

    // Delete other related data
    console.log('\n🗂️  Deleting related data...')
    for (const table of ['wallets', 'user_roles', 'notifications']) {
        const { error } = await supabase.from(table).delete().in('user_id', ids)
        console.log(error ? `   ⚠️  ${table}: ${error.message}` : `   ✅ ${table} cleaned`)
    }

    // Delete profiles
    console.log('\n👤 Deleting profiles...')
    const { error: profileErr } = await supabase.from('profiles').delete().in('id', ids)
    console.log(profileErr ? `   ⚠️  ${profileErr.message}` : '   ✅ Profiles deleted')

    // 3. Delete auth users (requires service_role key)
    console.log('\n🔐 Deleting auth users...')
    if (supabaseAdmin) {
        for (const { id, email } of userIds) {
            const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
            console.log(error ? `   ⚠️  ${email}: ${error.message}` : `   ✅ ${email} deleted from Auth`)
        }
    } else {
        console.log('   ⚠️  No service_role key found — auth users NOT deleted')
        console.log('   💡 Hapus manual di Supabase Dashboard → Authentication → Users')
        console.log('   💡 Atau tambahkan SUPABASE_SERVICE_ROLE_KEY di .env')
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 E2E test data cleanup complete!')
    console.log('   Database siap untuk real testing.\n')
}

cleanup().catch(console.error)
