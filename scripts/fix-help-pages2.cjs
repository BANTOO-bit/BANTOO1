const fs = require('fs')
const path = require('path')

const helpDir = path.join(__dirname, '..', 'src', 'pages', 'user', 'help')

const files = [
    'payment/RefundProcedurePage.jsx',
    'payment/TopUpGuidePage.jsx',
    'payment/TransactionFailedPage.jsx',
    'payment/VoucherPromoHelpPage.jsx'
]

let fixed = 0

for (const relPath of files) {
    const filePath = path.join(helpDir, relPath)
    if (!fs.existsSync(filePath)) continue

    let content = fs.readFileSync(filePath, 'utf-8')

    // Remove the leftover outer div wrapper pattern
    const pattern = /\<div className="bg-background-light[^"]*"\>\s*/g
    if (pattern.test(content)) {
        content = content.replace(/\<div className="bg-background-light[^"]*"\>\s*/g, '')
        fs.writeFileSync(filePath, content, 'utf-8')
        console.log(`FIXED: ${relPath}`)
        fixed++
    } else {
        console.log(`SKIP (no match): ${relPath}`)
    }
}

console.log(`\nFixed: ${fixed}`)
