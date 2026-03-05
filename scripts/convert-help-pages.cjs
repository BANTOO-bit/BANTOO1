/**
 * Script to convert help detail pages to content-only components.
 * Strips: import useNavigate, const navigate, outer div wrapper, header, WhatsApp footer section.
 */
const fs = require('fs')
const path = require('path')

const helpDir = path.join(__dirname, '..', 'src', 'pages', 'user', 'help')

// All detail page files to convert (relative to helpDir)
const files = [
    // account/ (EditProfileHelpPage already done)
    'account/DeleteAccountPage.jsx',
    'account/AccountSecurityPage.jsx',
    'account/OtpIssuesHelpPage.jsx',
    // order/
    'order/OrderNotArrivedPage.jsx',
    'order/OrderIncompletePage.jsx',
    'order/OrderDamagedPage.jsx',
    'order/OrderIncorrectPage.jsx',
    'order/OrderNotReceivedPage.jsx',
    'order/CancelOrderPage.jsx',
    'order/DriverExpensesPage.jsx',
    'order/OrderNotArrivedFAQPage.jsx',
    'order/DriverTrackingHelpPage.jsx',
    'order/ChangePaymentHelpPage.jsx',
    // payment/
    'payment/TopUpGuidePage.jsx',
    'payment/TransactionFailedPage.jsx',
    'payment/RefundProcedurePage.jsx',
    'payment/VoucherPromoHelpPage.jsx',
    // promo/
    'promo/VoucherIssuesPage.jsx',
    'promo/NewUserPromoPage.jsx',
    'promo/RefundedVoucherPage.jsx',
    'promo/WarungPromoPage.jsx',
    // security/
    'security/PermissionHelpPage.jsx',
]

let converted = 0
let skipped = 0

for (const relPath of files) {
    const filePath = path.join(helpDir, relPath)
    if (!fs.existsSync(filePath)) {
        console.log(`SKIP (not found): ${relPath}`)
        skipped++
        continue
    }

    let content = fs.readFileSync(filePath, 'utf-8')
    const originalLength = content.length

    // Extract function name
    const fnMatch = content.match(/function\s+(\w+)\s*\(/)
    if (!fnMatch) {
        console.log(`SKIP (no function found): ${relPath}`)
        skipped++
        continue
    }
    const fnName = fnMatch[1]

    // Strategy: Extract inner content between <main> tags, strip WhatsApp footer
    // Find the content sections between header and WhatsApp footer

    // Remove import line(s)
    content = content.replace(/import\s+\{[^}]*\}\s+from\s+'react-router-dom'\s*\r?\n/g, '')
    content = content.replace(/import\s+\{[^}]*\}\s+from\s+'react'\s*\r?\n/g, '')

    // Remove "const navigate = useNavigate()"
    content = content.replace(/\s*const navigate = useNavigate\(\)\s*\r?\n/g, '\n')

    // Remove outer wrapper: <div className="relative min-h-screen...">
    content = content.replace(/<div className="relative min-h-screen flex flex-col bg-background-light pb-6">\s*\r?\n/, '')

    // Remove header block (everything from <header to </header>)
    content = content.replace(/\s*<header[\s\S]*?<\/header>\s*\r?\n/m, '\n')

    // Remove <main ...> opening tag
    content = content.replace(/\s*<main[^>]*>\s*\r?\n/m, '')

    // Remove WhatsApp support footer section(s)
    // Pattern: <section className="mt-2"> or <section className="mt-4 ..."> containing "Butuh Bantuan Lain?" + WhatsApp SVG
    content = content.replace(/\s*<section\s+className="mt-[0-9][^"]*">\s*\r?\n[\s\S]*?WhatsApp Support[\s\S]*?<\/section>\s*\r?\n/gm, '\n')
    // Also catch: <section className="mt-4 pt-4 border-t border-dashed border-gray-200">
    content = content.replace(/\s*<section\s+className="mt-4 pt-4 border-t[^"]*">\s*\r?\n[\s\S]*?WhatsApp Support[\s\S]*?<\/section>\s*\r?\n/gm, '\n')
    // Also catch: <section className="mt-4 mb-6">
    content = content.replace(/\s*<section\s+className="mt-4 mb-6">\s*\r?\n[\s\S]*?WhatsApp Support[\s\S]*?<\/section>\s*\r?\n/gm, '\n')

    // Remove trailing spacer div + </main> + </div> closings
    content = content.replace(/\s*<div className="h-4"><\/div>\s*\r?\n/gm, '')
    content = content.replace(/\s*<div className="h-4">\s*<\/div>\s*\r?\n/gm, '')

    // Remove </main> closing
    content = content.replace(/\s*<\/main>\r?\n/gm, '')

    // Remove the last closing </div> that was the outer wrapper
    // The component should now end with: content + ) + } + export
    // Remove the extra </div> before the closing )
    content = content.replace(/\s*<\/div>\s*\r?\n(\s*\))/m, '\n$1')

    // Clean up the return statement to not have extra wrappers
    // Find the return ( and make sure it starts with content sections

    // Write back
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`DONE: ${relPath} (${originalLength} -> ${content.length} bytes, -${originalLength - content.length})`)
    converted++
}

console.log(`\nConverted: ${converted}, Skipped: ${skipped}`)
