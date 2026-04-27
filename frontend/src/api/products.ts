import api from './axios';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  size?: string;
  variant?: string;
  wholesaleCost: number;
  retailPrice: number;
  reorderThreshold: number;
  leadTimeDays: number;
  isActive: boolean;
  currentStock: number;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  category: string;
  size?: string;
  variant?: string;
  wholesaleCost: number;
  retailPrice: number;
  reorderThreshold: number;
  leadTimeDays: number;
}

export interface UpdateProductRequest {
  sku?: string;
  name?: string;
  category?: string;
  size?: string;
  variant?: string;
  wholesaleCost?: number;
  retailPrice?: number;
  reorderThreshold?: number;
  leadTimeDays?: number;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const productsApi = {
  createProduct: async (productData: CreateProductRequest): Promise<{ success: boolean; message: string; data: Product }> => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductsResponse> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id: string): Promise<{ success: boolean; message: string; data: Product }> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<{ success: boolean; message: string; data: string[] }> => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  getStatistics: async (): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await api.get('/products/statistics');
    return response.data;
  },
};
