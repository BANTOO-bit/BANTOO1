/**
 * Fix script: Wrap content-only components in fragment <> ... </> when they have multiple root sections.
 * Also fix indentation after return (.
 */
const fs = require('fs')
const path = require('path')

const helpDir = path.join(__dirname, '..', 'src', 'pages', 'user', 'help')

const files = [
    'account/DeleteAccountPage.jsx',
    'account/AccountSecurityPage.jsx',
    'account/OtpIssuesHelpPage.jsx',
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
    'payment/TopUpGuidePage.jsx',
    'payment/TransactionFailedPage.jsx',
    'payment/RefundProcedurePage.jsx',
    'payment/VoucherPromoHelpPage.jsx',
    'promo/VoucherIssuesPage.jsx',
    'promo/NewUserPromoPage.jsx',
    'promo/RefundedVoucherPage.jsx',
    'promo/WarungPromoPage.jsx',
    'security/PermissionHelpPage.jsx',
]

let fixed = 0

for (const relPath of files) {
    const filePath = path.join(helpDir, relPath)
    if (!fs.existsSync(filePath)) continue

    let content = fs.readFileSync(filePath, 'utf-8')
    const fnMatch = content.match(/function\s+(\w+)\s*\(/)
    if (!fnMatch) continue
    const fnName = fnMatch[1]

    // Count root-level <section> and <article> tags to see if we need fragment
    const rootSections = (content.match(/<section[\s>]/g) || []).length
    const rootArticles = (content.match(/<article[\s>]/g) || []).length
    const needsFragment = (rootSections + rootArticles) > 1

    // Fix: rewrite the return statement properly
    // Current format: "    return (                <section..."
    // Target format:  "    return (\n        <>\n            <section...\n        </>\n    )"

    // Extract everything between "return (" and the final ")"
    const returnMatch = content.match(/return\s*\(([\s\S]*)\)\s*\r?\n\s*\}\s*\r?\n/)
    if (!returnMatch) {
        console.log(`SKIP (no return match): ${relPath}`)
        continue
    }

    let innerContent = returnMatch[1].trim()

    // Re-indent: reduce all indentation by 8 spaces (from deeply nested original)
    const lines = innerContent.split(/\r?\n/)
    const reindented = lines.map(line => {
        // Remove up to 16 leading spaces to flatten
        return line.replace(/^(\s{16})/, '        ').replace(/^(\s{12})/, '    ')
    }).join('\n')

    let newReturn
    if (needsFragment) {
        newReturn = `    return (\n        <>\n${reindented}\n        </>\n    )`
    } else {
        newReturn = `    return (\n${reindented}\n    )`
    }

    const newContent = `function ${fnName}() {\n${newReturn}\n}\n\nexport default ${fnName}\n`

    fs.writeFileSync(filePath, newContent, 'utf-8')
    console.log(`FIXED: ${relPath} (fragment: ${needsFragment})`)
    fixed++
}

console.log(`\nFixed: ${fixed}`)
