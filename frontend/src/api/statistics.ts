import apiClient from '../utils/request';
import type { Statistics } from '../types/literatureTypes';

/**
 * 统计数据 API
 */
export const statisticsApi = {
  /**
   * 获取统计数据
   */
  async getStatistics(): Promise<Statistics> {
    const response = await apiClient.get<Statistics>('/statistics');
    return response.data as Statistics;
  },
};
