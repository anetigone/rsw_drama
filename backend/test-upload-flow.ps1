# 完整上传流程测试脚本
# 使用方法: .\test-upload-flow.ps1 <pdf文件路径>

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

$BaseUrl = if ($env:API_BASE_URL) { $env:API_BASE_URL } else { "http://localhost:3000" }

# 检查文件是否存在
if (-not (Test-Path $FilePath)) {
    Write-Host "错误: 文件不存在: $FilePath" -ForegroundColor Red
    exit 1
}

# 获取文件信息
$fileName = Split-Path $FilePath -Leaf
$fileSize = (Get-Item $FilePath).Length

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   文献上传流程测试" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "文件: $fileName" -ForegroundColor White
Write-Host "大小: $fileSize bytes" -ForegroundColor White
Write-Host ""

# 步骤1: 获取预签名上传 URL
Write-Host "步骤1: 获取预签名上传 URL" -ForegroundColor Blue
Write-Host "POST $BaseUrl/api/upload/presigned-url" -ForegroundColor Gray
Write-Host ""

$presignedBody = @{
    fileName = $fileName
    fileSize = $fileSize
    contentType = "application/pdf"
} | ConvertTo-Json

$uploadResponse = Invoke-RestMethod -Uri "$BaseUrl/api/upload/presigned-url" -Method Post -Body $presignedBody -ContentType "application/json"
$uploadResponse | ConvertTo-Json -Depth 10

# 检查是否成功
if (-not $uploadResponse.success) {
    Write-Host "获取预签名 URL 失败" -ForegroundColor Red
    exit 1
}

$uploadUrl = $uploadResponse.data.uploadUrl
$ossKey = $uploadResponse.data.ossKey

Write-Host "✓ 预签名 URL 获取成功" -ForegroundColor Green
Write-Host "  OSS Key: $ossKey" -ForegroundColor White
Write-Host ""
Write-Host "------------------------------------------" -ForegroundColor Gray
Write-Host ""

# 步骤2: 上传文件到 OSS
Write-Host "步骤2: 上传文件到 OSS (客户端直传)" -ForegroundColor Blue
Write-Host "PUT $uploadUrl" -ForegroundColor Gray
Write-Host ""

# 使用完整路径避免路径解析问题
$fullPath = (Get-Item $FilePath).FullName
Write-Host "调试: 使用完整路径: $fullPath" -ForegroundColor Yellow
$fileBytes = [System.IO.File]::ReadAllBytes($fullPath)
$uploadResult = Invoke-RestMethod -Uri $uploadUrl -Method Put -Body $fileBytes -ContentType "application/pdf"
$uploadResult | ConvertTo-Json -Depth 10

Write-Host "✓ 文件上传到 OSS 成功" -ForegroundColor Green
Write-Host ""
Write-Host "------------------------------------------" -ForegroundColor Gray
Write-Host ""

# 步骤3: 确认上传，创建文献记录
Write-Host "步骤3: 确认上传，创建文献记录" -ForegroundColor Blue
Write-Host "POST $BaseUrl/api/upload/confirm" -ForegroundColor Gray
Write-Host ""

$confirmBody = @{
    ossKey = $ossKey
    metadata = @{
        title = "莎士比亚戏剧研究"
        author = "张三"
        year = 2024
        description = "关于莎士比亚四大悲剧的研究论文"
        category = "戏剧理论"
        totalPages = 45
    }
    fileInfo = @{
        fileSize = $fileSize
        fileName = $fileName
    }
} | ConvertTo-Json -Depth 10

$literatureResponse = Invoke-RestMethod -Uri "$BaseUrl/api/upload/confirm" -Method Post -Body $confirmBody -ContentType "application/json"
$literatureResponse | ConvertTo-Json -Depth 10

# 检查是否成功
if (-not $literatureResponse.success) {
    Write-Host "创建文献记录失败" -ForegroundColor Red
    exit 1
}

$literatureId = $literatureResponse.data.id

Write-Host "✓ 文献记录创建成功" -ForegroundColor Green
Write-Host "  文献 ID: $literatureId" -ForegroundColor White
Write-Host ""
Write-Host "------------------------------------------" -ForegroundColor Gray
Write-Host ""

# 步骤4: 获取阅读 URL
Write-Host "步骤4: 获取阅读 URL (1小时有效)" -ForegroundColor Blue
Write-Host "GET $BaseUrl/api/literatures/$literatureId/read-url" -ForegroundColor Gray
Write-Host ""

$readUrlResponse = Invoke-RestMethod -Uri "$BaseUrl/api/literatures/$literatureId/read-url" -Method Get
$readUrlResponse | ConvertTo-Json -Depth 10

Write-Host "✓ 阅读 URL 生成成功" -ForegroundColor Green
Write-Host ""
Write-Host "------------------------------------------" -ForegroundColor Gray
Write-Host ""

# 步骤5: 验证文献已添加到列表
Write-Host "步骤5: 验证文献已添加到列表" -ForegroundColor Blue
Write-Host "GET $BaseUrl/api/literatures" -ForegroundColor Gray
Write-Host ""

$allLiterature = Invoke-RestMethod -Uri "$BaseUrl/api/literatures" -Method Get
$matchedItem = $allLiterature.data.items | Where-Object { $_.id -eq $literatureId }
$matchedItem | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ 所有步骤完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "文献 ID: $literatureId" -ForegroundColor Yellow
Write-Host "OSS Key: $ossKey" -ForegroundColor Yellow
Write-Host ""
Write-Host "后续操作:"
Write-Host "  查看详情: curl $BaseUrl/api/literatures/$literatureId"
Write-Host "  获取阅读URL: curl $BaseUrl/api/literatures/$literatureId/read-url"
Write-Host "  获取下载URL: curl $BaseUrl/api/literatures/$literatureId/download-url"
Write-Host ""
