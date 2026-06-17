Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git Push to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "[1/3] Adding changes..." -ForegroundColor Yellow
git add -A

Write-Host "[2/3] Committing..." -ForegroundColor Yellow
$commit_msg = Read-Host "Enter commit message (or press Enter for auto)"
if ([string]::IsNullOrWhiteSpace($commit_msg)) {
    $commit_msg = "auto: update files"
}
git commit -m $commit_msg

Write-Host ""
Write-Host "[3/3] Pushing to GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Push successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ Push failed. Please try again." -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
