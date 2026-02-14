
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Try loading .env first, then .env.local
if (fs.existsSync('.env')) {
    dotenv.config({ path: '.env' });
}
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local', override: true });
}

const sbUrl = process.env.VITE_SUPABASE_URL;
const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!sbUrl || !sbKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment variables.');
    process.exit(1);
}

const supabase = createClient(sbUrl, sbKey);

async function getMerchant() {
    console.log('Fetching latest order...');
    const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select(`
            id,
            merchant_id,
            status,
            created_at,
            merchants (
                id,
                name
            )
        `)
        .order('created_at', { ascending: false })
        .limit(1);

    if (orderError) {
        console.error('Error fetching order:', orderError);
        return;
    }

    if (!orders || orders.length === 0) {
        console.log('No orders found.');
        return;
    }

    const latestOrder = orders[0];

    console.log('Latest Order:', {
        id: latestOrder.id,
        status: latestOrder.status,
        merchant: latestOrder.merchants?.name
    });

    // Try finding email for this merchant
    const { data: owners, error: ownerError } = await supabase
        .from('merchant_owners')
        .select('email')
        .eq('merchant_id', latestOrder.merchant_id);

    if (ownerError) {
        console.log('Could not fetch owner email (likely RLS).');
        console.log('Please login as the merchant owner for:', latestOrder.merchants?.name);
    } else if (owners && owners.length > 0) {
        console.log('Merchant Owner Email:', owners[0].email);
    } else {
        console.log('No owner email found for this merchant.');
    }
}

getMerchant();
