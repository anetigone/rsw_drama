import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { s3Client, ossConfig } from '../config/oss';
import logger from '../utils/logger';

export class OssService {
  /**
   * 生成预签名上传 URL
   */
  async generatePresignedUploadUrl(
    fileName: string,
    contentType: string,
    expiresIn = 3600
  ): Promise<{ uploadUrl: string; ossKey: string; expiresIn: number }> {
    // 生成唯一的 OSS 键
    const ext = fileName.split('.').pop();
    const uniqueId = uuidv4();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const ossKey = `literatures/${year}/${month}/${uniqueId}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: ossConfig.bucket,
      Key: ossKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

    logger.info(`Generated presigned upload URL for ${ossKey}`);

    return { uploadUrl, ossKey, expiresIn };
  }

  /**
   * 生成预签名下载/阅读 URL
   */
  async generatePresignedReadUrl(
    ossKey: string,
    expiresIn = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: ossConfig.bucket,
      Key: ossKey,
    });

    const readUrl = await getSignedUrl(s3Client, command, { expiresIn });

    logger.debug(`Generated presigned read URL for ${ossKey}`);

    return readUrl;
  }

  /**
   * 删除 OSS 文件
   */
  async deleteFile(ossKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: ossConfig.bucket,
      Key: ossKey,
    });

    await s3Client.send(command);

    logger.info(`Deleted file from OSS: ${ossKey}`);
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(ossKeys: string[]): Promise<void> {
    await Promise.all(ossKeys.map(key => this.deleteFile(key)));
  }
}

export default new OssService();
