import apiClient from '../utils/request';
import type {
  Literature,
  LiteratureQuery,
  LiteratureCreateInput,
  LiteratureUpdateInput,
  PaginatedResponse,
  ReadUrlResponse,
  DownloadUrlResponse,
} from '../types/literatureTypes';

/**
 * 文献管理 API
 */
export const literatureApi = {
  /**
   * 获取文献列表
   */
  async getLiteratures(
    query?: LiteratureQuery
  ): Promise<PaginatedResponse<Literature>> {
    const response = await apiClient.get<PaginatedResponse<Literature>>(
      '/literatures',
      query as any
    );
    return response.data as PaginatedResponse<Literature>;
  },

  /**
   * 获取文献详情
   */
  async getLiteratureById(id: string): Promise<Literature> {
    const response = await apiClient.get<Literature>(`/literatures/${id}`);
    return response.data as Literature;
  },

  /**
   * 创建文献
   */
  async createLiterature(input: LiteratureCreateInput): Promise<Literature> {
    const response = await apiClient.post<Literature>('/literatures', input);
    return response.data as Literature;
  },

  /**
   * 更新文献
   */
  async updateLiterature(id: string, input: LiteratureUpdateInput): Promise<Literature> {
    const response = await apiClient.put<Literature>(`/literatures/${id}`, input);
    return response.data as Literature;
  },

  /**
   * 删除文献
   */
  async deleteLiterature(id: string): Promise<void> {
    await apiClient.delete(`/literatures/${id}`);
  },

  /**
   * 增加浏览次数
   */
  async incrementViewCount(id: string): Promise<{ viewCount: number }> {
    const response = await apiClient.post<{ viewCount: number }>(
      `/literatures/${id}/view`
    );
    return response.data as { viewCount: number };
  },

  /**
   * 增加下载次数
   */
  async incrementDownloadCount(id: string): Promise<{ downloadCount: number }> {
    const response = await apiClient.post<{ downloadCount: number }>(
      `/literatures/${id}/download`
    );
    return response.data as { downloadCount: number };
  },

  /**
   * 获取阅读 URL（用于在线预览）
   */
  async getReadUrl(id: string): Promise<ReadUrlResponse> {
    const response = await apiClient.get<ReadUrlResponse>(
      `/literatures/${id}/read-url`
    );
    return response.data as ReadUrlResponse;
  },

  /**
   * 获取下载 URL
   */
  async getDownloadUrl(id: string): Promise<DownloadUrlResponse> {
    const response = await apiClient.get<DownloadUrlResponse>(
      `/literatures/${id}/download-url`
    );
    return response.data as DownloadUrlResponse;
  },
};
