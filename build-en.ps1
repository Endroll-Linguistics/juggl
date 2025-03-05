# Build the project
Write-Host "Starting Juggl plugin build..." -ForegroundColor Green
npx rollup --config rollup.config.js

# Define target path (Obsidian plugin directory)
$targetPath = "C:\Users\logos\Documents\Obsidian-Local\vault-obsindex\vault-galaxrecord\.obsidian\plugins\juggl"

# Ensure target directory exists
Write-Host "Checking target directory: $targetPath" -ForegroundColor Yellow
if (-not (Test-Path $targetPath)) {
    Write-Host "Creating target directory: $targetPath" -ForegroundColor Yellow
    New-Item -Path $targetPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
    Write-Host "Target directory created" -ForegroundColor Green
} else {
    Write-Host "Target directory already exists" -ForegroundColor Green
}

# Check if build files exist
Write-Host "Checking build files..." -ForegroundColor Yellow
$mainJsExists = Test-Path ".\main.js"
$manifestExists = Test-Path ".\manifest.json"
$stylesExists = Test-Path ".\styles.css"

Write-Host "main.js exists: $mainJsExists" -ForegroundColor Cyan
Write-Host "manifest.json exists: $manifestExists" -ForegroundColor Cyan
Write-Host "styles.css exists: $stylesExists" -ForegroundColor Cyan

if (-not $mainJsExists -or -not $manifestExists) {
    Write-Host "Error: Missing required build files, please ensure build completed successfully" -ForegroundColor Red
    exit 1
}

# Copy necessary files to Obsidian plugin directory
Write-Host "Copying files to Obsidian plugin directory..." -ForegroundColor Green

try {
    # Copy main.js
    Copy-Item -Path ".\main.js" -Destination "$targetPath\main.js" -Force -ErrorAction Stop
    Write-Host "Copied: main.js" -ForegroundColor Cyan

    # Copy manifest.json
    Copy-Item -Path ".\manifest.json" -Destination "$targetPath\manifest.json" -Force -ErrorAction Stop
    Write-Host "Copied: manifest.json" -ForegroundColor Cyan

    # Copy styles.css (if exists)
    if ($stylesExists) {
        Copy-Item -Path ".\styles.css" -Destination "$targetPath\styles.css" -Force -ErrorAction Stop
        Write-Host "Copied: styles.css" -ForegroundColor Cyan
    }

    # Maintain .hotreload file to support Hot-Reload plugin
    if (Test-Path ".\.hotreload") {
        Copy-Item -Path ".\.hotreload" -Destination "$targetPath\.hotreload" -Force -ErrorAction Stop
        Write-Host "Copied: .hotreload" -ForegroundColor Cyan
    }

    # Check if target files were copied
    Write-Host "Verifying files were copied successfully..." -ForegroundColor Yellow
    $targetMainJs = Test-Path "$targetPath\main.js"
    $targetManifest = Test-Path "$targetPath\manifest.json"
    $targetStyles = Test-Path "$targetPath\styles.css"

    Write-Host "Target main.js exists: $targetMainJs" -ForegroundColor Cyan
    Write-Host "Target manifest.json exists: $targetManifest" -ForegroundColor Cyan
    Write-Host "Target styles.css exists: $targetStyles" -ForegroundColor Cyan

    # Display target directory contents
    Write-Host "Target directory contents:" -ForegroundColor Yellow
    Get-ChildItem -Path $targetPath -ErrorAction SilentlyContinue | Format-Table Name, Length

    Write-Host "Done! Juggl plugin has been successfully built and copied to Obsidian." -ForegroundColor Green
} catch {
    Write-Host "Error: Problem copying files:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} 