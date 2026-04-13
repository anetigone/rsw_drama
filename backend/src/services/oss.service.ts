import { v4 as uuidv4 } from 'uuid';
import { ossClient, ossConfig } from '../config/oss';
import logger from '../utils/logger';

export class OssService {
  /**
   * 生成唯一的 OSS 键
   */
  private generateOssKey(fileName: string): string {
    const ext = fileName.split('.').pop();
    const uniqueId = uuidv4();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `literatures/${year}/${month}/${uniqueId}.${ext}`;
  }

  /**
   * 生成封面图片的 OSS 键
   */
  private generateCoverOssKey(literatureId: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `covers/${year}/${month}/${literatureId}.jpg`;
  }

  /**
   * 上传文件到 OSS
   */
  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<{ ossKey: string; publicUrl: string }> {
    const ossKey = this.generateOssKey(fileName);

    try {
      const result = await ossClient.put(ossKey, fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'x-oss-object-acl': 'private', // 设置为私有，通过预签名 URL 访问
          'x-oss-storage-class': 'Standard', // 标准存储类型
        },
      });

      // result.name 就是 OSS 中的 object key (即 ossKey)
      logger.info(`File uploaded to OSS: ${ossKey}`, {
        name: result.name,
        url: result.url,
      });

      return {
        ossKey: result.name, // 使用返回的 name 作为 ossKey
        publicUrl: result.url,
      };
    } catch (error) {
      logger.error('Failed to upload file to OSS', error);
      throw error;
    }
  }

  /**
   * 上传封面图片到 OSS
   */
  async uploadCoverImage(
    literatureId: string,
    imageBuffer: Buffer
  ): Promise<{ ossKey: string; publicUrl: string }> {
    const ossKey = this.generateCoverOssKey(literatureId);

    try {
      const result = await ossClient.put(ossKey, imageBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'x-oss-object-acl': 'public-read', // 设置为公共读,封面图片可以直接访问
          'x-oss-storage-class': 'Standard', // 标准存储类型
          'Cache-Control': 'public, max-age=31536000', // 缓存1年
        },
      });

      logger.info(`Cover image uploaded to OSS: ${ossKey}`, {
        name: result.name,
        url: result.url,
      });

      return {
        ossKey: result.name,
        publicUrl: result.url,
      };
    } catch (error) {
      logger.error('Failed to upload cover image to OSS', error);
      throw error;
    }
  }

  /**
   * 生成预签名上传 URL (用于客户端直传)
   */
  async generatePresignedUploadUrl(
    fileName: string,
    contentType: string,
    expiresIn = 3600
  ): Promise<{ uploadUrl: string; ossKey: string; expiresIn: number }> {
    // 检测是否为封面文件（通过文件名包含 'cover' 且内容类型为图片）
    const isCover = fileName.includes('cover') && contentType.startsWith('image/');

    let ossKey: string;
    if (isCover) {
      // 封面文件路径: covers/YYYY/MM/filename.jpg
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      ossKey = `covers/${year}/${month}/${fileName}`;
    } else {
      // PDF 文件路径: literatures/YYYY/MM/uuid.ext
      ossKey = this.generateOssKey(fileName);
    }

    try {
      // 使用 V4 签名 (推荐)
      // signatureUrlV4(method, expires, options, key)
      const uploadUrl = await ossClient.signatureUrlV4(
        'PUT',
        expiresIn,
        {
          headers: {
            'Content-Type': contentType,
            // 对于封面图片，添加 ACL 头
            ...(isCover && { 'x-oss-object-acl': 'public-read' }),
          },
        },
        ossKey
      );

      logger.info(`Generated presigned upload URL for ${ossKey} (isCover: ${isCover})`);

      return { uploadUrl, ossKey, expiresIn };
    } catch (error) {
      logger.error('Failed to generate presigned upload URL', error);
      throw error;
    }
  }

  /**
   * 生成预签名下载/阅读 URL
   */
  async generatePresignedReadUrl(
    ossKey: string,
    expiresIn = 3600
  ): Promise<string> {
    try {
      // 使用 V4 签名生成预签名 URL (推荐)
      // signatureUrlV4(method, expires, request, objectName)
      const readUrl = await ossClient.signatureUrlV4(
        'GET',
        expiresIn,
        {
          headers: {},
          // 添加查询参数，指示浏览器在线预览
          queries: {
            'response-content-disposition': 'inline',
          },
        },
        ossKey
      );

      logger.debug(`Generated presigned read URL for ${ossKey}`);

      return readUrl;
    } catch (error) {
      logger.error('Failed to generate presigned read URL', error);
      throw error;
    }
  }

  /**
   * 获取文件的公共访问 URL
   */
  getPublicUrl(ossKey: string): string {
    return `${ossConfig.publicUrlBase}/${ossKey}`;
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(ossKey: string): Promise<boolean> {
    try {
      await ossClient.head(ossKey);
      return true;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(ossKey: string) {
    try {
      const result = await ossClient.head(ossKey);
      const headers = result.res.headers as Record<string, string>;
      return {
        size: headers['content-length'],
        contentType: headers['content-type'],
        lastModified: headers['last-modified'],
      };
    } catch (error) {
      logger.error(`Failed to get file info for ${ossKey}`, error);
      throw error;
    }
  }

  /**
   * 删除 OSS 文件
   */
  async deleteFile(ossKey: string): Promise<void> {
    try {
      await ossClient.delete(ossKey);
      logger.info(`Deleted file from OSS: ${ossKey}`);
    } catch (error) {
      logger.error(`Failed to delete file ${ossKey} from OSS`, error);
      throw error;
    }
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(ossKeys: string[]): Promise<void> {
    try {
      await ossClient.deleteMulti(ossKeys);
      logger.info(`Deleted ${ossKeys.length} files from OSS`);
    } catch (error) {
      logger.error('Failed to delete multiple files from OSS', error);
      throw error;
    }
  }

  /**
   * 列举文件
   */
  async listFiles(prefix?: string, maxKeys = 100) {
    try {
      const result = await ossClient.list({
        prefix,
        'max-keys': maxKeys,
      }, {});

      return {
        objects: result.objects || [],
        isTruncated: result.isTruncated,
        nextMarker: result.nextMarker,
      };
    } catch (error) {
      logger.error('Failed to list files from OSS', error);
      throw error;
    }
  }
}

export default new OssService();
