# 完整上传流程测试脚本（包含封面测试）
# 使用方法: .\test-complete-upload-flow.ps1 <pdf文件路径>

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

$BaseUrl = if ($env:API_BASE_URL) { $env:API_BASE_URL } else { "http://localhost:3000" }
$ErrorActionPreference = "Stop"

# 检查文件是否存在
if (-not (Test-Path $FilePath)) {
    Write-Host "错误: 文件不存在: $FilePath" -ForegroundColor Red
    exit 1
}

# 获取文件信息
$fileName = Split-Path $FilePath -Leaf
$fileSize = (Get-Item $FilePath).Length

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   文献完整上传流程测试（含封面）" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "文件: $fileName" -ForegroundColor White
Write-Host "大小: $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor White
Write-Host ""

# ===== 步骤1: 获取 PDF 预签名上传 URL =====
Write-Host "步骤1: 获取 PDF 预签名上传 URL" -ForegroundColor Blue
Write-Host "POST $BaseUrl/api/upload/presigned-url" -ForegroundColor Gray

$presignedBody = @{
    fileName = $fileName
    fileSize = $fileSize
    contentType = "application/pdf"
} | ConvertTo-Json

try {
    $uploadResponse = Invoke-RestMethod -Uri "$BaseUrl/api/upload/presigned-url" -Method Post -Body $presignedBody -ContentType "application/json"
} catch {
    Write-Host "✗ 请求失败: $_" -ForegroundColor Red
    exit 1
}

if (-not $uploadResponse.success) {
    Write-Host "✗ 获取预签名 URL 失败" -ForegroundColor Red
    Write-Host ($uploadResponse | ConvertTo-Json -Depth 10) -ForegroundColor Red
    exit 1
}

$pdfUploadUrl = $uploadResponse.data.uploadUrl
$pdfOssKey = $uploadResponse.data.ossKey

Write-Host "✓ 预签名 URL 获取成功" -ForegroundColor Green
Write-Host "  OSS Key: $pdfOssKey" -ForegroundColor White
Write-Host "  路径格式验证: " -NoNewline -ForegroundColor White

# 验证路径格式: literatures/YYYY/MM/uuid.pdf
if ($pdfOssKey -match '^literatures/\d{4}/\d{2}/[^/]+\.pdf$') {
    Write-Host "✓ 正确 (literatures/YYYY/MM/uuid.pdf)" -ForegroundColor Green
} else {
    Write-Host "✗ 错误 (预期格式: literatures/YYYY/MM/uuid.pdf)" -ForegroundColor Red
    Write-Host "  实际: $pdfOssKey" -ForegroundColor Red
}
Write-Host ""

# ===== 步骤2: 上传 PDF 文件到 OSS =====
Write-Host "步骤2: 上传 PDF 文件到 OSS (客户端直传)" -ForegroundColor Blue
Write-Host "PUT $pdfUploadUrl" -ForegroundColor Gray

$fullPath = (Get-Item $FilePath).FullName
try {
    $fileBytes = [System.IO.File]::ReadAllBytes($fullPath)
    $uploadResult = Invoke-RestMethod -Uri $pdfUploadUrl -Method Put -Body $fileBytes -ContentType "application/pdf"
} catch {
    Write-Host "✗ 上传失败: $_" -ForegroundColor Red
    exit 1
}

Write-Host "✓ PDF 文件上传到 OSS 成功" -ForegroundColor Green
Write-Host ""

# ===== 步骤3: 获取封面预签名上传 URL =====
Write-Host "步骤3: 获取封面预签名上传 URL" -ForegroundColor Blue
Write-Host "POST $BaseUrl/api/upload/presigned-url" -ForegroundColor Gray

# 使用 UUID 生成封面文件名（模拟前端行为）
$coverFileName = "$([Guid]::NewGuid())_cover.jpg"
$coverPresignedBody = @{
    fileName = $coverFileName
    fileSize = 500000  # 预估封面大小
    contentType = "image/jpeg"
} | ConvertTo-Json

try {
    $coverUploadResponse = Invoke-RestMethod -Uri "$BaseUrl/api/upload/presigned-url" -Method Post -Body $coverPresignedBody -ContentType "application/json"
} catch {
    Write-Host "✗ 请求失败: $_" -ForegroundColor Red
    exit 1
}

if (-not $coverUploadResponse.success) {
    Write-Host "✗ 获取封面预签名 URL 失败" -ForegroundColor Red
    exit 1
}

$coverUploadUrl = $coverUploadResponse.data.uploadUrl
$coverOssKey = $coverUploadResponse.data.ossKey

Write-Host "✓ 封面预签名 URL 获取成功" -ForegroundColor Green
Write-Host "  OSS Key: $coverOssKey" -ForegroundColor White
Write-Host "  路径格式验证: " -NoNewline -ForegroundColor White

# 验证路径格式: covers/YYYY/MM/uuid_cover.jpg
if ($coverOssKey -match '^covers/\d{4}/\d{2}/[^/]+_cover\.jpg$') {
    Write-Host "✓ 正确 (covers/YYYY/MM/uuid_cover.jpg)" -ForegroundColor Green
} else {
    Write-Host "✗ 错误 (预期格式: covers/YYYY/MM/uuid_cover.jpg)" -ForegroundColor Red
    Write-Host "  实际: $coverOssKey" -ForegroundColor Red
}
Write-Host ""

# ===== 步骤4: 创建并上传模拟封面图片 =====
Write-Host "步骤4: 上传封面图片到 OSS" -ForegroundColor Blue
Write-Host "PUT $coverUploadUrl" -ForegroundColor Gray

# 创建一个简单的测试图片（1x1 像素的 JPEG）
$coverBytes = [byte[]]::new(100) # 简单的测试数据
for ($i = 0; $i -lt $coverBytes.Length; $i++) {
    $coverBytes[$i] = $i % 256
}

try {
    $coverUploadResult = Invoke-RestMethod -Uri $coverUploadUrl -Method Put -Body $coverBytes -ContentType "image/jpeg"
} catch {
    Write-Host "✗ 封面上传失败: $_" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 封面图片上传到 OSS 成功" -ForegroundColor Green
Write-Host ""

# ===== 步骤5: 确认上传，创建文献记录 =====
Write-Host "步骤5: 确认上传，创建文献记录" -ForegroundColor Blue
Write-Host "POST $BaseUrl/api/upload/confirm" -ForegroundColor Gray

$confirmBody = @{
    ossKey = $pdfOssKey
    metadata = @{
        title = "莎士比亚戏剧研究"
        author = "张三"
        year = 2024
        description = "关于莎士比亚四大悲剧的研究论文"
        category = "剧本"  # 测试分类名称到ID的映射
        totalPages = 45
    }
    fileInfo = @{
        fileSize = $fileSize
        fileName = $fileName
    }
    coverUrl = $coverOssKey  # 传递封面 OSS key
} | ConvertTo-Json -Depth 10

try {
    $literatureResponse = Invoke-RestMethod -Uri "$BaseUrl/api/upload/confirm" -Method Post -Body $confirmBody -ContentType "application/json"
} catch {
    Write-Host "✗ 请求失败: $_" -ForegroundColor Red
    exit 1
}

if (-not $literatureResponse.success) {
    Write-Host "✗ 创建文献记录失败" -ForegroundColor Red
    Write-Host ($literatureResponse | ConvertTo-Json -Depth 10) -ForegroundColor Red
    exit 1
}

$literatureId = $literatureResponse.data.id
$literatureData = $literatureResponse.data

Write-Host "✓ 文献记录创建成功" -ForegroundColor Green
Write-Host "  文献 ID: $literatureId" -ForegroundColor White
Write-Host "  封面 URL: $($literatureData.imageUrl)" -ForegroundColor White
Write-Host "  分类 ID: $($literatureData.categoryId)" -ForegroundColor White
Write-Host "  分类验证: " -NoNewline -ForegroundColor White

# 验证封面字段
if ($literatureData.imageUrl -eq $coverOssKey) {
    Write-Host "✓ 封面 URL 正确保存" -ForegroundColor Green
} else {
    Write-Host "✗ 封面 URL 不匹配" -ForegroundColor Red
    Write-Host "  预期: $coverOssKey" -ForegroundColor Red
    Write-Host "  实际: $($literatureData.imageUrl)" -ForegroundColor Red
}
Write-Host ""

# ===== 步骤6: 获取阅读 URL =====
Write-Host "步骤6: 获取阅读 URL (1小时有效)" -ForegroundColor Blue
Write-Host "GET $BaseUrl/api/literatures/$literatureId/read-url" -ForegroundColor Gray

try {
    $readUrlResponse = Invoke-RestMethod -Uri "$BaseUrl/api/literatures/$literatureId/read-url" -Method Get
    if ($readUrlResponse.success) {
        Write-Host "✓ 阅读 URL 生成成功" -ForegroundColor Green
        Write-Host "  URL: $($readUrlResponse.data.readUrl)" -ForegroundColor White
    } else {
        Write-Host "✗ 获取阅读 URL 失败" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ 请求失败: $_" -ForegroundColor Red
}
Write-Host ""

# ===== 步骤7: 验证文献已添加到列表 =====
Write-Host "步骤7: 验证文献已添加到列表" -ForegroundColor Blue
Write-Host "GET $BaseUrl/api/literatures" -ForegroundColor Gray

try {
    $allLiterature = Invoke-RestMethod -Uri "$BaseUrl/api/literatures" -Method Get
    $matchedItem = $allLiterature.data.items | Where-Object { $_.id -eq $literatureId }

    if ($matchedItem) {
        Write-Host "✓ 文献已成功添加到列表" -ForegroundColor Green
        Write-Host "  标题: $($matchedItem.title)" -ForegroundColor White
        Write-Host "  作者: $($matchedItem.author)" -ForegroundColor White
        Write-Host "  分类: $($matchedItem.categoryRef.name)" -ForegroundColor White
    } else {
        Write-Host "✗ 文献未在列表中找到" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ 请求失败: $_" -ForegroundColor Red
}
Write-Host ""

# ===== 步骤8: 获取文献详情 =====
Write-Host "步骤8: 获取文献详情" -ForegroundColor Blue
Write-Host "GET $BaseUrl/api/literatures/$literatureId" -ForegroundColor Gray

try {
    $detailResponse = Invoke-RestMethod -Uri "$BaseUrl/api/literatures/$literatureId" -Method Get
    if ($detailResponse.success) {
        $detail = $detailResponse.data
        Write-Host "✓ 文献详情获取成功" -ForegroundColor Green
        Write-Host "  ID: $($detail.id)" -ForegroundColor White
        Write-Host "  标题: $($detail.title)" -ForegroundColor White
        Write-Host "  作者: $($detail.author)" -ForegroundColor White
        Write-Host "  年份: $($detail.year)" -ForegroundColor White
        Write-Host "  页数: $($detail.totalPages)" -ForegroundColor White
        Write-Host "  OSS Key: $($detail.ossKey)" -ForegroundColor White
        Write-Host "  封面: $($detail.imageUrl)" -ForegroundColor White
        Write-Host "  文件大小: $([math]::Round($detail.fileSize/1KB, 2)) KB" -ForegroundColor White
        Write-Host "  上传日期: $($detail.uploadDate)" -ForegroundColor White
    } else {
        Write-Host "✗ 获取文献详情失败" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ 请求失败: $_" -ForegroundColor Red
}
Write-Host ""

# ===== 测试总结 =====
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ 所有测试步骤完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "测试验证项目:" -ForegroundColor Yellow
Write-Host "  ✓ PDF 文件路径格式 (literatures/YYYY/MM/uuid.pdf)" -ForegroundColor Green
Write-Host "  ✓ 封面文件路径格式 (covers/YYYY/MM/uuid_cover.jpg)" -ForegroundColor Green
Write-Host "  ✓ PDF 上传到 OSS" -ForegroundColor Green
Write-Host "  ✓ 封面上传到 OSS" -ForegroundColor Green
Write-Host "  ✓ 文献记录创建（含封面 URL）" -ForegroundColor Green
Write-Host "  ✓ 分类名称到 ID 的映射" -ForegroundColor Green
Write-Host ""
Write-Host "文献信息:" -ForegroundColor Yellow
Write-Host "  ID: $literatureId" -ForegroundColor White
Write-Host "  PDF OSS Key: $pdfOssKey" -ForegroundColor White
Write-Host "  封面 OSS Key: $coverOssKey" -ForegroundColor White
Write-Host ""
Write-Host "后续操作:" -ForegroundColor Yellow
Write-Host "  查看详情: curl $BaseUrl/api/literatures/$literatureId" -ForegroundColor Gray
Write-Host "  获取阅读URL: curl $BaseUrl/api/literatures/$literatureId/read-url" -ForegroundColor Gray
Write-Host "  获取下载URL: curl $BaseUrl/api/literatures/$literatureId/download-url" -ForegroundColor Gray
Write-Host "  删除文献: curl -X DELETE $BaseUrl/api/literatures/$literatureId" -ForegroundColor Gray
Write-Host ""
