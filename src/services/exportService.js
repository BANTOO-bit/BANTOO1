import { supabase } from './supabaseClient'

/**
 * Export Service — Generate CSV files from data for download.
 * No external library needed — uses pure JS CSV generation.
 */
export const exportService = {
    /**
     * Convert array of objects to CSV string
     * @param {Array} data
     * @param {Array<{ key, label }>} columns
     * @returns {string}
     */
    toCSV(data, columns) {
        if (!data || data.length === 0) return ''

        // Header row
        const header = columns.map(c => `"${c.label}"`).join(',')

        // Data rows
        const rows = data.map(row =>
            columns.map(col => {
                let val = row[col.key]
                if (val === null || val === undefined) val = ''
                if (typeof val === 'object') val = JSON.stringify(val)
                // Escape quotes
                val = String(val).replace(/"/g, '""')
                return `"${val}"`
            }).join(',')
        )

        return [header, ...rows].join('\n')
    },

    /**
     * Download CSV string as file
     * @param {string} csvContent
     * @param {string} filename
     */
    downloadCSV(csvContent, filename) {
        const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    },

    /**
     * Export orders data to CSV
     * @param {Object} filters - { startDate, endDate, status }
     */
    async exportOrders(filters = {}) {
        let query = supabase
            .from('orders')
            .select(`
                id, status, total_amount, delivery_fee, service_fee,
                payment_method, payment_status,
                customer_name, customer_phone,
                delivery_address,
                created_at, delivered_at,
                merchant:merchants(name),
                driver:profiles!driver_id(full_name)
            `)
            .order('created_at', { ascending: false })

        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate)
        }
        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate)
        }
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status)
        }

        const { data, error } = await query
        if (error) throw error

        const columns = [
            { key: 'id', label: 'Order ID' },
            { key: 'created_at', label: 'Tanggal' },
            { key: 'customer_name', label: 'Pelanggan' },
            { key: 'customer_phone', label: 'Telepon' },
            { key: '_merchant_name', label: 'Warung' },
            { key: '_driver_name', label: 'Driver' },
            { key: 'status', label: 'Status' },
            { key: 'total_amount', label: 'Total' },
            { key: 'delivery_fee', label: 'Ongkir' },
            { key: 'service_fee', label: 'Fee Admin' },
            { key: 'payment_method', label: 'Metode Bayar' },
            { key: 'payment_status', label: 'Status Bayar' },
            { key: 'delivery_address', label: 'Alamat' }
        ]

        // Flatten nested objects
        const flatData = (data || []).map(row => ({
            ...row,
            _merchant_name: row.merchant?.name || '-',
            _driver_name: row.driver?.full_name || '-',
            created_at: new Date(row.created_at).toLocaleString('id-ID')
        }))

        const csv = this.toCSV(flatData, columns)
        this.downloadCSV(csv, 'laporan_pesanan')
        return flatData.length
    },

    /**
     * Export withdrawals data to CSV
     * @param {Object} filters - { startDate, endDate, status }
     */
    async exportWithdrawals(filters = {}) {
        let query = supabase
            .from('withdrawals')
            .select(`
                id, amount, bank_name, bank_account_name, bank_account_number,
                status, rejection_reason, created_at, updated_at,
                user:user_id(full_name, phone, role)
            `)
            .order('created_at', { ascending: false })

        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate)
        }
        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate)
        }
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status)
        }

        const { data, error } = await query
        if (error) throw error

        const columns = [
            { key: 'id', label: 'ID' },
            { key: 'created_at', label: 'Tanggal Request' },
            { key: '_user_name', label: 'Nama' },
            { key: '_user_phone', label: 'Telepon' },
            { key: '_user_role', label: 'Role' },
            { key: 'amount', label: 'Jumlah' },
            { key: 'bank_name', label: 'Bank' },
            { key: 'bank_account_name', label: 'Atas Nama' },
            { key: 'bank_account_number', label: 'No Rekening' },
            { key: 'status', label: 'Status' },
            { key: 'rejection_reason', label: 'Alasan Tolak' },
            { key: 'updated_at', label: 'Tanggal Update' }
        ]

        const flatData = (data || []).map(row => ({
            ...row,
            _user_name: row.user?.full_name || '-',
            _user_phone: row.user?.phone || '-',
            _user_role: row.user?.role || '-',
            created_at: new Date(row.created_at).toLocaleString('id-ID'),
            updated_at: row.updated_at ? new Date(row.updated_at).toLocaleString('id-ID') : '-'
        }))

        const csv = this.toCSV(flatData, columns)
        this.downloadCSV(csv, 'laporan_penarikan')
        return flatData.length
    },

    /**
     * Export revenue report to CSV
     * @param {Object} filters - { startDate, endDate }
     */
    async exportRevenue(filters = {}) {
        let query = supabase
            .from('orders')
            .select('id, total_amount, delivery_fee, service_fee, payment_method, status, created_at, merchant:merchants(name)')
            .in('status', ['completed', 'delivered'])
            .order('created_at', { ascending: false })

        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate)
        }
        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate)
        }

        const { data, error } = await query
        if (error) throw error

        const columns = [
            { key: 'created_at', label: 'Tanggal' },
            { key: '_merchant_name', label: 'Warung' },
            { key: 'total_amount', label: 'Total Pesanan' },
            { key: 'delivery_fee', label: 'Ongkir' },
            { key: 'service_fee', label: 'Fee Platform' },
            { key: 'payment_method', label: 'Metode Bayar' }
        ]

        const flatData = (data || []).map(row => ({
            ...row,
            _merchant_name: row.merchant?.name || '-',
            created_at: new Date(row.created_at).toLocaleString('id-ID')
        }))

        const csv = this.toCSV(flatData, columns)
        this.downloadCSV(csv, 'laporan_pendapatan')
        return flatData.length
    }
}

export default exportService
