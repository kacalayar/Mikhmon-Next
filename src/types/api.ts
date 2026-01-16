// API Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ConnectionParams {
  host: string;
  port?: number;
  user: string;
  password: string;
  timeout?: number;
}

export interface SessionData {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  identity?: string;
  connected: boolean;
  lastConnected?: string;
}
