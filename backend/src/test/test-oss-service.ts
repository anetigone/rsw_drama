// OSS 服务测试脚本
// 注意：环境变量由 test-oss-service-wrapper.ts 加载
import ossService from '../services/oss.service';
import fs from 'fs';

async function testOssService() {
  console.log('=== OSS 服务测试 ===\n');

  // 创建一个测试文件
  const testFileName = 'test-document.pdf';
  const testContent = Buffer.from('This is a test PDF file content for OSS service testing.');
  const testContentType = 'application/pdf';

  try {
    // 测试1: 上传文件
    console.log('1. 测试上传文件...');
    const uploadResult = await ossService.uploadFile(
      testFileName,
      testContent,
      testContentType
    );
    console.log('✓ 文件上传成功:');
    console.log('  OSS Key:', uploadResult.ossKey);
    console.log('  Public URL:', uploadResult.publicUrl);
    console.log('');

    // 测试2: 检查文件是否存在
    console.log('2. 测试检查文件存在性...');
    const exists = await ossService.fileExists(uploadResult.ossKey);
    console.log('✓ 文件存在:', exists);
    console.log('');

    // 测试3: 获取文件信息
    console.log('3. 测试获取文件信息...');
    const fileInfo = await ossService.getFileInfo(uploadResult.ossKey);
    console.log('✓ 文件信息:');
    console.log('  Size:', fileInfo.size);
    console.log('  Content-Type:', fileInfo.contentType);
    console.log('  Last-Modified:', fileInfo.lastModified);
    console.log('');

    // 测试4: 生成预签名下载URL
    console.log('4. 测试生成预签名下载URL...');
    const readUrl = await ossService.generatePresignedReadUrl(uploadResult.ossKey, 3600);
    console.log('✓ 预签名下载URL生成成功:');
    console.log('  URL:', readUrl);
    console.log('');

    // 测试5: 生成预签名上传URL
    console.log('5. 测试生成预签名上传URL...');
    const presignedUpload = await ossService.generatePresignedUploadUrl('new-file.pdf', 'application/pdf', 3600);
    console.log('✓ 预签名上传URL生成成功:');
    console.log('  Upload URL:', presignedUpload.uploadUrl);
    console.log('  OSS Key:', presignedUpload.ossKey);
    console.log('  Expires in:', presignedUpload.expiresIn, 'seconds');
    console.log('');

    // 测试6: 获取公共URL
    console.log('6. 测试获取公共URL...');
    const publicUrl = ossService.getPublicUrl(uploadResult.ossKey);
    console.log('✓ 公共URL:', publicUrl);
    console.log('');

    // 测试7: 列举文件
    console.log('7. 测试列举文件...');
    const listResult = await ossService.listFiles('literatures/', 10);
    console.log('✓ 文件列表:');
    console.log('  对象数量:', listResult.objects.length);
    if (listResult.objects.length > 0) {
      console.log('  前几个文件:');
      listResult.objects.slice(0, 3).forEach(obj => {
        console.log(`    - ${obj.name} (${obj.size} bytes)`);
      });
    }
    console.log('');

    // 清理：删除测试文件
    console.log('8. 清理测试文件...');
    await ossService.deleteFile(uploadResult.ossKey);
    console.log('✓ 测试文件已删除');
    console.log('');

    console.log('=== 所有测试完成 ✓ ===');

  } catch (error) {
    console.error('\n✗ 测试失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
}

// 运行测试
testOssService();
