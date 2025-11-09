import axios, { AxiosInstance, AxiosError } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { LoginRequest, LoginResponse, Boleto, CreateBoletoRequest, UpdateBoletoRequest, PaginatedResponse, Categoria, CreateCategoriaRequest, UpdateCategoriaRequest, BoletoFilters } from '@/types';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8080/api/v1';

class ApiClient {
  public client: AxiosInstance;

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

    // Response interceptor - handle 401
    // Note: Logout is handled in AppNavigator to avoid circular dependency
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear token - store will handle logout on next auth check
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('auth_user');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', data);
    return response.data;
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

    const response = await this.client.post<{ data: Boleto } | Boleto>('/boletos/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return 'data' in response.data ? response.data.data : response.data;
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

