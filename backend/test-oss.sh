#!/bin/bash
# OSS 服务测试脚本

# 打印当前工作目录
echo "=== 工作目录信息 ==="
echo "当前目录: $(pwd)"
echo "脚本目录: $(dirname "$0")"
echo ""

# 切换到脚本所在目录
cd "$(dirname "$0")" || exit 1
echo "切换到项目目录: $(pwd)"
echo ""

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "❌ 错误: .env 文件不存在"
    echo "请先创建 .env 文件，可以参考 .env.example"
    echo ""
    echo "创建命令:"
    echo "  cp .env.example .env"
    echo "  nano .env  # 编辑配置"
    exit 1
fi

echo "✓ 找到 .env 文件"
echo ""

# 检查必需的环境变量
source .env 2>/dev/null || true

if [ -z "$OSS_ACCESS_KEY_ID" ] || [ -z "$OSS_ACCESS_KEY_SECRET" ] || [ -z "$OSS_BUCKET_NAME" ]; then
    echo "❌ .env 文件中缺少必需的环境变量"
    echo "请确保包含以下变量:"
    echo "  - OSS_ACCESS_KEY_ID"
    echo "  - OSS_ACCESS_KEY_SECRET"
    echo "  - OSS_BUCKET_NAME"
    echo "  - JWT_SECRET"
    echo "  - ADMIN_USERS"
    exit 1
fi

echo "✓ 环境变量检查通过"
echo ""
echo "=== 开始 OSS 测试 ==="
echo ""

# 运行测试
npx tsx src/test/test-oss-service-wrapper.ts
