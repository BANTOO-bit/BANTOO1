const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env'));

const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function run() {
  const phone = '08333333333';
  const phoneCandidates = [phone, `0${phone}`, `62${phone}`, `+62${phone}`, '8333333333'];
  
  let userEmail = null;
  for (const candidate of phoneCandidates) {
      const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone', candidate)
          .maybeSingle();
      if (!error && data?.email) {
          userEmail = data.email;
          break;
      }
  }

  if (!userEmail) {
      console.error('Could not find email for phone:', phone);
      return;
  }
  
  console.log('Found email:', userEmail);

  // Login as Customer
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: 'Indonesia1'
  });
  
  if (authError || !authData.session) {
    console.error('Login failed:', authError);
    return;
  }
  
  console.log('Logged in as customer:', authData.user.id);

  // Get merchant menu item
  const merchantId = 'c058268c-5861-4559-b70d-b87d97ed30ae';
  const { data: items } = await supabase.from('menu_items').select('id, name, price').eq('merchant_id', merchantId).limit(1);
  
  if (!items || items.length === 0) {
    console.error('No items found for merchant');
    return;
  }
  
  const item = items[0];
  console.log('Found item:', item.name);

  // Create order
  const { data: orderData, error: orderError } = await supabase.rpc('create_order', {
      p_merchant_id: merchantId,
      p_items: [{ menu_item_id: item.id, quantity: 1, notes: 'E2E Testing Order' }],
      p_delivery_address: 'Jl. Test Customer No. 123',
      p_delivery_detail: 'Testing Warung acceptance',
      p_customer_name: 'Customer E2E',
      p_customer_phone: '08333333333',
      p_customer_lat: -6.200000,
      p_customer_lng: 106.816666,
      p_payment_method: 'cod',
      p_delivery_fee: null,
      p_application_fee: 500
  });

  if (orderError) {
    console.error('Failed to create order:', orderError);
  } else {
    console.log('Order created successfully:', orderData);
  }
}

run();
