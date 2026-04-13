// 文献接口
export interface Literature {
  id: string;
  title: string;
  author: string;
  year: number;
  description?: string;
  category: string;
  ossKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  totalPages?: number;
  uploadDate: string;
  updateDate: string;
  viewCount: number;
  downloadCount: number;
  imageUrl: string;
  urls?: {
    public: string;
    read: string | null;
    download: string;
  };
}

// 文献列表查询参数
export interface LiteratureQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  author?: string;
  keyword?: string;
  sortBy?: 'uploadDate' | 'viewCount' | 'title' | 'year';
  sortOrder?: 'asc' | 'desc';
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 文献创建数据
export interface LiteratureCreateInput {
  title: string;
  author: string;
  year: number;
  description?: string;
  category: string;
  ossKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  totalPages?: number;
}

// 文献更新数据
export interface LiteratureUpdateInput {
  title?: string;
  author?: string;
  year?: number;
  description?: string;
  category?: string;
  totalPages?: number;
}

// 分类接口
export interface Category {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  literatureCount?: number;
  createdAt?: string;
}

// 分类创建数据
export interface CategoryCreateInput {
  name: string;
  description?: string;
  sortOrder?: number;
}

// 分类更新数据
export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  sortOrder?: number;
}

// 统计数据接口
export interface Statistics {
  totalLiteratures: number;
  totalViews: number;
  totalDownloads: number;
  categories: Array<{
    name: string;
    count: number;
  }>;
}

// 上传相关接口
export interface PresignedUrlRequest {
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  ossKey: string;
  expiresIn: number;
}

export interface UploadConfirmMetadata {
  title: string;
  author: string;
  year: number;
  description?: string;
  category: string;
  totalPages?: number;
}

export interface UploadConfirmRequest {
  ossKey: string;
  metadata: UploadConfirmMetadata;
  fileInfo?: {
    fileSize: number;
    fileName: string;
  };
  coverUrl?: string; // 封面 OSS key
}

export interface ReadUrlResponse {
  readUrl: string;
  expiresIn: number;
  fileName: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  fileName: string;
  expiresIn: number;
}
