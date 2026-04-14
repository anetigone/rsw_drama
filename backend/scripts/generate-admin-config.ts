import bcrypt from 'bcryptjs';
import readline from 'readline';

interface AdminUser {
  username: string;
  password: string;
  name?: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function generateAdminConfig() {
  console.log('🔐 管理员配置生成器\n');
  console.log('此工具将帮助你生成管理员配置，用于 .env 文件\n');

  const adminUsers: AdminUser[] = [];
  let addMore = true;

  while (addMore) {
    console.log(`\n--- 添加管理员 #${adminUsers.length + 1} ---`);

    const username = await question('请输入用户名: ');
    if (!username.trim()) {
      console.log('❌ 用户名不能为空');
      continue;
    }

    // 检查用户名是否已存在
    if (adminUsers.some(user => user.username === username)) {
      console.log('❌ 用户名已存在');
      continue;
    }

    const password = await question('请输入密码: ');
    if (!password.trim()) {
      console.log('❌ 密码不能为空');
      continue;
    }

    const name = await question('请输入显示名称（可选，直接回车跳过）: ');

    // 生成密码哈希
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    adminUsers.push({
      username: username.trim(),
      password: hash,
      name: name.trim() || undefined,
    });

    console.log(`✅ 管理员 "${username}" 已添加`);

    const answer = await question('\n是否继续添加管理员？(y/n): ');
    addMore = answer.toLowerCase() === 'y';
  }

  if (adminUsers.length === 0) {
    console.log('\n❌ 没有添加任何管理员');
    rl.close();
    return;
  }

  console.log('\n\n✨ 配置生成完成！\n');
  console.log('请将以下配置复制到你的 .env 文件中：\n');
  console.log('--- 开始复制 ---');
  console.log(`ADMIN_USERS='${JSON.stringify(adminUsers)}'`);
  console.log('--- 结束复制 ---\n');

  console.log('📝 示例 .env 配置：');
  console.log(`
# 认证配置
JWT_SECRET=your_jwt_secret_key_here_change_in_production
ADMIN_USERS='${JSON.stringify(adminUsers)}'
  `);

  console.log('\n🔒 安全提示：');
  console.log('1. 请妥善保管你的 .env 文件');
  console.log('2. 不要将 .env 文件提交到版本控制系统');
  console.log('3. 定期更换管理员密码');
  console.log('4. 在生产环境中使用强密码');

  rl.close();
}

generateAdminConfig().catch(console.error);
