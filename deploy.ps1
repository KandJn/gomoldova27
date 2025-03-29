# Create the functions directory if it doesn't exist
$functionsDir = "supabase/functions/send-approval-email"
New-Item -ItemType Directory -Force -Path $functionsDir

# Copy the function code
Copy-Item -Path "deploy.ts" -Destination "$functionsDir/index.ts" -Force

# Deploy using PowerShell
$projectRef = "iqekgptnsqfkafjjwdon"
$token = "sbp_ca1f6c381c159aefded7d79d853961a19f43a26b"

# ZIP the function directory
Compress-Archive -Path "$functionsDir/*" -DestinationPath "function.zip" -Force

# Prepare the request
$uri = "https://api.supabase.com/v1/projects/$projectRef/functions"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# First, create or update the function config
$configBody = @{
    "name" = "send-approval-email"
    "verify_jwt" = $true
} | ConvertTo-Json

try {
    Write-Host "Creating/updating function configuration..."
    $configResponse = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $configBody
    Write-Host "Function configuration updated: $configResponse"

    # Now deploy the function code
    $deployUri = "https://api.supabase.com/v1/projects/$projectRef/functions/send-approval-email/deploy"
    $form = @{
        file = Get-Item -Path "function.zip"
    }
    
    Write-Host "Deploying function code..."
    $deployResponse = Invoke-RestMethod -Uri $deployUri -Method Post -Headers $headers -Form $form
    Write-Host "Deployment successful: $deployResponse"
} catch {
    Write-Host "Operation failed: $_"
    Write-Host "Response: $($_.ErrorDetails.Message)"
} 