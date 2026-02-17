
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

if (fs.existsSync('.env')) dotenv.config({ path: '.env' });
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local', override: true });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function findMerchant() {
    // 1. List top 10 merchants
    const { data: merchants, error: mError } = await supabase
        .from('merchants')
        .select('id, name')
        .limit(10);

    if (mError) {
        console.error('Error fetching merchants:', mError);
        return;
    }

    console.log('Available Merchants:', merchants);

    // If still can't find, let's try to query orders again but just list the merchant names
    const { data: orders } = await supabase
        .from('orders')
        .select('merchant_id, merchants(name)')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log('Recent Orders Merchants:', orders?.map(o => o.merchants?.name));

    // 2. Find the owner email
    const { data: owners, error: oError } = await supabase
        .from('merchant_owners')
        .select('email')
        .eq('merchant_id', merchant.id);

    if (owners?.length) {
        console.log(`Owner Email: ${owners[0].email}`);
    } else {
        console.log('No owner found for this merchant.');
    }
}

findMerchant();
