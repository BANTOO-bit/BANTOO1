
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

if (fs.existsSync('.env')) dotenv.config({ path: '.env' });
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local', override: true });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkOwners() {
    // 1. Get IDs for both merchants
    const { data: merchants, error } = await supabase
        .from('merchants')
        .select('id, name')
        .or('name.ilike.%Bu Sri%,name.ilike.%Pak Kumis%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Merchants Found:', merchants);

    // 2. Get owners for these merchants
    if (merchants?.length) {
        const ids = merchants.map(m => m.id);
        const { data: owners } = await supabase
            .from('merchant_owners')
            .select('merchant_id, email, role')
            .in('merchant_id', ids);

        console.log(' Owners Mapping:');
        merchants.forEach(m => {
            const mOwners = owners?.filter(o => o.merchant_id === m.id);
            console.log(`\n🏠 ${m.name}:`);
            if (mOwners?.length) {
                mOwners.forEach(o => console.log(`   - Email: ${o.email} (Role: ${o.role})`));
            } else {
                console.log('   (No registered owner found)');
            }
        });
    }
}

checkOwners();
