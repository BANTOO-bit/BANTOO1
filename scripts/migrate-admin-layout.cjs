/**
 * Script to migrate admin pages to use AdminLayout wrapper.
 * Run with: node scripts/migrate-admin-layout.js
 */
const fs = require('fs');
const path = require('path');

const adminPagesDir = path.join(__dirname, '..', 'src', 'pages', 'admin');

// Pages to skip (already migrated or special)
const SKIP = ['AdminDashboard.jsx', 'AdminLoginPage.jsx'];

// Read all jsx files in admin pages
const files = fs.readdirSync(adminPagesDir).filter(f => f.endsWith('.jsx') && !SKIP.includes(f));

let migratedCount = 0;
let skippedCount = 0;

files.forEach(filename => {
    const filepath = path.join(adminPagesDir, filename);
    let content = fs.readFileSync(filepath, 'utf-8');

    // Check if already migrated
    if (content.includes('AdminLayout')) {
        console.log(`SKIP (already migrated): ${filename}`);
        skippedCount++;
        return;
    }

    // Check if uses AdminSidebar (should be migrated)
    if (!content.includes('AdminSidebar')) {
        console.log(`SKIP (no sidebar): ${filename}`);
        skippedCount++;
        return;
    }

    // 1. Replace imports
    content = content.replace(
        /import AdminSidebar from ['"]\.\.\/\.\.\/components\/admin\/AdminSidebar['"]\s*\r?\n/,
        ''
    );
    content = content.replace(
        /import AdminHeader from ['"]\.\.\/\.\.\/components\/admin\/AdminHeader['"]\s*\r?\n/,
        "import AdminLayout from '../../components/admin/AdminLayout'\n"
    );

    // 2. Remove isSidebarOpen state (only if it's the sidebar-specific one)
    content = content.replace(
        /\s*const \[isSidebarOpen, setIsSidebarOpen\] = useState\(false\)\s*\r?\n/,
        '\n'
    );

    // 3. Extract the title from AdminHeader
    const titleMatch = content.match(/title=["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : 'Admin';

    // Extract showBack prop
    const hasShowBack = content.includes('showBack={true}') || content.includes('showBack=');

    // 4. Replace the layout boilerplate
    // Pattern: <div className="flex min-h-screen..."> <AdminSidebar.../> <main...> <AdminHeader.../> <div className="flex-1 p-..."> <div className="max-w-...">

    // Replace opening wrapper
    const outerDivPattern = /\s*<div className="flex min-h-screen[^"]*">\s*\r?\n\s*<AdminSidebar[\s\S]*?\/>\s*\r?\n\s*\r?\n\s*<main[^>]*>\s*\r?\n\s*<AdminHeader[\s\S]*?\/>\s*\r?\n\s*\r?\n\s*<div className="flex-1 p-[^"]*">\s*\r?\n\s*<div className="max-w-[^"]*">/;

    const showBackProp = hasShowBack ? ' showBack' : '';
    const replacement = `\n        <AdminLayout title="${title}"${showBackProp}>`;

    if (outerDivPattern.test(content)) {
        content = content.replace(outerDivPattern, replacement);
    } else {
        // Try a more lenient pattern
        // Replace from outer div to after max-w wrapper opening
        content = content.replace(
            /<div className="flex min-h-screen[\s\S]*?<div className="(?:max-w-[^"]*|flex flex-col gap-\d+[^"]*)">/,
            `<AdminLayout title="${title}"${showBackProp}>`
        );
    }

    // 5. Replace closing tags (remove the 4 extra closing divs/main)
    // Find the last content and replace closing </div></div></main></div>
    // We need to remove: </div> </div> </main> </div> and replace with </AdminLayout>
    content = content.replace(
        /\s*<\/div>\s*\r?\n\s*<\/div>\s*\r?\n\s*<\/main>\s*\r?\n\s*<\/div>/,
        '\n        </AdminLayout>'
    );

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`MIGRATED: ${filename} (title: "${title}")`);
    migratedCount++;
});

console.log(`\nDone! Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
