# PowerShell smoke test for cancel flow API
# Usage: .\smoke.ps1 -BaseUrl "http://localhost:3000"

param(
  [string]$BaseUrl = "http://localhost:3000"
)

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "Fetching CSRF cookie..."
$csrfResp = Invoke-WebRequest -Uri "$BaseUrl/api/csrf" -WebSession $session
$csrfCookie = ($session.Cookies.GetCookies($BaseUrl) | Where-Object { $_.Name -eq "csrf" }).Value
Write-Host "CSRF token: $csrfCookie"

function Print-Json($resp) {
  try {
    $json = $resp.Content | ConvertFrom-Json
    $json | ConvertTo-Json -Depth 5
  } catch {
    Write-Host $resp.Content
  }
}

Write-Host "POST /api/cancel/start..."
$startBody = @{ userId = "1"; reason = "test" } | ConvertTo-Json
$startResp = Invoke-WebRequest -Uri "$BaseUrl/api/cancel/start" -Method POST -WebSession $session -Headers @{ "Content-Type" = "application/json"; "X-CSRF-Token" = $csrfCookie } -Body $startBody
Print-Json $startResp

Write-Host "GET /api/cancel/variant?reason=too_expensive..."
$variantResp = Invoke-WebRequest -Uri "$BaseUrl/api/cancel/variant?reason=too_expensive" -Method GET -WebSession $session
Print-Json $variantResp

Write-Host "POST /api/cancel/apply-offer..."
$offerBody = @{ variant = "B"; reason = "Too expensive" } | ConvertTo-Json
$offerResp = Invoke-WebRequest -Uri "$BaseUrl/api/cancel/apply-offer" -Method POST -WebSession $session -Headers @{ "Content-Type" = "application/json"; "X-CSRF-Token" = $csrfCookie } -Body $offerBody
Print-Json $offerResp

Write-Host "POST /api/subscription/cancel..."
$cancelResp = Invoke-WebRequest -Uri "$BaseUrl/api/subscription/cancel" -Method POST -WebSession $session -Headers @{ "Content-Type" = "application/json"; "X-CSRF-Token" = $csrfCookie }
Print-Json $cancelResp
