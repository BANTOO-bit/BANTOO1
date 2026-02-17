# Fix relative imports after moving page files one level deeper
# Files moved from pages/X/ to pages/X/sub/ need ../../ → ../../../

$userDirs = @(
    'src\pages\user\home',
    'src\pages\user\browse',
    'src\pages\user\order',
    'src\pages\user\profile',
    'src\pages\user\address',
    'src\pages\user\notifications'
)

$helpDirs = @(
    'src\pages\user\help',
    'src\pages\user\help\order',
    'src\pages\user\help\payment',
    'src\pages\user\help\promo',
    'src\pages\user\help\account',
    'src\pages\user\help\security'
)

$merchantDirs = @(
    'src\pages\merchant\dashboard',
    'src\pages\merchant\menu',
    'src\pages\merchant\orders',
    'src\pages\merchant\profile',
    'src\pages\merchant\financial',
    'src\pages\merchant\reviews'
)

$adminDirs = @(
    'src\pages\admin\dashboard',
    'src\pages\admin\orders',
    'src\pages\admin\merchants',
    'src\pages\admin\drivers',
    'src\pages\admin\users',
    'src\pages\admin\financial',
    'src\pages\admin\promos',
    'src\pages\admin\issues',
    'src\pages\admin\settings'
)

# Fix user pages (moved 1 level deeper: ../../ → ../../../)
foreach ($dir in $userDirs) {
    if (Test-Path $dir) {
        Get-ChildItem $dir -Filter *.jsx -File | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            $original = $content
            $content = $content -replace "from '../../services/", "from '../../../services/"
            $content = $content -replace "from '../../context/", "from '../../../context/"
            $content = $content -replace "from '../../components/", "from '../../../components/"
            $content = $content -replace "from '../../hooks/", "from '../../../hooks/"
            $content = $content -replace "from '../../utils/", "from '../../../utils/"
            $content = $content -replace "from '../../data/", "from '../../../data/"
            $content = $content -replace "from '../../assets/", "from '../../../assets/"
            if ($content -ne $original) {
                Set-Content $_.FullName $content -NoNewline
                Write-Output "Fixed: $($_.Name)"
            }
        }
    }
}

# Fix help main pages (at help/ level: ../../ → ../../../)
if (Test-Path 'src\pages\user\help') {
    Get-ChildItem 'src\pages\user\help' -Filter *.jsx -File | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $original = $content
        $content = $content -replace "from '../../services/", "from '../../../services/"
        $content = $content -replace "from '../../context/", "from '../../../context/"
        $content = $content -replace "from '../../components/", "from '../../../components/"
        $content = $content -replace "from '../../hooks/", "from '../../../hooks/"
        $content = $content -replace "from '../../utils/", "from '../../../utils/"
        $content = $content -replace "from '../../data/", "from '../../../data/"
        $content = $content -replace "from '../../assets/", "from '../../../assets/"
        if ($content -ne $original) {
            Set-Content $_.FullName $content -NoNewline
            Write-Output "Fixed: $($_.Name)"
        }
    }
}

# Fix help sub-pages (moved 2 levels deeper: ../../ → ../../../../)
$helpSubDirs = @(
    'src\pages\user\help\order',
    'src\pages\user\help\payment',
    'src\pages\user\help\promo',
    'src\pages\user\help\account',
    'src\pages\user\help\security'
)

foreach ($dir in $helpSubDirs) {
    if (Test-Path $dir) {
        Get-ChildItem $dir -Filter *.jsx -File | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            $original = $content
            $content = $content -replace "from '../../services/", "from '../../../../services/"
            $content = $content -replace "from '../../context/", "from '../../../../context/"
            $content = $content -replace "from '../../components/", "from '../../../../components/"
            $content = $content -replace "from '../../hooks/", "from '../../../../hooks/"
            $content = $content -replace "from '../../utils/", "from '../../../../utils/"
            $content = $content -replace "from '../../data/", "from '../../../../data/"
            $content = $content -replace "from '../../assets/", "from '../../../../assets/"
            if ($content -ne $original) {
                Set-Content $_.FullName $content -NoNewline
                Write-Output "Fixed: $($_.Name)"
            }
        }
    }
}

# Fix merchant pages (moved 1 level deeper: ../../ → ../../../)
foreach ($dir in $merchantDirs) {
    if (Test-Path $dir) {
        Get-ChildItem $dir -Filter *.jsx -File | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            $original = $content
            $content = $content -replace "from '../../services/", "from '../../../services/"
            $content = $content -replace "from '../../context/", "from '../../../context/"
            $content = $content -replace "from '../../components/", "from '../../../components/"
            $content = $content -replace "from '../../hooks/", "from '../../../hooks/"
            $content = $content -replace "from '../../utils/", "from '../../../utils/"
            $content = $content -replace "from '../../data/", "from '../../../data/"
            $content = $content -replace "from '../../assets/", "from '../../../assets/"
            if ($content -ne $original) {
                Set-Content $_.FullName $content -NoNewline
                Write-Output "Fixed: $($_.Name)"
            }
        }
    }
}

# Fix admin pages (moved 1 level deeper: ../../ → ../../../)
foreach ($dir in $adminDirs) {
    if (Test-Path $dir) {
        Get-ChildItem $dir -Filter *.jsx -File | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            $original = $content
            $content = $content -replace "from '../../services/", "from '../../../services/"
            $content = $content -replace "from '../../context/", "from '../../../context/"
            $content = $content -replace "from '../../components/", "from '../../../components/"
            $content = $content -replace "from '../../hooks/", "from '../../../hooks/"
            $content = $content -replace "from '../../utils/", "from '../../../utils/"
            $content = $content -replace "from '../../data/", "from '../../../data/"
            $content = $content -replace "from '../../assets/", "from '../../../assets/"
            if ($content -ne $original) {
                Set-Content $_.FullName $content -NoNewline
                Write-Output "Fixed: $($_.Name)"
            }
        }
    }
}

Write-Output "`nAll imports fixed."
