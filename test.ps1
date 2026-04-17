# 测试非流式请求
$body = @{
    questionnaireType = "psychological"
    answers = @{
        totalScore = 75
        dimensionScores = @(
            @{ dimension = "情绪调节"; score = 20; averageScore = 4.0 }
            @{ dimension = "自我接纳"; score = 18; averageScore = 3.6 }
            @{ dimension = "压力缓解"; score = 19; averageScore = 3.8 }
            @{ dimension = "人际联结"; score = 18; averageScore = 3.6 }
        )
    }
    stream = $false
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "https://api.newsouthwest.cn/" -Method POST -Body $body -ContentType "application/json" -Verbose