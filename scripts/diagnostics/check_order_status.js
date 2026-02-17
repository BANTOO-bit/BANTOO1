
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDrivers() {
    console.log('Checking available drivers...');

    // 1. Get drivers
    const { data: drivers, error: driverError } = await supabase
        .from('drivers')
        .select(`
            id,
            user_id,
            profiles:profiles!drivers_user_id_fkey (
                full_name,
                email
            )
        `)
        .limit(5);

    if (driverError) {
        console.error('Error fetching drivers:', driverError);
        return;
    }

    if (!drivers || drivers.length === 0) {
        console.log('No drivers found.');
        return;
    }

    drivers.forEach(d => {
        console.log(`- Driver ID: ${d.id}`);
        console.log(`  Name: ${d.profiles?.full_name}`);
        console.log(`  Email: ${d.profiles?.email}`);
        console.log(`  User ID: ${d.user_id}`);
        console.log('---');
    });
}

checkDrivers();
