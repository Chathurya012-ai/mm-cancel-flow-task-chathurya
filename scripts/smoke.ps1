
# PowerShell smoke test for cancel flow API
# Usage: .\smoke.ps1

$BaseUrl = "http://localhost:3001"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function ConvertTo-JsonSafe {
  param($resp)
  try {
    return $resp.Content | ConvertFrom-Json
  } catch {
    Write-Host "[ERROR] Failed to parse JSON: $($_.Exception.Message)"
    Write-Host "Raw body: $($resp.Content)"
    return $null
  }
}

function Show-Step {
  param($name, $resp)
  Write-Host "--- $name ---"
  Write-Host "Status: $($resp.StatusCode)"
  $json = ConvertTo-JsonSafe $resp
  if ($null -eq $json) { exit 1 }
  $json | ConvertTo-Json -Depth 5
}

# Step 1: CSRF
Write-Host "Fetching CSRF cookie..."
$csrfResp = Invoke-WebRequest -Uri "$BaseUrl/api/csrf" -WebSession $session
$null = Show-Step "CSRF" $csrfResp
if ($csrfResp.StatusCode -ne 200) { Write-Host "[ERROR] CSRF request failed"; exit 1 }
$csrfCookie = ($session.Cookies.GetCookies($BaseUrl) | Where-Object { $_.Name -eq "csrf" }).Value
if (-not $csrfCookie) { Write-Host "[ERROR] No CSRF cookie found"; exit 1 }
Write-Host "CSRF token: $csrfCookie"

# Step 2: Start
Write-Host "POST /api/cancel/start..."
$startBody = @{ userId = "1"; reason = "test" } | ConvertTo-Json
$startResp = Invoke-WebRequest -Uri "$BaseUrl/api/cancel/start" -Method POST -WebSession $session -Headers @{ "Content-Type" = "application/json"; "X-CSRF-Token" = $csrfCookie } -Body $startBody
Show-Step "Start" $startResp

# Step 3: Variant
Write-Host "GET /api/cancel/variant?reason=too_expensive..."
$variantResp = Invoke-WebRequest -Uri "$BaseUrl/api/cancel/variant?reason=too_expensive" -Method GET -WebSession $session
Show-Step "Variant" $variantResp

# Step 4: Apply Offer
Write-Host "POST /api/cancel/apply-offer..."
$offerBody = @{ variant = "B"; reason = "Too expensive"; price = 19 } | ConvertTo-Json
$offerResp = Invoke-WebRequest -Uri "$BaseUrl/api/cancel/apply-offer" -Method POST -WebSession $session -Headers @{ "Content-Type" = "application/json"; "X-CSRF-Token" = $csrfCookie } -Body $offerBody
Show-Step "Apply Offer" $offerResp

# Step 5: Cancel
Write-Host "POST /api/subscription/cancel..."
$cancelResp = Invoke-WebRequest -Uri "$BaseUrl/api/subscription/cancel" -Method POST -WebSession $session -Headers @{ "Content-Type" = "application/json"; "X-CSRF-Token" = $csrfCookie }
Show-Step "Cancel" $cancelResp
