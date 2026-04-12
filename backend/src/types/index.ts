export interface LiteratureQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  author?: string;
  keyword?: string;
  sortBy?: 'uploadDate' | 'viewCount' | 'title' | 'year';
  sortOrder?: 'asc' | 'desc';
}

export interface UploadMetadata {
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  ossKey: string;
  expiresIn: number;
}

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

export interface LiteratureUpdateInput {
  title?: string;
  author?: string;
  year?: number;
  description?: string;
  category?: string;
  totalPages?: number;
}
