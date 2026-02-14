
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking orders table schema...');

    // We can't easily desc table via client, but we can try to select 'prep_time' from a dummy row
    // or just assume if it fails it's missing.
    // Better: Try to select one row with that column.

    const { data, error } = await supabase
        .from('orders')
        .select('prep_time')
        .limit(1);

    if (error) {
        console.error('Error selecting prep_time:', error.message);
    } else {
        console.log('Column prep_time exists!');
    }
}

checkSchema();
