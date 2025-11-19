import { ApiResponse, ApiError } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw data as ApiError;
      }

      return data;
    } catch (error) {
      if (error && typeof error === 'object' && 'success' in error) {
        throw error;
      }

      throw {
        success: false,
        error: 'NetworkError',
        message: 'Failed to connect to server. Make sure the backend is running.',
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload for audio transcription
  async uploadFile<T>(endpoint: string, file: Blob, filename: string): Promise<T> {
    const formData = new FormData();
    formData.append('audio', file as any, filename);

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

      const data = await response.json();

      if (!response.ok) {
        throw data as ApiError;
      }

      return data;
    } catch (error) {
      if (error && typeof error === 'object' && 'success' in error) {
        throw error;
      }

      throw {
        success: false,
        error: 'NetworkError',
        message: 'Failed to upload file',
      } as ApiError;
    }
  }
}

export const api = new ApiClient(API_URL);
