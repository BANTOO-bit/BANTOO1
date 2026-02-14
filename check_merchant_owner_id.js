
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

if (fs.existsSync('.env')) dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkMerchantOwnerId() {
    const { data: merchants, error } = await supabase
        .from('merchants')
        .select('id, name, owner_id')
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Merchants Table Data:');
    merchants.forEach(m => {
        console.log(`- ${m.name}: owner_id = ${m.owner_id || 'NULL'}`);
    });
}

checkMerchantOwnerId();
