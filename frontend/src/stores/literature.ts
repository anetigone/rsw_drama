import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { literatureApi } from '../api';
import type { Literature } from '../types/literatureTypes';

interface CachedUrl {
  url: string;
  expiry: number;
}

export const useLiteratureStore = defineStore('literature', () => {
  // State
  const literatures = ref<Literature[]>([]);
  const literatureMap = ref<Map<string, Literature>>(new Map());
  const loading = ref(false);
  const lastFetchTime = ref<number>(0);
  const cacheExpiry = 5 * 60 * 1000; // 5分钟缓存过期时间

  // PDF URL 缓存（有效期50分钟，比后端的1小时短一些，确保不会使用过期链接）
  const readUrlCache = ref<Map<string, CachedUrl>>(new Map());
  const downloadUrlCache = ref<Map<string, CachedUrl>>(new Map());
  const urlCacheExpiry = 50 * 60 * 1000; // 50分钟

  // Getters
  const hasLiteratures = computed(() => literatures.value.length > 0);
  const isCacheValid = computed(() => {
    return Date.now() - lastFetchTime.value < cacheExpiry;
  });

  // Actions
  const fetchLiteratures = async (forceRefresh = false) => {
    // 如果有缓存且未过期，且不强制刷新，直接返回缓存数据
    if (!forceRefresh && hasLiteratures.value && isCacheValid.value) {
      return literatures.value;
    }

    try {
      loading.value = true;
      const response = await literatureApi.getLiteratures({
        page: 1,
        pageSize: 50,
        sortBy: 'uploadDate',
        sortOrder: 'desc'
      });

      literatures.value = response.items;
      lastFetchTime.value = Date.now();

      // 同时更新单个文献的缓存
      response.items.forEach(lit => {
        literatureMap.value.set(lit.id, lit);
      });

      return response.items;
    } catch (error) {
      console.error('加载文献列表失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchLiteratureById = async (id: string, forceRefresh = false) => {
    // 检查缓存
    const cached = literatureMap.value.get(id);
    if (!forceRefresh && cached && isCacheValid.value) {
      return cached;
    }

    try {
      loading.value = true;
      const literature = await literatureApi.getLiteratureById(id);

      // 更新缓存
      literatureMap.value.set(id, literature);

      // 如果列表中有这条数据，也更新列表中的数据
      const index = literatures.value.findIndex(lit => lit.id === id);
      if (index !== -1) {
        literatures.value[index] = literature;
      }

      return literature;
    } catch (error) {
      console.error('加载文献详情失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const getReadUrl = async (id: string) => {
    const now = Date.now();
    const cached = readUrlCache.value.get(id);

    // 检查缓存是否有效
    if (cached && cached.expiry > now) {
      return cached.url;
    }

    // 缓存过期或不存在，重新获取
    try {
      const response = await literatureApi.getReadUrl(id);
      readUrlCache.value.set(id, {
        url: response.readUrl,
        expiry: now + urlCacheExpiry
      });
      return response.readUrl;
    } catch (error) {
      console.error('获取阅读URL失败:', error);
      throw error;
    }
  };

  const getDownloadUrl = async (id: string) => {
    const now = Date.now();
    const cached = downloadUrlCache.value.get(id);

    // 检查缓存是否有效
    if (cached && cached.expiry > now) {
      return cached.url;
    }

    // 缓存过期或不存在，重新获取
    try {
      const response = await literatureApi.getDownloadUrl(id);
      downloadUrlCache.value.set(id, {
        url: response.downloadUrl,
        expiry: now + urlCacheExpiry
      });
      return response.downloadUrl;
    } catch (error) {
      console.error('获取下载URL失败:', error);
      throw error;
    }
  };

  const clearCache = () => {
    literatures.value = [];
    literatureMap.value.clear();
    lastFetchTime.value = 0;
    readUrlCache.value.clear();
    downloadUrlCache.value.clear();
  };

  const getLiteratureFromCache = (id: string) => {
    return literatureMap.value.get(id);
  };

  return {
    // State
    literatures,
    loading,
    lastFetchTime,

    // Getters
    hasLiteratures,
    isCacheValid,

    // Actions
    fetchLiteratures,
    fetchLiteratureById,
    getReadUrl,
    getDownloadUrl,
    clearCache,
    getLiteratureFromCache
  };
});
