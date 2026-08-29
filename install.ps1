# Teknesyum Core
# Install:  irm https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.4.0/install.ps1 | iex

$ErrorActionPreference = 'Stop'
$repo = 'Teknesyum/Teknesyum-Core'
$cfg = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' }

Write-Host ""
Write-Host "  Teknesyum Core" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Host "  Claude Code not found. Install it first, then run this again." -ForegroundColor Yellow
    return
}

Write-Host "  [1/3] Adding the marketplace..."
claude plugin marketplace add $repo

Write-Host "  [2/3] Installing the plugin..."
claude plugin install teknesyum-core@teknesyum

Write-Host "  [3/3] Setup..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  Node.js missing - install it first: winget install OpenJS.NodeJS.LTS" -ForegroundColor Yellow
    Write-Host "  Then run the setup script from the installed plugin." -ForegroundColor Yellow
    return
}

$setup = $null
foreach ($base in @((Join-Path $cfg 'plugins\cache\teknesyum\teknesyum-core'), (Join-Path $cfg 'plugins\teknesyum\teknesyum-core'))) {
    if (-not (Test-Path $base)) { continue }
    $ver = Get-ChildItem $base -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '^\d+\.\d+\.\d+$' } |
        Sort-Object { [version]$_.Name } |
        Select-Object -Last 1
    if ($null -eq $ver) { continue }
    $cand = Join-Path $ver.FullName 'scripts\setup.js'
    if (Test-Path $cand) { $setup = $cand; break }
}

if ($setup) {
    node $setup
    Write-Host ""
    Write-Host "  Restart Claude Code." -ForegroundColor Cyan
} else {
    Write-Host "  Installed plugin not found on disk." -ForegroundColor Yellow
    Write-Host "  Paste the setup block from the README to Claude instead." -ForegroundColor Yellow
}
