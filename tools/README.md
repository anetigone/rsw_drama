# Word文档转HTML工具

## 功能说明

这个工具可以帮助你将包含图片的Word文档转换为HTML格式，并自动处理图片提取和路径调整，生成可直接用于活动详情的HTML内容。

## 安装依赖

在项目根目录下运行：

```bash
npm install
```

## 使用方法

1. **准备Word文档**：确保Word文档包含你想要转换的内容和图片。

2. **运行转换工具**：

```bash
node tools/wordToHtmlConverter.js <word文档路径> <活动ID>
```

例如：

```bash
node tools/wordToHtmlConverter.js ./activity1.docx 1
```

3. **复制生成的HTML**：
   - 工具会在控制台输出转换后的HTML内容
   - 同时会在 `tools/temp/` 目录下生成一个HTML文件
   - 将生成的HTML内容复制到 `src/utils/activityData.ts` 中对应活动的 `content` 字段

## 注意事项

1. **图片处理**：
   - 工具会自动提取Word文档中的图片
   - 图片会保存在 `public/images/activities/activity_<活动ID>/` 目录下
   - 图片文件名将自动生成为 `<时间戳>_<随机数>.jpg`

2. **样式处理**：
   - 工具会自动为HTML元素添加样式，包括：
     - 图片：最大宽度100%，自动高度，20px上下边距，8px圆角
     - 段落：20px下边距
     - 标题：字体设置，30px上边距，15px下边距，粗体
     - 列表：20px上下边距，20px左边距，列表项10px下边距

3. **路径处理**：
   - 工具会自动将图片路径调整为绝对路径 `/images/activities/图片文件名.jpg`
   - 这样图片可以在项目中正确显示

## 示例

### 输入：
```bash
node tools/wordToHtmlConverter.js ./我的活动文档.docx 2
```

### 输出：
```
开始转换Word文档: ./我的活动文档.docx
创建活动图片文件夹: activity_2
提取图片: 1620000000000_123.jpg
提取图片: 1620000000000_456.jpg
转换完成！

转换结果已保存到: tools/temp/activity_2_content.html

请将以下内容复制到 src/utils/activityData.ts 中对应活动的 content 字段:
==================================================
<p>这是活动的详细内容...</p>
<img src="/images/activities/activity_2/1620000000000_123.jpg" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px;">
<h3>活动背景</h3>
<p>活动的背景信息...</p>
==================================================
```

## 故障排除

1. **依赖安装失败**：
   - 确保使用的是Node.js 14.0或更高版本
   - 尝试使用 `npm install --force` 强制安装

2. **转换失败**：
   - 确保Word文档格式正确
   - 检查文档是否被其他程序占用
   - 查看控制台错误信息以获取详细信息

3. **图片不显示**：
   - 确保图片已正确复制到 `public/images/activities/` 目录
   - 检查HTML中的图片路径是否正确
   - 确保路径使用的是绝对路径（以 `/` 开头）

## 扩展功能

如果你需要进一步定制转换过程，可以修改 `wordToHtmlConverter.js` 文件中的：

1. **`processHtml` 函数**：调整HTML元素的样式
2. **`convertWordToHtml` 函数**：修改图片处理逻辑
3. **`config` 对象**：调整输出目录和临时目录
