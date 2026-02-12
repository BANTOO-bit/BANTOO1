import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ============================================================
// Validation: Ensure Supabase credentials are properly set
// ============================================================
const isPlaceholder = (val) =>
    !val || val.includes('your-project') || val.includes('your-anon')

if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
    console.error(
        '🔴 [BANTOO] Supabase credentials belum dikonfigurasi!\n' +
        '   1. Buka file .env di root project\n' +
        '   2. Isi VITE_SUPABASE_URL dari Supabase Dashboard → Settings → API → Project URL\n' +
        '   3. Isi VITE_SUPABASE_ANON_KEY dari Supabase Dashboard → Settings → API → anon/public key\n' +
        '   4. Restart dev server (npm run dev)\n' +
        '   📖 Panduan lengkap: docs/supabase_setup_guide.md'
    )
}

// Create client with Realtime enabled for order subscriptions
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    },
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

