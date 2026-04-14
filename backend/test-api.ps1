# API 快速测试脚本
# 使用方法: .\test-api.ps1

$BaseUrl = if ($env:API_BASE_URL) { $env:API_BASE_URL } else { "http://localhost:3000" }

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   文献管理系统 API 测试" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 测试1: 获取文献列表
Write-Host "测试1: 获取文献列表" -ForegroundColor Blue
Write-Host "GET $BaseUrl/api/literatures" -ForegroundColor Gray
Write-Host ""
$response = Invoke-RestMethod -Uri "$BaseUrl/api/literatures" -Method Get
$response | ConvertTo-Json -Depth 10
Write-Host ""
Write-Host "------------------------------------------" -ForegroundColor Gray
Write-Host ""

# 测试2: 获取文献详情
Write-Host "测试2: 获取文献详情" -ForegroundColor Blue
if ($response.data.items.Count -eq 0) {
    Write-Host "没有找到文献，请先上传文献" -ForegroundColor Red
} else {
    $literatureId = $response.data.items[0].id
    Write-Host "GET $BaseUrl/api/literatures/$literatureId" -ForegroundColor Gray
    Write-Host ""
    Invoke-RestMethod -Uri "$BaseUrl/api/literatures/$literatureId" -Method Get | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "------------------------------------------" -ForegroundColor Gray
    Write-Host ""

    # 测试3: 获取阅读 URL
    Write-Host "测试3: 获取阅读 URL (1小时有效)" -ForegroundColor Blue
    Write-Host "GET $BaseUrl/api/literatures/$literatureId/read-url" -ForegroundColor Gray
    Write-Host ""
    Invoke-RestMethod -Uri "$BaseUrl/api/literatures/$literatureId/read-url" -Method Get | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "------------------------------------------" -ForegroundColor Gray
    Write-Host ""

    # 测试4: 获取下载 URL
    Write-Host "测试4: 获取下载 URL (1小时有效)" -ForegroundColor Blue
    Write-Host "GET $BaseUrl/api/literatures/$literatureId/download-url" -ForegroundColor Gray
    Write-Host ""
    Invoke-RestMethod -Uri "$BaseUrl/api/literatures/$literatureId/download-url" -Method Get | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "------------------------------------------" -ForegroundColor Gray
    Write-Host ""
}

# 测试5: 获取分类
Write-Host "测试5: 获取分类列表" -ForegroundColor Blue
Write-Host "GET $BaseUrl/api/categories" -ForegroundColor Gray
Write-Host ""
Invoke-RestMethod -Uri "$BaseUrl/api/categories" -Method Get | ConvertTo-Json -Depth 10
Write-Host ""
Write-Host "------------------------------------------" -ForegroundColor Gray
Write-Host ""

# 测试6: 获取统计数据
Write-Host "测试6: 获取统计数据" -ForegroundColor Blue
Write-Host "GET $BaseUrl/api/statistics" -ForegroundColor Gray
Write-Host ""
Invoke-RestMethod -Uri "$BaseUrl/api/statistics" -Method Get | ConvertTo-Json -Depth 10
Write-Host ""
Write-Host "------------------------------------------" -ForegroundColor Gray
Write-Host ""

Write-Host "测试完成！" -ForegroundColor Green
