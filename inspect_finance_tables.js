
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectFinanceTables() {
    console.log('Inspecting finance tables...')

    // Check withdrawals
    const { data: withdrawals, error: wError } = await supabase
        .from('withdrawals')
        .select('*')
        .limit(1)

    if (withdrawals && withdrawals.length > 0) {
        console.log('Withdrawals columns:', Object.keys(withdrawals[0]))
    } else if (withdrawals) {
        console.log('Withdrawals table seems empty, but accessible.')
    } else {
        console.log('Error accessing withdrawals:', wError.message)
    }

    // Check transactions
    const { data: transactions, error: tError } = await supabase
        .from('transactions')
        .select('*')
        .limit(1)

    if (transactions && transactions.length > 0) {
        console.log('Transactions columns:', Object.keys(transactions[0]))
    } else if (transactions) {
        console.log('Transactions table seems empty, but accessible.')
    } else {
        console.log('Error accessing transactions:', tError.message)
    }
}

inspectFinanceTables()
