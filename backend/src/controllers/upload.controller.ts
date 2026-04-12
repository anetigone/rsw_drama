import { Request, Response } from 'express';
import { z } from 'zod';
import ossService from '../services/oss.service';
import literatureService from '../services/literature.service';
import { successResponse } from '../utils/response';
import logger from '../utils/logger';

// 验证 schemas
const presignedUrlSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().int().positive(),
  contentType: z.string().min(1),
});

const confirmUploadSchema = z.object({
  ossKey: z.string().min(1),
  metadata: z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    year: z.number().int().min(1900).max(new Date().getFullYear()),
    description: z.string().optional(),
    category: z.string().min(1),
    totalPages: z.number().int().positive().optional(),
  }),
});

export class UploadController {
  /**
   * 获取预签名上传 URL
   */
  async getPresignedUrl(req: Request, res: Response) {
    const { fileName, fileSize, contentType } = presignedUrlSchema.parse(req.body);

    // 验证文件类型
    if (contentType !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: '只支持 PDF 文件',
        },
      });
    }

    // 验证文件大小 (默认最大 50MB)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '52428800');
    if (fileSize > maxSize) {
      return res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `文件大小不能超过 ${maxSize / 1024 / 1024}MB`,
        },
      });
    }

    const result = await ossService.generatePresignedUploadUrl(fileName, contentType);

    return res.json(successResponse(result));
  }

  /**
   * 确认上传完成,创建文献记录
   */
  async confirmUpload(req: Request, res: Response) {
    const { ossKey, metadata } = confirmUploadSchema.parse(req.body);

    // 从 ossKey 中提取文件名
    const fileName = ossKey.split('/').pop() || 'unknown.pdf';

    // 这里假设 fileSize 和 mimeType 从其他地方获取(可能需要前端传递)
    // 为了简化,我们使用默认值
    const literatureData = {
      ...metadata,
      ossKey,
      fileName,
      fileSize: 0, // 需要从其他地方获取
      mimeType: 'application/pdf',
    };

    const literature = await literatureService.createLiterature(literatureData);

    logger.info(`Created literature record for uploaded file: ${ossKey}`);

    return res.status(201).json(
      successResponse(literature, '文献创建成功')
    );
  }
}

export default new UploadController();
