export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

export function successResponse<T>(data: T, message = '操作成功'): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

export function paginatedResponse<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number
): ApiResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / pageSize);

  return successResponse({
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  });
}
