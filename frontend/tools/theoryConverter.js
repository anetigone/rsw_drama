#!/usr/bin/env node

/**
 * Word文档转HTML工具
 * 功能：
 * 1. 提取Word文档中的图片
 * 2. 转换Word文档为HTML
 * 3. 自动调整图片路径
 * 4. 生成可直接用于活动详情的HTML内容
 */

import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { JSDOM } from 'jsdom';

// 获取当前文件目录
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename).replace(/^\//, '');

// 配置参数
const config = {
  outputDir: path.join(__dirname, '..', 'public', 'images', 'theory'),
  contentDir: path.join(__dirname, '..', 'public', 'content', 'theory'),
  tempDir: path.join(__dirname, 'temp'),
};

// 确保输出目录存在
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// 确保内容目录存在
if (!fs.existsSync(config.contentDir)) {
  fs.mkdirSync(config.contentDir, { recursive: true });
}

// 确保临时目录存在
if (!fs.existsSync(config.tempDir)) {
  fs.mkdirSync(config.tempDir, { recursive: true });
}

/**
 * 转换Word文档为HTML
 * @param {string} inputPath - Word文档路径
 * @param {string} activityId - 活动ID
 * @returns {Promise<string>} 转换后的HTML内容
 */
async function convertWordToHtml(inputPath, activityId) {
  try {
    console.log(`开始转换Word文档: ${inputPath}`);
    
    // 创建活动专用的图片文件夹
    const activityImageDir = path.join(config.outputDir, `theory_${activityId}`);
    if (!fs.existsSync(activityImageDir)) {
      fs.mkdirSync(activityImageDir, { recursive: true });
      console.log(`创建活动图片文件夹: theory_${activityId}`);
    }
    
    // 使用mammoth转换Word文档
    const result = await mammoth.convertToHtml({
      path: inputPath
    }, {
      convertImage: mammoth.images.imgElement((image) => {
        return image.read().then((imageBuffer) => {
          // 生成唯一的图片文件名
          const imageName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
          const imagePath = path.join(activityImageDir, imageName);
          
          // 写入图片文件
          fs.writeFileSync(imagePath, imageBuffer);
          console.log(`提取图片: ${imageName}`);
          
          // 返回HTML img标签，使用绝对路径
          return {
            src: `/images/theory/theory_${activityId}/${imageName}`
          };
        });
      })
    });
    
    // 处理生成的HTML
    const html = result.value;
    const processedHtml = processHtml(html);
    
    console.log('转换完成！');
    return processedHtml;
  } catch (error) {
    console.error('转换失败:', error);
    throw error;
  }
}

/**
 * 处理HTML内容，添加样式和调整格式
 * @param {string} html - 原始HTML
 * @returns {string} 处理后的HTML
 */
function processHtml(html) {
  // 创建DOM对象
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // 处理图片，添加样式
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.margin = '20px 0';
    img.style.borderRadius = '8px';
  });
  
  // 处理段落，添加样式
  const paragraphs = document.querySelectorAll('p');
  paragraphs.forEach(p => {
    p.style.marginBottom = '20px';
  });
  
  // 处理标题，添加样式
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    heading.style.fontFamily = 'WenYueXHGuYaSong';
    heading.style.color = '#1a1a1a';
    heading.style.margin = '30px 0 15px';
    heading.style.fontWeight = 'bold';
  });
  
  // 处理列表，添加样式
  const lists = document.querySelectorAll('ul, ol');
  lists.forEach(list => {
    list.style.margin = '20px 0';
    list.style.paddingLeft = '20px';
  });
  
  const listItems = document.querySelectorAll('li');
  listItems.forEach(item => {
    item.style.marginBottom = '10px';
  });
  
  // 返回处理后的HTML
  return document.body.innerHTML;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('用法: node wordToHtmlConverter.js <word文档路径> <活动ID>');
    console.log('示例: node wordToHtmlConverter.js ./activity1.docx 1');
    process.exit(1);
  }
  
  const inputPath = args[0];
  const activityId = args[1];
  
  console.log(`输入路径: ${inputPath}`);
  console.log(`活动ID: ${activityId}`);
  
  if (!fs.existsSync(inputPath)) {
    console.error('错误: Word文档不存在');
    process.exit(1);
  }
  
  console.log(`文档存在: ${fs.existsSync(inputPath)}`);
  
  convertWordToHtml(inputPath, activityId)
    .then(html => {
      // 生成输出文件到内容目录
      const contentOutputPath = path.join(config.contentDir, `activity_${activityId}.html`);
      fs.writeFileSync(contentOutputPath, html);
      
      // 生成临时文件（可选）
      const tempOutputPath = path.join(config.tempDir, `activity_${activityId}_content.html`);
      fs.writeFileSync(tempOutputPath, html);
      
      console.log(`\n转换结果已保存到: ${contentOutputPath}`);
      console.log(`临时文件已保存到: ${tempOutputPath}`);
      console.log('\n请更新 src/utils/theoryData.ts 中的活动数据，确保 contentPath 指向正确的HTML文件路径:');
      console.log('==================================================');
      console.log(`contentPath: '/content/theory/theory_${activityId}.html'`);
      console.log('==================================================');
    })
    .catch(error => {
      console.error('转换失败:', error);
      process.exit(1);
    });
}

// 运行主函数
console.log('脚本开始执行');
console.log(`import.meta.url: ${import.meta.url}`);
console.log(`process.argv[1]: ${process.argv[1]}`);

try {
  main();
} catch (error) {
  console.error('执行出错:', error);
  process.exit(1);
}

export {
  convertWordToHtml,
  processHtml
};
