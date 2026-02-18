/**
 * Convert an array of objects to a CSV string and trigger download.
 * @param {Array<Object>} data - Array of row objects
 * @param {Array<{key: string, label: string}>} columns - Column definitions
 * @param {string} filename - Output filename (without .csv)
 */
export function exportToCSV(data, columns, filename = 'export') {
    if (!data || data.length === 0) return

    // BOM for UTF-8 (Excel compatibility)
    const BOM = '\uFEFF'

    // Header row
    const header = columns.map(c => `"${c.label}"`).join(',')

    // Data rows
    const rows = data.map(row => {
        return columns.map(col => {
            let val = col.key.split('.').reduce((obj, key) => obj?.[key], row)
            if (val === null || val === undefined) val = ''
            if (typeof val === 'number') return val
            // Escape quotes in strings
            val = String(val).replace(/"/g, '""')
            return `"${val}"`
        }).join(',')
    })

    const csv = BOM + header + '\n' + rows.join('\n')

    // Create download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
