import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

// 请求接口类型定义
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface Employee {
  id: number;
  name: string;
  age: number;
  email: string;
  dept: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  deviceCount: number;
}

export interface Device {
  id: number;
  name: string;
  model: string;
  categoryId: number;
  categoryName: string;
}

export interface LoginResponse {
  token: string;
  expires_in: number;
}

// API客户端类
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // 添加默认headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // 从AsyncStorage获取JWT令牌
    const token = await AsyncStorage.getItem('jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // 处理401未授权
      if (response.status === 401) {
        await AsyncStorage.removeItem('jwt_token');
        throw new Error('未授权，请重新登录');
      }

      // 处理其他HTTP错误
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient(API_BASE_URL);

// API模块
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<LoginResponse>('/api/auth/login', { username, password }),
};

export const employeeApi = {
  getList: (page = 1, perPage = 10) =>
    apiClient.get<Employee[]>(`/api/users?page=${page}&per_page=${perPage}`),

  getDetail: (id: number) =>
    apiClient.get<Employee>(`/api/users/${id}`),

  create: (data: Omit<Employee, 'id' | 'createdAt'>) =>
    apiClient.post<Employee>('/api/users', data),

  update: (id: number, data: Partial<Employee>) =>
    apiClient.put<Employee>(`/api/users/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/users/${id}`),
};

export const categoryApi = {
  getList: () =>
    apiClient.get<Category[]>('/api/categories'),

  getDetail: (id: number) =>
    apiClient.get(`/api/categories/${id}`),

  create: (data: { name: string }) =>
    apiClient.post<Category>('/api/categories', data),

  update: (id: number, data: { name: string }) =>
    apiClient.put<Category>(`/api/categories/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/categories/${id}`),
};

export const deviceApi = {
  getList: (categoryId?: number) => {
    const params = categoryId ? `?category_id=${categoryId}` : '';
    return apiClient.get<Device[]>(`/api/devices${params}`);
  },

  getDetail: (id: number) =>
    apiClient.get<Device>(`/api/devices/${id}`),

  create: (data: { name: string; model?: string; categoryId: number }) =>
    apiClient.post<Device>('/api/devices', data),

  update: (id: number, data: { name: string; model?: string; categoryId?: number }) =>
    apiClient.put<Device>(`/api/devices/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/devices/${id}`),
};
