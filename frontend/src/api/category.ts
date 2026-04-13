import apiClient from '../utils/request';
import type {
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
} from '../types/literatureTypes';

/**
 * 分类管理 API
 */
export const categoryApi = {
  /**
   * 获取所有分类
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data as Category[];
  },

  /**
   * 获取分类详情
   */
  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data as Category;
  },

  /**
   * 创建分类
   */
  async createCategory(input: CategoryCreateInput): Promise<Category> {
    const response = await apiClient.post<Category>('/categories', input);
    return response.data as Category;
  },

  /**
   * 更新分类
   */
  async updateCategory(id: string, input: CategoryUpdateInput): Promise<Category> {
    const response = await apiClient.put<Category>(`/categories/${id}`, input);
    return response.data as Category;
  },

  /**
   * 删除分类
   */
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
