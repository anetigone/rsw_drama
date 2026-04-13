import apiClient from '../utils/request';
import type {
  PresignedUrlRequest,
  PresignedUrlResponse,
  UploadConfirmRequest,
  Literature,
} from '../types/literatureTypes';

/**
 * 文件上传 API
 */
export const uploadApi = {
  /**
   * 获取预签名上传 URL
   */
  async getPresignedUrl(
    request: PresignedUrlRequest
  ): Promise<PresignedUrlResponse> {
    const response = await apiClient.post<PresignedUrlResponse>(
      '/upload/presigned-url',
      request
    );
    return response.data as PresignedUrlResponse;
  },

  /**
   * 上传文件到 OSS
   */
  async uploadToOSS(
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return apiClient.uploadToOSS(uploadUrl, file, onProgress);
  },

  /**
   * 确认上传完成，创建文献记录
   */
  async confirmUpload(request: UploadConfirmRequest): Promise<Literature> {
    const response = await apiClient.post<Literature>('/upload/confirm', request);
    return response.data as Literature;
  },

  /**
   * 完整的上传流程
   * 1. 获取 PDF 和封面的预签名 URL
   * 2. 上传 PDF 到 OSS
   * 3. 上传封面到 OSS
   * 4. 确认上传并创建文献记录
   */
  async uploadLiterature(
    file: File,
    metadata: {
      title: string;
      author: string;
      year: number;
      description?: string;
      category: string;
      totalPages?: number;
      cover?: File;
    },
    onProgress?: (progress: number) => void
  ): Promise<Literature> {
    // 1. 获取 PDF 预签名 URL
    onProgress?.(5);
    const pdfPresignedUrlResponse = await this.getPresignedUrl({
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
    });

    // 2. 获取封面预签名 URL（使用 UUID 生成唯一文件名）
    onProgress?.(10);
    const coverFileName = `${crypto.randomUUID()}_cover.jpg`;
    const coverPresignedUrlResponse = await this.getPresignedUrl({
      fileName: coverFileName,
      fileSize: 500000, // 预估封面大小（约500KB）
      contentType: 'image/jpeg',
    });

    // 3. 上传 PDF 到 OSS
    onProgress?.(20);
    await this.uploadToOSS(pdfPresignedUrlResponse.uploadUrl, file, (progress) => {
      // 映射上传进度到 20-60%
      onProgress?.(20 + Math.floor(progress * 0.4));
    });

    // 4. 上传封面到 OSS（封面已在前端处理）
    onProgress?.(60);
    const coverFile = metadata.cover;
    if (coverFile) {
      await this.uploadToOSS(coverPresignedUrlResponse.uploadUrl, coverFile, (progress) => {
        // 映射上传进度到 60-80%
        onProgress?.(60 + Math.floor(progress * 0.2));
      });
    }

    // 5. 确认上传并创建文献记录
    onProgress?.(80);
    const { cover, ...metadataToSend } = metadata; // 分离 cover 字段
    const literature = await this.confirmUpload({
      ossKey: pdfPresignedUrlResponse.ossKey,
      metadata: metadataToSend,
      fileInfo: {
        fileSize: file.size,
        fileName: file.name,
      },
      coverUrl: coverPresignedUrlResponse.ossKey, // 发送封面 OSS key
    });

    onProgress?.(100);
    return literature;
  },
};
