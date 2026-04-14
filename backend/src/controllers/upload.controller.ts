import { Request, Response } from 'express';
import { z } from 'zod';
import { ossClient } from '../config/oss';
import ossService from '../services/oss.service';
import literatureService from '../services/literature.service';
import { successResponse } from '../utils/response';
import logger from '../utils/logger';

// 验证 schemas
const presignedUrlSchema = z.object({
  fileName: z.string().min(1, '文件名不能为空'),
  fileSize: z.number().int().positive('文件大小必须大于0'),
  contentType: z.string().min(1, '文件类型不能为空'),
});

const confirmUploadSchema = z.object({
  ossKey: z.string().min(1, 'OSS Key 不能为空'),
  metadata: z.object({
    title: z.string().min(1, '标题不能为空'),
    author: z.string().min(1, '作者不能为空'),
    year: z.number().int().min(1900).max(new Date().getFullYear()),
    description: z.string().optional(),
    category: z.string().min(1, '分类不能为空'),
    totalPages: z.number().int().positive().optional(),
  }),
  fileInfo: z.object({
    fileSize: z.number().int().positive(),
    fileName: z.string().min(1),
  }).optional(),
  coverUrl: z.string().optional(), // 客户端已上传的封面 OSS key
});

export class UploadController {
  /**
   * 获取预签名上传 URL (客户端直传)
   */
  async getPresignedUrl(req: Request, res: Response) {
    try {
      const { fileName, fileSize, contentType } = presignedUrlSchema.parse(req.body);

      // 验证文件类型
      const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['application/pdf', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(contentType)) {
        logger.warn(`Attempt to upload unsupported file type: ${contentType}`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: `只支持 ${allowedTypes.join(', ')} 文件`,
          },
        });
      }

      // 验证文件大小 (默认最大 100MB)
      const maxSize = parseInt(process.env.MAX_FILE_SIZE || '104857600');
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

      return res.json(successResponse(result, '预签名 URL 生成成功'));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.issues[0].message,
          },
        });
      }

      logger.error('Error generating presigned URL', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '生成预签名 URL 失败',
        },
      });
    }
  }

  /**
   * 获取封面上传的预签名 URL
   */
  async getCoverPresignedUrl(req: Request, res: Response) {
    try {
      const { literatureId } = req.params;

      if (!literatureId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '文献 ID 不能为空',
          },
        });
      }

      // 生成封面图片的 OSS 键
      const ossKey = `covers/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${literatureId}.jpg`;

      // 生成预签名 URL
      const uploadUrl = await ossClient.signatureUrlV4(
        'PUT',
        3600,
        {
          headers: {
            'Content-Type': 'image/jpeg',
          },
        },
        ossKey
      );

      return res.json(successResponse({
        uploadUrl,
        ossKey,
        expiresIn: 3600,
      }, '封面上传预签名 URL 生成成功'));
    } catch (error) {
      logger.error('Error generating cover presigned URL', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '生成封面预签名 URL 失败',
        },
      });
    }
  }

  /**
   * 确认上传完成，创建文献记录
   * 客户端已完成：
   * - PDF 上传到 OSS
   * - PDF 处理和封面提取
   * - 封面上传到 OSS
   * 服务端只负责创建数据库记录
   */
  async confirmUpload(req: Request, res: Response) {
    try {
      const { ossKey, metadata, fileInfo, coverUrl } = confirmUploadSchema.parse(req.body);

      // 验证PDF文件是否已上传到 OSS
      const fileExists = await ossService.fileExists(ossKey);
      if (!fileExists) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: '文件未在 OSS 中找到，请先上传文件',
          },
        });
      }

      // 如果有封面，验证封面文件是否已上传
      if (coverUrl) {
        const coverExists = await ossService.fileExists(coverUrl);
        if (!coverExists) {
          logger.warn(`Cover file not found in OSS: ${coverUrl}`);
        }
      }

      // 获取文件信息
      let fileSize = fileInfo?.fileSize || 0;
      let fileName = fileInfo?.fileName || ossKey.split('/').pop() || 'unknown.pdf';

      if (!fileInfo) {
        try {
          const fileInfoFromOss = await ossService.getFileInfo(ossKey);
          fileSize = parseInt(fileInfoFromOss.size || '0');
        } catch (error) {
          logger.warn(`Failed to get file info from OSS: ${ossKey}`, error);
        }
      }

      // 创建文献记录
      const literatureData = {
        title: metadata.title,
        author: metadata.author,
        year: metadata.year,
        description: metadata.description,
        category: metadata.category, // 传递 category 名称，service 内部会转换为 categoryId
        totalPages: metadata.totalPages,
        ossKey,
        fileName,
        fileSize,
        mimeType: 'application/pdf',
        imageUrl: coverUrl || '', // 客户端已上传的封面 OSS key
      };

      const literature = await literatureService.createLiterature(literatureData);

      logger.info(`Literature created: ${literature.id} with cover: ${coverUrl || 'none'}`);

      return res.status(201).json(
        successResponse(literature, '文献创建成功')
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.issues[0].message,
          },
        });
      }

      logger.error('Error confirming upload', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '创建文献记录失败',
        },
      });
    }
  }
}

export default new UploadController();
