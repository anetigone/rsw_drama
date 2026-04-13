import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OssService } from '../oss.service';
import { ossClient } from '../../config/oss';
import logger from '../../utils/logger';

// Mock OSS client
vi.mock('../../config/oss', () => ({
  ossClient: {
    put: vi.fn(),
    signatureUrlV4: vi.fn(),
    head: vi.fn(),
    delete: vi.fn(),
    deleteMulti: vi.fn(),
    list: vi.fn(),
  },
  ossConfig: {
    publicUrlBase: 'https://test-bucket.oss-cn-hangzhou.aliyuncs.com',
  },
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

describe('OssService', () => {
  let ossService: OssService;

  beforeEach(() => {
    ossService = new OssService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateOssKey', () => {
    it('should generate a unique OSS key with date path', () => {
      const fileName = 'test-document.pdf';
      const key = (ossService as any).generateOssKey(fileName);

      expect(key).toMatch(/^literatures\/\d{4}\/\d{2}\/[a-f0-9-]+\.pdf$/);
    });

    it('should handle files with multiple extensions', () => {
      const fileName = 'archive.tar.gz';
      const key = (ossService as any).generateOssKey(fileName);

      expect(key).toMatch(/^literatures\/\d{4}\/\d{2}\/[a-f0-9-]+\.gz$/);
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully and return URL', async () => {
      const mockResult = {
        name: 'literatures/2024/01/test-key.pdf',
        url: 'https://test-bucket.oss-cn-hangzhou.aliyuncs.com/literatures/2024/01/test-key.pdf',
      };
      vi.mocked(ossClient.put).mockResolvedValue(mockResult as any);

      const result = await ossService.uploadFile('test.pdf', Buffer.from('test'), 'application/pdf');

      expect(ossClient.put).toHaveBeenCalledWith(
        expect.stringMatching(/^literatures\/\d{4}\/\d{2}\//),
        expect.any(Buffer),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/pdf',
            'x-oss-object-acl': 'public-read',
          }),
        })
      );
      expect(result.ossKey).toBe(mockResult.name);
      expect(result.publicUrl).toBe(mockResult.url);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw error when upload fails', async () => {
      const error = new Error('Upload failed');
      vi.mocked(ossClient.put).mockRejectedValue(error);

      await expect(
        ossService.uploadFile('test.pdf', Buffer.from('test'), 'application/pdf')
      ).rejects.toThrow('Upload failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('generatePresignedUploadUrl', () => {
    it('should generate presigned upload URL', async () => {
      const mockUrl = 'https://test-bucket.oss-cn-hangzhou.aliyuncs.com/presigned-url';
      vi.mocked(ossClient.signatureUrlV4).mockResolvedValue(mockUrl);

      const result = await ossService.generatePresignedUploadUrl('test.pdf', 'application/pdf', 3600);

      expect(ossClient.signatureUrlV4).toHaveBeenCalledWith(
        'PUT',
        3600,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/pdf',
          }),
        }),
        expect.stringMatching(/^literatures\/\d{4}\/\d{2}\//)
      );
      expect(result.uploadUrl).toBe(mockUrl);
      expect(result.expiresIn).toBe(3600);
    });
  });

  describe('generatePresignedReadUrl', () => {
    it('should generate presigned read URL', async () => {
      const mockUrl = 'https://test-bucket.oss-cn-hangzhou.aliyuncs.com/read-url';
      vi.mocked(ossClient.signatureUrlV4).mockResolvedValue(mockUrl);

      const result = await ossService.generatePresignedReadUrl('test-key.pdf', 3600);

      expect(ossClient.signatureUrlV4).toHaveBeenCalledWith(
        'GET',
        3600,
        expect.objectContaining({
          headers: {},
          queries: expect.objectContaining({
            'response-content-disposition': 'inline',
          }),
        }),
        'test-key.pdf'
      );
      expect(result).toBe(mockUrl);
    });
  });

  describe('getPublicUrl', () => {
    it('should construct public URL correctly', () => {
      const url = ossService.getPublicUrl('literatures/2024/01/test.pdf');
      expect(url).toBe('https://test-bucket.oss-cn-hangzhou.aliyuncs.com/literatures/2024/01/test.pdf');
    });
  });

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      vi.mocked(ossClient.head).mockResolvedValue({ status: 200 } as any);

      const result = await ossService.fileExists('test-key.pdf');
      expect(result).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      const error = new Error('NoSuchKey') as any;
      error.code = 'NoSuchKey';
      vi.mocked(ossClient.head).mockRejectedValue(error);

      const result = await ossService.fileExists('test-key.pdf');
      expect(result).toBe(false);
    });

    it('should throw error for non-NoSuchKey errors', async () => {
      const error = new Error('Network error');
      vi.mocked(ossClient.head).mockRejectedValue(error);

      await expect(ossService.fileExists('test-key.pdf')).rejects.toThrow('Network error');
    });
  });

  describe('getFileInfo', () => {
    it('should return file information', async () => {
      const mockResult = {
        status: 200,
        res: {
          headers: {
            'content-length': '1024',
            'content-type': 'application/pdf',
            'last-modified': 'Wed, 21 Oct 2015 07:28:00 GMT',
          },
        },
      };
      vi.mocked(ossClient.head).mockResolvedValue(mockResult as any);

      const result = await ossService.getFileInfo('test-key.pdf');

      expect(result).toEqual({
        size: '1024',
        contentType: 'application/pdf',
        lastModified: 'Wed, 21 Oct 2015 07:28:00 GMT',
      });
    });

    it('should throw error when getting file info fails', async () => {
      const error = new Error('Failed to get file info');
      vi.mocked(ossClient.head).mockRejectedValue(error);

      await expect(ossService.getFileInfo('test-key.pdf')).rejects.toThrow('Failed to get file info');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      vi.mocked(ossClient.delete).mockResolvedValue({} as any);

      await ossService.deleteFile('test-key.pdf');

      expect(ossClient.delete).toHaveBeenCalledWith('test-key.pdf');
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw error when deletion fails', async () => {
      const error = new Error('Delete failed');
      vi.mocked(ossClient.delete).mockRejectedValue(error);

      await expect(ossService.deleteFile('test-key.pdf')).rejects.toThrow('Delete failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteFiles', () => {
    it('should delete multiple files successfully', async () => {
      vi.mocked(ossClient.deleteMulti).mockResolvedValue({} as any);

      const keys = ['key1.pdf', 'key2.pdf', 'key3.pdf'];
      await ossService.deleteFiles(keys);

      expect(ossClient.deleteMulti).toHaveBeenCalledWith(keys);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Deleted 3 files'));
    });

    it('should throw error when batch deletion fails', async () => {
      const error = new Error('Batch delete failed');
      vi.mocked(ossClient.deleteMulti).mockRejectedValue(error);

      await expect(ossService.deleteFiles(['key1.pdf'])).rejects.toThrow('Batch delete failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('listFiles', () => {
    it('should list files with prefix', async () => {
      const mockResult = {
        objects: [
          { name: 'file1.pdf', size: 1024 },
          { name: 'file2.pdf', size: 2048 },
        ],
        isTruncated: false,
        nextMarker: null,
      };
      vi.mocked(ossClient.list).mockResolvedValue(mockResult as any);

      const result = await ossService.listFiles('literatures/2024/', 100);

      expect(ossClient.list).toHaveBeenCalledWith(
        {
          prefix: 'literatures/2024/',
          'max-keys': 100,
        },
        {}
      );
      expect(result.objects).toHaveLength(2);
      expect(result.isTruncated).toBe(false);
    });

    it('should list all files when no prefix provided', async () => {
      const mockResult = {
        objects: [],
        isTruncated: false,
        nextMarker: null,
      };
      vi.mocked(ossClient.list).mockResolvedValue(mockResult as any);

      const result = await ossService.listFiles();

      expect(ossClient.list).toHaveBeenCalledWith(
        {
          prefix: undefined,
          'max-keys': 100,
        },
        {}
      );
      expect(result.objects).toEqual([]);
    });

    it('should throw error when list operation fails', async () => {
      const error = new Error('List failed');
      vi.mocked(ossClient.list).mockRejectedValue(error);

      await expect(ossService.listFiles()).rejects.toThrow('List failed');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle default maxKeys parameter', async () => {
      const mockResult = {
        objects: [],
        isTruncated: false,
        nextMarker: null,
      };
      vi.mocked(ossClient.list).mockResolvedValue(mockResult as any);

      await ossService.listFiles('test/');

      expect(ossClient.list).toHaveBeenCalledWith(
        expect.objectContaining({
          'max-keys': 100,
        }),
        {}
      );
    });

    it('should handle custom maxKeys parameter', async () => {
      const mockResult = {
        objects: [],
        isTruncated: false,
        nextMarker: null,
      };
      vi.mocked(ossClient.list).mockResolvedValue(mockResult as any);

      await ossService.listFiles('test/', 50);

      expect(ossClient.list).toHaveBeenCalledWith(
        expect.objectContaining({
          'max-keys': 50,
        }),
        {}
      );
    });
  });
});
