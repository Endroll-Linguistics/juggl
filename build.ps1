# 构建项目
Write-Host "开始构建Juggl插件..." -ForegroundColor Green
npx rollup --config rollup.config.js

# 定义目标路径（Obsidian插件目录）
$targetPath = "C:\Users\logos\Documents\Obsidian-Local\vault-obsindex\vault-galaxrecord\.obsidian\plugins\juggl"

# 确保目标目录存在
Write-Host "检查目标目录: $targetPath" -ForegroundColor Yellow
if (-not (Test-Path $targetPath)) {
    Write-Host "创建目标目录: $targetPath" -ForegroundColor Yellow
    New-Item -Path $targetPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
    Write-Host "目标目录已创建" -ForegroundColor Green
} else {
    Write-Host "目标目录已存在" -ForegroundColor Green
}

# 检查构建文件是否存在
Write-Host "检查构建文件..." -ForegroundColor Yellow
$mainJsExists = Test-Path ".\main.js"
$manifestExists = Test-Path ".\manifest.json"
$stylesExists = Test-Path ".\styles.css"

Write-Host "main.js 存在: $mainJsExists" -ForegroundColor Cyan
Write-Host "manifest.json 存在: $manifestExists" -ForegroundColor Cyan
Write-Host "styles.css 存在: $stylesExists" -ForegroundColor Cyan

if (-not $mainJsExists -or -not $manifestExists) {
    Write-Host "错误: 缺少必要的构建文件，请确保构建成功完成" -ForegroundColor Red
    exit 1
}

# 复制必要的文件到Obsidian插件目录
Write-Host "复制文件到Obsidian插件目录..." -ForegroundColor Green

try {
    # 复制 main.js
    Copy-Item -Path ".\main.js" -Destination "$targetPath\main.js" -Force -ErrorAction Stop
    Write-Host "已复制: main.js" -ForegroundColor Cyan

    # 复制 manifest.json
    Copy-Item -Path ".\manifest.json" -Destination "$targetPath\manifest.json" -Force -ErrorAction Stop
    Write-Host "已复制: manifest.json" -ForegroundColor Cyan

    # 复制 styles.css（如果存在）
    if ($stylesExists) {
        Copy-Item -Path ".\styles.css" -Destination "$targetPath\styles.css" -Force -ErrorAction Stop
        Write-Host "已复制: styles.css" -ForegroundColor Cyan
    }

    # 维护.hotreload文件以支持Hot-Reload插件
    if (Test-Path ".\.hotreload") {
        Copy-Item -Path ".\.hotreload" -Destination "$targetPath\.hotreload" -Force -ErrorAction Stop
        Write-Host "已复制: .hotreload" -ForegroundColor Cyan
    }

    # 检查目标文件是否已复制
    Write-Host "验证文件是否已成功复制..." -ForegroundColor Yellow
    $targetMainJs = Test-Path "$targetPath\main.js"
    $targetManifest = Test-Path "$targetPath\manifest.json"
    $targetStyles = Test-Path "$targetPath\styles.css"

    Write-Host "目标 main.js 存在: $targetMainJs" -ForegroundColor Cyan
    Write-Host "目标 manifest.json 存在: $targetManifest" -ForegroundColor Cyan
    Write-Host "目标 styles.css 存在: $targetStyles" -ForegroundColor Cyan

    # 显示目标目录内容
    Write-Host "目标目录内容:" -ForegroundColor Yellow
    Get-ChildItem -Path $targetPath -ErrorAction SilentlyContinue | Format-Table Name, Length

    Write-Host "完成! Juggl插件已成功构建并复制到Obsidian。" -ForegroundColor Green
} catch {
    Write-Host "错误: 复制文件时出现问题:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} 