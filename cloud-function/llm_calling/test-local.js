/**
 * 本地测试脚本 - 用于测试 llm_calling 云函数
 * 使用方法: node test-local.js
 */

// 加载环境变量
require('dotenv').config();

// 检查必要的环境变量
if (!process.env.LLM_API_KEY) {
  console.error('❌ 缺少 LLM_API_KEY 环境变量');
  console.error('请创建 .env 文件并设置你的 DeepSeek API 密钥');
  console.error('可以参考 .env.example 文件');
  process.exit(1);
}

// 导入云函数
const { handler } = require('./index');

// 测试数据
const testCases = [
  {
    name: '心理疗愈问卷 - 普通模式',
    event: {
      questionnaireType: 'psychological',
      answers: {
        dimensionScores: [
          {
            dimension: '情绪调节',
            score: 20,
            averageScore: 4.0
          },
          {
            dimension: '自我接纳',
            score: 18,
            averageScore: 3.6
          },
          {
            dimension: '压力缓解',
            score: 22,
            averageScore: 4.4
          },
          {
            dimension: '人际联结',
            score: 15,
            averageScore: 3.0
          }
        ],
        totalScore: 75,
        detailedAnswers: []
      },
      metadata: {
        sampleCount: 1,
        ageDistribution: '18-25岁:100%',
        participationType: '线下观看'
      }
    }
  },
  {
    name: '红色记忆问卷 - 普通模式',
    event: {
      questionnaireType: 'red_memory',
      answers: {
        dimensionScores: [
          {
            dimension: '记忆唤醒',
            score: 21,
            averageScore: 4.2
          },
          {
            dimension: '情感共鸣',
            score: 19,
            averageScore: 3.8
          },
          {
            dimension: '价值认同',
            score: 23,
            averageScore: 4.6
          },
          {
            dimension: '行为倾向',
            score: 17,
            averageScore: 3.4
          }
        ],
        totalScore: 80,
        detailedAnswers: []
      },
      metadata: {
        sampleCount: 15,
        ageDistribution: '18-25岁:50%, 26-35岁:40%, 其他:10%',
        participationType: '线上观看'
      }
    }
  },
  {
    name: '心理疗愈问卷 - 流式模式',
    event: {
      questionnaireType: 'psychological',
      stream: true,
      answers: {
        dimensionScores: [
          {
            dimension: '情绪调节',
            score: 20,
            averageScore: 4.0
          },
          {
            dimension: '自我接纳',
            score: 18,
            averageScore: 3.6
          },
          {
            dimension: '压力缓解',
            score: 22,
            averageScore: 4.4
          },
          {
            dimension: '人际联结',
            score: 15,
            averageScore: 3.0
          }
        ],
        totalScore: 75,
        detailedAnswers: []
      },
      metadata: {
        sampleCount: 10,
        ageDistribution: '18-25岁:60%, 26-35岁:30%, 其他:10%',
        participationType: '线下观看'
      }
    }
  }
];

/**
 * 执行测试
 */
async function runTest(testCase) {
  console.log(`\n🧪 测试: ${testCase.name}`);
  console.log('=' .repeat(50));

  try {
    const startTime = Date.now();

    // 模拟云函数的 context 对象
    const context = {
      callbackWaitsForEmptyEventLoop: false,
      getRemainingTimeInMillis: () => 60000
    };

    // 调用云函数处理器
    const result = await handler(testCase.event, context);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ 测试成功 (耗时: ${duration}秒)`);
    console.log('\n📊 结果预览:');

    if (testCase.event.stream) {
      // 流式输出结果
      console.log('流式响应配置:', JSON.stringify(result, null, 2));
    } else {
      // 普通输出结果
      if (result.success) {
        console.log('分析结果:');
        console.log('-'.repeat(50));
        console.log(result.analysis.substring(0, 200) + '...');
        console.log('-'.repeat(50));
        console.log(`\n完整结果长度: ${result.analysis.length} 字符`);
        console.log(`问卷类型: ${result.questionnaireType}`);
      } else {
        console.log('❌ 错误:', result.error);
      }
    }

  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    console.log('错误堆栈:', error.stack);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始本地测试 LLM 云函数');
  console.log('='.repeat(50));

  // 检查 API 密钥
  if (!process.env.LLM_API_KEY) {
    console.error('❌ 缺少 LLM_API_KEY 环境变量');
    console.error('请创建 .env 文件并设置你的 DeepSeek API 密钥');
    process.exit(1);
  }

  // 运行所有测试
  for (const testCase of testCases) {
    await runTest(testCase);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 测试间隔1秒
  }

  console.log('\n✨ 所有测试完成！');
}

// 运行测试
main().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});