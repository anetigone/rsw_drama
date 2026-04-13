/**
 * 生成管理员密码的哈希值
 * 使用方法: npx ts-node scripts/generate-password.ts <你的密码>
 */
import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('请提供密码: npx ts-node scripts/generate-password.ts <你的密码>');
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('生成哈希失败:', err);
    process.exit(1);
  }

  console.log('\n✅ 密码哈希生成成功!\n');
  console.log('请将以下内容添加到你的 .env 文件中:\n');
  console.log(`ADMIN_PASSWORD=${hash}\n`);
  console.log('注意: 请使用强密码,并妥善保管 .env 文件!\n');
});
