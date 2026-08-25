import { ApiResponse, PaginatedResponse } from './common.types';

export type { ApiResponse, PaginatedResponse };

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface RequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

