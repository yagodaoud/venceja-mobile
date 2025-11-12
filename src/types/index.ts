// Status Types
export type BoletoStatus = 'PENDENTE' | 'VENCIDO' | 'PAGO';

// User
export interface User {
  id: number;
  email: string;
  nome?: string;
  cnpj?: string;
}

// Category
export interface BoletoCategoria {
  id: number;
  nome: string;
  cor: string; // hex color
}

export interface Categoria {
  id: number;
  userId: number;
  nome: string;
  cor: string;
  createdAt: string;
  updatedAt: string;
}

// Boleto
export interface Boleto {
  id: number;
  userId: number;
  fornecedor: string;
  valor: number;
  vencimento: string; // ISO date string
  codigoBarras?: string;
  imagemUrl?: string;
  status: BoletoStatus;
  categoria?: BoletoCategoria | null;
  comprovanteUrl?: string;
  semComprovante: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType?: string;
    expiresIn?: number;
    user: User;
  };
  message?: string;
}

export interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType?: string;
    expiresIn?: number;
  };
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateBoletoRequest {
  fornecedor: string;
  valor: number;
  vencimento: string; // DD/MM/YYYY format
  codigoBarras?: string;
  categoriaId?: number | null;
}

export interface UpdateBoletoRequest {
  fornecedor: string;
  valor: number;
  vencimento: string; // DD/MM/YYYY format
  codigoBarras?: string;
  categoriaId?: number | null;
}

export interface CreateCategoriaRequest {
  nome: string;
  cor: string; // hex color
}

export interface UpdateCategoriaRequest {
  nome: string;
  cor: string; // hex color
}

// Filter/Sort Types
export interface BoletoFilters {
  status?: BoletoStatus;
  dataInicio?: string; // DD/MM/YYYY
  dataFim?: string; // DD/MM/YYYY
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

