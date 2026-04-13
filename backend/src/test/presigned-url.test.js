// 测试预签名URL生成
import dotenv from 'dotenv';
dotenv.config();
import OSS from 'ali-oss';

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  authorizationV4: true,
  bucket: process.env.OSS_BUCKET_NAME,
});

async function testPresignedUrls() {
  const testFileName = 'test-file.pdf';

  console.log('=== 测试预签名URL生成 ===\n');

  // 测试1: 生成预签名上传URL (PUT)
  try {
    console.log('1. 生成预签名上传URL (PUT)...');
    const uploadUrl = await client.signatureUrlV4(
      'PUT',
      3600,
      {
        headers: {
          'Content-Type': 'application/pdf',
        },
      },
      testFileName
    );
    console.log('✓ 上传URL生成成功:');
    console.log(uploadUrl);
    console.log('');
  } catch (error) {
    console.error('✗ 上传URL生成失败:', error.message);
    console.log('');
  }

  // 测试2: 生成预签名下载URL (GET)
  try {
    console.log('2. 生成预签名下载URL (GET)...');
    const downloadUrl = await client.signatureUrlV4(
      'GET',
      3600,
      {
        headers: {},
        queries: {
          'response-content-disposition': 'inline',
        },
      },
      testFileName
    );
    console.log('✓ 下载URL生成成功:');
    console.log(downloadUrl);
    console.log('');
  } catch (error) {
    console.error('✗ 下载URL生成失败:', error.message);
    console.log('');
  }

  // 测试3: 上传一个测试文件
  try {
    console.log('3. 上传测试文件...');
    const result = await client.put(
      testFileName,
      Buffer.from('This is a test file content'),
      {
        headers: {
          'Content-Type': 'text/plain',
          'x-oss-object-acl': 'public-read',
        },
      }
    );
    console.log('✓ 文件上传成功:');
    console.log('  name:', result.name);
    console.log('  url:', result.url);
    console.log('');
  } catch (error) {
    console.error('✗ 文件上传失败:', error.message);
    console.log('');
  }

  // 测试4: 验证下载URL是否可用
  try {
    console.log('4. 验证文件是否存在...');
    const result = await client.head(testFileName);
    console.log('✓ 文件存在，元数据:');
    console.log('  content-type:', result.res.headers['content-type']);
    console.log('  content-length:', result.res.headers['content-length']);
    console.log('');
  } catch (error) {
    console.error('✗ 文件不存在:', error.message);
    console.log('');
  }

  // 清理：删除测试文件
  try {
    console.log('5. 清理测试文件...');
    await client.delete(testFileName);
    console.log('✓ 测试文件已删除');
  } catch (error) {
    console.error('✗ 删除测试文件失败:', error.message);
  }
}

testPresignedUrls().catch(console.error);
