$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$home2 = $env:USERPROFILE
$cfg = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $home2 '.claude' }
Set-Location $root
Write-Output "== eklenti"
claude plugin marketplace update teknesyum
claude plugin update teknesyum-core@teknesyum
$cache = Join-Path $cfg 'plugins\cache\teknesyum\teknesyum-core'
$dirs = Get-ChildItem $cache -Directory | Sort-Object { [version]$_.Name }
$ver = $dirs | Select-Object -Last 1
$dirs | Where-Object { $_.Name -ne $ver.Name } | ForEach-Object { Remove-Item $_.FullName -Recurse -Force }
$plugin = $ver.FullName
Write-Output "surum $($ver.Name)"
node (Join-Path $plugin 'scripts\setup.js') --apply
Write-Output "== ozel depo"
$ozel = Join-Path $cfg 'teknesyum-private'
if (-not (Test-Path (Join-Path $ozel '.git'))) {
  git clone -q --filter=blob:none https://github.com/Teknesyum/Teknesyum-Private.git $ozel
}
git -C $ozel pull -q --ff-only
$devir = Join-Path $ozel 'teknesyum-core\devir-2026-09-09'
foreach ($f in 'CLAUDE.md', 'RULES.md', 'RTK.md') { Copy-Item (Join-Path $devir "ev\$f") (Join-Path $cfg $f) -Force }
$slug = ($root -replace '[^A-Za-z0-9]', '-')
$mem = Join-Path $cfg "projects\$slug\memory"
New-Item -ItemType Directory -Force $mem | Out-Null
Copy-Item (Join-Path $devir 'memory\*') $mem -Force
Write-Output "memory -> $mem"
New-Item -ItemType Directory -Force (Join-Path $cfg 'teknesyum') | Out-Null
Copy-Item (Join-Path $devir 'teknesyum\*') (Join-Path $cfg 'teknesyum') -Force
New-Item -ItemType Directory -Force (Join-Path $root '.claude') | Out-Null
Copy-Item (Join-Path $devir 'settings.local.json') (Join-Path $root '.claude\settings.local.json') -Force
New-Item -ItemType Directory -Force (Join-Path $root 'logs\openlogs') | Out-Null
Copy-Item (Join-Path $devir 'logs-openlogs\*') (Join-Path $root 'logs\openlogs') -Force
Write-Output "== raflar ve ajans"
node (Join-Path $plugin 'scripts\kutuphane.js') fetch all
node (Join-Path $plugin 'scripts\agency.js') fetch
Write-Output "== doktor"
node (Join-Path $plugin 'scripts\map.js') .
node (Join-Path $plugin 'scripts\doctor.js')
Write-Output "devir tamam - Claude Code yeniden baslatilinca kancalar $($ver.Name) olur"
