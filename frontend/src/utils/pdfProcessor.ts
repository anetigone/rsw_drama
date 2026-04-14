import * as pdfjsLib from 'pdfjs-dist';

// 配置 PDF.js worker - 使用 CDN 加载
// 这样可以避免本地 worker 文件的 MIME 类型问题
if (typeof window !== 'undefined') {
  const version = pdfjsLib.version;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
}

/**
 * PDF 元数据接口
 */
interface PDFMetadataInfo {
  Title?: string;
  Author?: string;
  Subject?: string;
  Keywords?: string;
  Creator?: string;
  [key: string]: any;
}

/**
 * PDF 处理结果接口
 */
export interface PDFProcessResult {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  pageCount: number;
}

/**
 * 处理 PDF 文件，提取元数据和页数
 */
export async function processPDF(file: File): Promise<PDFProcessResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

  // 提取元数据
  const metadata = await pdf.getMetadata().catch(() => null);
  const info: PDFMetadataInfo = (metadata?.info as PDFMetadataInfo) || {};

  return {
    title: info.Title || undefined,
    author: info.Author || undefined,
    subject: info.Subject || undefined,
    keywords: info.Keywords || undefined,
    creator: info.Creator || undefined,
    pageCount: pdf.numPages,
  };
}

/**
 * 提取 PDF 第一页作为封面图片
 */
export async function extractFirstPageAsCover(
  file: File,
  scale: number = 1.5,
  quality: number = 0.9
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1); // 获取第一页

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('无法创建 canvas 上下文');
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // 渲染 PDF 页面到 canvas
  const renderParameters = {
    canvasContext: context,
    canvas: canvas,
    viewport: viewport,
    intent: 'display', // 指定渲染意图: 'display' | 'print' | 'any'
    annotationMode: 2, // pdfjsLib.AnnotationMode.ENABLE - 启用注释渲染
    background: 'white', // 设置背景色
  };

  await page.render(renderParameters).promise;

  // 转换为 JPEG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('无法生成封面图片'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}