$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$home2 = $env:USERPROFILE
$cfg = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $home2 '.claude' }
Set-Location $root
Write-Output "== eklenti"
claude plugin marketplace update teknesyum
claude plugin update teknesyum-core@teknesyum
$cache = Join-Path $cfg 'plugins\cache\teknesyum\teknesyum-core'
$ver = Get-ChildItem $cache -Directory | Sort-Object { [version]$_.Name } | Select-Object -Last 1
$plugin = $ver.FullName
Write-Output "surum $($ver.Name)"
node (Join-Path $plugin 'scripts\setup.js') --apply
Write-Output "== agency"
node (Join-Path $plugin 'scripts\agency.js') fetch
Write-Output "== ozel depo"
$ozel = Join-Path $cfg 'teknesyum-ozel'
if (-not (Test-Path (Join-Path $ozel '.git'))) {
  git clone -q --filter=blob:none --sparse https://github.com/Teknesyum/teknesyum-ozel.git $ozel
}
git -C $ozel pull -q --ff-only
git -C $ozel sparse-checkout add teknesyum-base teknesyum-core
$ev = Join-Path $ozel 'teknesyum-base\ev\.claude'
Copy-Item (Join-Path $ev 'CLAUDE.md') (Join-Path $cfg 'CLAUDE.md') -Force
Copy-Item (Join-Path $ev 'RULES.md') (Join-Path $cfg 'RULES.md') -Force
$slug = ($root -replace '[^A-Za-z0-9]', '-')
$mem = Join-Path $cfg "projects\$slug\memory"
New-Item -ItemType Directory -Force $mem | Out-Null
Copy-Item (Join-Path $ozel 'teknesyum-core\memory\*') $mem -Force
Write-Output "memory -> $mem"
$devir = Join-Path $ozel 'teknesyum-core\devir-2026-09-06'
New-Item -ItemType Directory -Force (Join-Path $root '.claude') | Out-Null
Copy-Item (Join-Path $devir 'settings.local.json') (Join-Path $root '.claude\settings.local.json') -Force
Copy-Item (Join-Path $root 'docs\devir.md') (Join-Path $root '.claude\handoff.md') -Force
New-Item -ItemType Directory -Force (Join-Path $root 'logs\openlogs') | Out-Null
Copy-Item (Join-Path $devir 'logs-openlogs\*') (Join-Path $root 'logs\openlogs') -Force
Write-Output "== doktor"
node (Join-Path $plugin 'scripts\map.js') .
node (Join-Path $plugin 'scripts\doctor.js')
Write-Output "devir tamam - Claude Code yeniden baslatilinca kancalar $($ver.Name) olur"
