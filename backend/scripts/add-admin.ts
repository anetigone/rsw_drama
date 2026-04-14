import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function addSingleAdmin() {
  console.log('🔐 添加单个管理员\n');

  const username = await question('请输入用户名: ');
  if (!username.trim()) {
    console.log('❌ 用户名不能为空');
    rl.close();
    return;
  }

  const password = await question('请输入密码: ');
  if (!password.trim()) {
    console.log('❌ 密码不能为空');
    rl.close();
    return;
  }

  const name = await question('请输入显示名称（可选，直接回车跳过）: ');

  // 生成密码哈希
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const adminUser = {
    username: username.trim(),
    password: hash,
    name: name.trim() || undefined,
  };

  console.log('\n\n✨ 管理员配置生成完成！\n');
  console.log('请将以下 JSON 添加到你的 .env 文件的 ADMIN_USERS 数组中：\n');
  console.log('--- 开始复制 ---');
  console.log(JSON.stringify(adminUser));
  console.log('--- 结束复制 ---\n');

  console.log('📝 完整的 .env 配置示例：');
  console.log(`
# 认证配置
JWT_SECRET=your_jwt_secret_key_here_change_in_production
ADMIN_USERS='[${JSON.stringify(adminUser)}]'
  `);

  console.log('\n💡 提示：如果要添加多个管理员，可以运行：npm run generate-admin-config');

  rl.close();
}

addSingleAdmin().catch(console.error);
