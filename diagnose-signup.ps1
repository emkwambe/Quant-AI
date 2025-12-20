# ============================================
# SIGNUP ERROR DIAGNOSTIC SCRIPT
# Error: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SIGNUP ERROR DIAGNOSTICS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------
# STEP 1: Check Project Structure
# ------------------------------------------
Write-Host "[1/6] CHECKING PROJECT STRUCTURE..." -ForegroundColor Yellow

# Check if we're in a Next.js project
if (Test-Path "package.json") {
    Write-Host "  ✓ package.json found" -ForegroundColor Green
    
    # Check for Next.js
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    if ($pkg.dependencies."next" -or $pkg.devDependencies."next") {
        Write-Host "  ✓ Next.js project detected" -ForegroundColor Green
    }
    
    # Check for Supabase
    if ($pkg.dependencies."@supabase/supabase-js" -or $pkg.dependencies."@supabase/ssr") {
        Write-Host "  ✓ Supabase client found" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Supabase client NOT found in dependencies" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ No package.json - run this from your project root!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ------------------------------------------
# STEP 2: Check Environment Variables
# ------------------------------------------
Write-Host "[2/6] CHECKING ENVIRONMENT FILES..." -ForegroundColor Yellow

$envFiles = @(".env", ".env.local", ".env.development", ".env.development.local")
$foundEnv = $false

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "  ✓ Found: $envFile" -ForegroundColor Green
        $foundEnv = $true
        
        # Check for required Supabase vars (without exposing values)
        $content = Get-Content $envFile -Raw
        
        if ($content -match "NEXT_PUBLIC_SUPABASE_URL") {
            Write-Host "    ✓ NEXT_PUBLIC_SUPABASE_URL is set" -ForegroundColor Green
        } else {
            Write-Host "    ✗ NEXT_PUBLIC_SUPABASE_URL is MISSING!" -ForegroundColor Red
        }
        
        if ($content -match "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
            Write-Host "    ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is set" -ForegroundColor Green
        } else {
            Write-Host "    ✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is MISSING!" -ForegroundColor Red
        }
    }
}

if (-not $foundEnv) {
    Write-Host "  ✗ No .env file found! Create one with Supabase credentials" -ForegroundColor Red
}

Write-Host ""

# ------------------------------------------
# STEP 3: Find Signup/Register API Routes
# ------------------------------------------
Write-Host "[3/6] SEARCHING FOR SIGNUP API ROUTES..." -ForegroundColor Yellow

# Common locations for signup API
$apiPaths = @(
    "src/app/api/auth/signup/route.ts",
    "src/app/api/auth/signup/route.js",
    "src/app/api/auth/register/route.ts",
    "src/app/api/auth/register/route.js",
    "src/app/api/signup/route.ts",
    "src/app/api/signup/route.js",
    "src/app/api/register/route.ts",
    "src/app/api/register/route.js",
    "app/api/auth/signup/route.ts",
    "app/api/auth/signup/route.js",
    "app/api/auth/register/route.ts",
    "app/api/auth/register/route.js",
    "pages/api/auth/signup.ts",
    "pages/api/auth/signup.js",
    "pages/api/auth/register.ts",
    "pages/api/auth/register.js"
)

$foundApi = $false
foreach ($path in $apiPaths) {
    if (Test-Path $path) {
        Write-Host "  ✓ Found API route: $path" -ForegroundColor Green
        $foundApi = $true
        
        # Show the file content
        Write-Host "  --- Content Preview ---" -ForegroundColor Cyan
        Get-Content $path | Select-Object -First 50
        Write-Host "  --- End Preview ---" -ForegroundColor Cyan
    }
}

if (-not $foundApi) {
    Write-Host "  ! No dedicated signup API route found" -ForegroundColor Yellow
    Write-Host "  → Checking if using direct Supabase client auth..." -ForegroundColor Yellow
}

Write-Host ""

# ------------------------------------------
# STEP 4: Find Signup Page/Component
# ------------------------------------------
Write-Host "[4/6] SEARCHING FOR SIGNUP PAGE..." -ForegroundColor Yellow

# Search for signup/register pages
$signupPages = Get-ChildItem -Path . -Recurse -Include "*.tsx","*.jsx","*.ts","*.js" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules" } |
    Select-String -Pattern "signUp|signup|register|createAccount|Create Account" -List |
    Select-Object -First 10

if ($signupPages) {
    Write-Host "  Found signup-related files:" -ForegroundColor Green
    foreach ($file in $signupPages) {
        Write-Host "    → $($file.Path)" -ForegroundColor White
    }
} else {
    Write-Host "  ✗ No signup pages found" -ForegroundColor Red
}

Write-Host ""

# ------------------------------------------
# STEP 5: Check for Common Issues in Code
# ------------------------------------------
Write-Host "[5/6] SCANNING FOR COMMON ISSUES..." -ForegroundColor Yellow

# Look for fetch calls without proper error handling
$fetchIssues = Get-ChildItem -Path . -Recurse -Include "*.tsx","*.jsx","*.ts","*.js" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules" } |
    Select-String -Pattern "\.json\(\)" -List

if ($fetchIssues) {
    Write-Host "  Files with .json() calls (potential issue locations):" -ForegroundColor Yellow
    foreach ($file in $fetchIssues) {
        Write-Host "    → $($file.Path):$($file.LineNumber)" -ForegroundColor White
    }
}

# Check for response.ok checks
$responseChecks = Get-ChildItem -Path . -Recurse -Include "*.tsx","*.jsx","*.ts","*.js" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules" } |
    Select-String -Pattern "response\.ok|res\.ok" -List

if ($responseChecks.Count -eq 0) {
    Write-Host "  ⚠ WARNING: No 'response.ok' checks found - API errors may not be handled!" -ForegroundColor Red
}

Write-Host ""

# ------------------------------------------
# STEP 6: Recommendations
# ------------------------------------------
Write-Host "[6/6] DIAGNOSTIC COMPLETE" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LIKELY CAUSES & FIXES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. API ROUTE RETURNING EMPTY RESPONSE" -ForegroundColor White
Write-Host "   Fix: Ensure your API route returns NextResponse.json({...})" -ForegroundColor Gray
Write-Host ""
Write-Host "2. SUPABASE AUTH ERROR NOT BEING RETURNED" -ForegroundColor White
Write-Host "   Fix: Check Supabase Dashboard -> Auth Logs for errors" -ForegroundColor Gray
Write-Host ""
Write-Host "3. MISSING ERROR HANDLING IN FETCH" -ForegroundColor White
Write-Host "   Fix: Add 'if (!response.ok)' check before .json()" -ForegroundColor Gray
Write-Host ""
Write-Host "4. SUPABASE EMAIL NOT CONFIGURED" -ForegroundColor White
Write-Host "   Fix: Supabase Dashboard -> Auth -> Email Templates" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Share your signup page code (the form component)" -ForegroundColor Yellow
Write-Host "2. Share your API route code (if you have one)" -ForegroundColor Yellow
Write-Host "3. Check browser Network tab -> find the failing request" -ForegroundColor Yellow
Write-Host "4. Check Supabase Dashboard -> Logs -> Auth logs" -ForegroundColor Yellow
Write-Host ""
