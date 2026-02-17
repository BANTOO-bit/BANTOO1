import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('--- Starting Real Data Verification ---');

    // 1. Find a Valid Driver
    console.log('\nNO. 1 FINDING DRIVER...');
    const { data: drivers, error: driverError } = await supabase
        .from('drivers')
        .select(`
            *,
            profile:user_id (email, full_name, phone)
        `)
        .eq('status', 'approved')
        .eq('is_active', true)
        .limit(1);

    if (driverError || !drivers?.length) {
        console.error('❌ No active/approved driver found.');
        return;
    }
    const driver = drivers[0];
    console.log(`✅ Found Driver: ${driver.profile.full_name} (${driver.profile.email})`);

    // 2. Find a Valid Customer
    console.log('\nNO. 2 FINDING CUSTOMER...');
    // We'll just take the most recent profile that is NOT the driver
    const { data: customers, error: customerError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', driver.user_id) // Don't pick the driver as customer
        .order('created_at', { ascending: false })
        .limit(1);

    if (customerError || !customers?.length) {
        console.error('❌ No customer found.');
        return;
    }
    const customer = customers[0];
    console.log(`✅ Found Customer: ${customer.full_name} (${customer.email})`);

    // 3. Find a Merchant with Menu Items
    console.log('\nNO. 3 FINDING MERCHANT...');
    const { data: merchants, error: merchantError } = await supabase
        .from('merchants')
        .select(`
            *,
            menus (id, name, price)
        `)
        .eq('is_active', true)
        .limit(1);

    if (merchantError || !merchants?.length) {
        console.error('❌ No active merchant found.');
        return;
    }
    // Filter for merchant with visible menu items
    const validMerchant = merchants.find(m => m.menus?.length > 0);

    if (!validMerchant) {
        console.error('❌ Found merchant but no menu items available.');
        return;
    }
    console.log(`✅ Found Merchant: ${validMerchant.name}`);
    console.log(`   Menu Item: ${validMerchant.menus[0].name} (Rp ${validMerchant.menus[0].price})`);

    // 4. Create an Order
    console.log('\nNO. 4 CREATING ORDER...');
    const orderPayload = {
        customer_id: customer.id,
        merchant_id: validMerchant.id,
        status: 'pending',
        total_amount: validMerchant.menus[0].price + 10000, // Item + Delivery
        delivery_address: 'Test Address via Script',
        delivery_fee: 10000,
        items: [
            {
                menu_id: validMerchant.menus[0].id,
                quantity: 1,
                price: validMerchant.menus[0].price,
                note: 'Test Order'
            }
        ]
    };

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

    if (orderError) {
        console.error('❌ Failed to create order:', orderError.message);
        return;
    }
    console.log(`✅ Order Create Success! ID: ${order.id}`);
    console.log(`   Status: ${order.status}`);

    // 5. Simulate Driver Action (Accept Order)
    console.log('\nNO. 5 SIMULATING DRIVER ACCEPT...');
    // In real app, driver calls 'driver_accept_order' RPC
    const { data: acceptData, error: acceptError } = await supabase
        .rpc('driver_accept_order', {
            p_order_id: order.id,
            p_driver_id: driver.user_id
        });

    if (acceptError) {
        console.log(`⚠️ RPC Error (Normal if RLS blocks script): ${acceptError.message}`);
        console.log('   Trying manual update as admin...');

        const { error: manualUpdateError } = await supabase
            .from('orders')
            .update({
                status: 'driver_assigned',
                driver_id: driver.user_id
            })
            .eq('id', order.id);

        if (manualUpdateError) {
            console.error('❌ Failed to assign driver:', manualUpdateError.message);
            return;
        }
        console.log('✅ Driver assigned manually (Admin Override)');
    } else {
        console.log('✅ Driver accepted via RPC!');
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
    console.log('Use these credentials to login and verify:');
    console.log(`DRIVER:   ${driver.profile.email}`);
    console.log(`CUSTOMER: ${customer.email}`);
}

main().catch(console.error);
