/**
 * 统一导出所有 API 模块
 */

export { literatureApi } from './literature';
export { uploadApi } from './upload';
export { categoryApi } from './category';
export { statisticsApi } from './statistics';
export { authApi } from './auth';
export { questionnaireApi } from './questionnaire';

// 重新导出类型
export type {
  Literature,
  LiteratureQuery,
  LiteratureCreateInput,
  LiteratureUpdateInput,
  PaginatedResponse,
  Category,
  Statistics,
  PresignedUrlRequest,
  PresignedUrlResponse,
  UploadConfirmRequest,
  ReadUrlResponse,
  DownloadUrlResponse,
} from '../types/literatureTypes';
