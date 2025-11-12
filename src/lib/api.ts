import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import { LoginRequest, LoginResponse, RefreshTokenResponse, Boleto, CreateBoletoRequest, UpdateBoletoRequest, PaginatedResponse, Categoria, CreateCategoriaRequest, UpdateCategoriaRequest, BoletoFilters } from '@/types';
import { useAuthStore } from '@/store/authStore';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8080/api/v1';

// Get device info for session tracking
const getDeviceInfo = (): string => {
  return `${Device.modelName || 'Unknown'}, ${Device.osName || 'Unknown'} ${Device.osVersion || ''}`;
};

class ApiClient {
  public client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 with token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't already tried to refresh
        // Also skip if the request was to the refresh endpoint itself
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await SecureStore.getItemAsync('refresh_token');
            
            if (!refreshToken) {
              // No refresh token available, clear auth and reject
              await this.clearAuth();
              this.processQueue(null, new Error('No refresh token available'));
              return Promise.reject(error);
            }

            // Attempt to refresh the token
            const response = await axios.post<RefreshTokenResponse>(
              `${API_URL}/auth/refresh`,
              {
                refreshToken,
                deviceInfo: getDeviceInfo(),
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
            
            // Update tokens in store and secure storage
            await SecureStore.setItemAsync('auth_token', newAccessToken);
            if (newRefreshToken) {
              await SecureStore.setItemAsync('refresh_token', newRefreshToken);
            }

            // Update auth store
            const { setTokens } = useAuthStore.getState();
            await setTokens(newAccessToken, newRefreshToken);

            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            // Process queued requests
            this.processQueue(newAccessToken, null);

            // Retry the original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear auth and reject all queued requests
            await this.clearAuth();
            this.processQueue(null, refreshError);
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(token: string | null, error: any) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async clearAuth() {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    await SecureStore.deleteItemAsync('refresh_token');
    const { clearAuth } = useAuthStore.getState();
    await clearAuth();
  }

  // Auth
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', data, {
      headers: {
        'X-Device-Info': getDeviceInfo(),
      },
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await this.client.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
      deviceInfo: getDeviceInfo(),
    });
    return response.data;
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await this.client.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Even if logout fails on backend, we still clear local auth
      console.error('Logout error:', error);
    }
  }

  // Boletos
  async getBoletos(filters?: BoletoFilters): Promise<PaginatedResponse<Boleto>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dataInicio) params.append('dataInicio', filters.dataInicio);
    if (filters?.dataFim) params.append('dataFim', filters.dataFim);
    if (filters?.page !== undefined) params.append('page', filters.page.toString());
    if (filters?.size !== undefined) params.append('size', filters.size.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.direction) params.append('direction', filters.direction);

    const response = await this.client.get<PaginatedResponse<Boleto>>(`/boletos?${params.toString()}`);
    return response.data;
  }

  async createBoleto(data: CreateBoletoRequest): Promise<Boleto> {
    const response = await this.client.post<{ data: Boleto } | Boleto>('/boletos', data);
    return 'data' in response.data ? response.data.data : response.data;
  }

  async updateBoleto(id: number, data: UpdateBoletoRequest): Promise<Boleto> {
    const response = await this.client.put<{ data: Boleto } | Boleto>(`/boletos/${id}`, data);
    return 'data' in response.data ? response.data.data : response.data;
  }

  async deleteBoleto(id: number): Promise<void> {
    await this.client.delete(`/boletos/${id}`);
  }

  async scanBoleto(imageUri: string): Promise<Boleto> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await this.client.post<{ data: Boleto; message?: string; meta?: any } | Boleto>('/boletos/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Handle wrapped response: { data: Boleto, message: string, meta: any }
    let boleto: Boleto;
    const responseData = response.data;

    // Check if response has the structure: { data: {...}, message: "...", meta: ... }
    if (responseData && typeof responseData === 'object') {
      if ('data' in responseData && responseData.data !== null && typeof responseData.data === 'object') {
        boleto = (responseData as { data: Boleto; message?: string; meta?: any }).data;
      } else if ('id' in responseData && 'fornecedor' in responseData) {
        // Direct boleto object (has id and fornecedor fields)
        boleto = responseData as Boleto;
      } else {
        throw new Error('Unexpected response structure from API');
      }
    } else {
      throw new Error('Invalid response data from API');
    }

    if (!boleto) {
      throw new Error('No boleto data in response');
    }

    return boleto;
  }

  async markBoletoAsPaid(id: number, comprovanteUri?: string): Promise<Boleto> {
    const formData = new FormData();
    if (comprovanteUri) {
      const filename = comprovanteUri.split('/').pop() || 'comprovante.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('comprovante', {
        uri: comprovanteUri,
        name: filename,
        type,
      } as any);
    }

    const response = await this.client.put<Boleto>(`/boletos/${id}/pagar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Categories
  async getCategorias(page = 0, size = 10): Promise<PaginatedResponse<Categoria>> {
    const response = await this.client.get<PaginatedResponse<Categoria>>(
      `/categorias?page=${page}&size=${size}`
    );
    return response.data;
  }

  async createCategoria(data: CreateCategoriaRequest): Promise<Categoria> {
    const response = await this.client.post<{ data: Categoria } | Categoria>('/categorias', data);
    return 'data' in response.data ? response.data.data : response.data;
  }

  async updateCategoria(id: number, data: UpdateCategoriaRequest): Promise<Categoria> {
    const response = await this.client.put<{ data: Categoria } | Categoria>(`/categorias/${id}`, data);
    return 'data' in response.data ? response.data.data : response.data;
  }

  async deleteCategoria(id: number): Promise<void> {
    await this.client.delete(`/categorias/${id}`);
  }
}

export const apiClient = new ApiClient();

