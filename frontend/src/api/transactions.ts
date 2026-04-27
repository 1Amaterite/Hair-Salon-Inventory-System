import api from './axios';

export interface Transaction {
  id: string;
  productId: string;
  userId: string;
  type: 'INBOUND' | 'OUTBOUND' | 'USAGE' | 'ADJUSTMENT';
  quantity: number;
  remarks?: string;
  createdAt: string;
  product: {
    id: string;
    sku: string;
    name: string;
    category: string;
  };
  user: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
  currentStock: number;
}

export interface CreateTransactionRequest {
  productId: string;
  type: 'INBOUND' | 'OUTBOUND' | 'USAGE' | 'ADJUSTMENT';
  quantity: number;
  remarks?: string;
}

export interface TransactionsResponse {
  success: boolean;
  message: string;
  data: Transaction[];
  pagination: {
    limit: number;
    total: number;
    offset?: number;
  };
}

export const transactionsApi = {
  getTransactions: async (params?: {
    limit?: number;
    offset?: number;
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TransactionsResponse> => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  createTransaction: async (transactionData: CreateTransactionRequest): Promise<{ success: boolean; message: string; data: Transaction }> => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  getTransactionById: async (id: string): Promise<{ success: boolean; message: string; data: Transaction }> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  getTransactionSummary: async (params?: any): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await api.get('/transactions/summary', { params });
    return response.data;
  },

  getLowStockProducts: async (): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await api.get('/transactions/low-stock');
    return response.data;
  },

  getProductStock: async (productId: string): Promise<{ success: boolean; message: string; data: { productId: string; currentStock: number } }> => {
    const response = await api.get(`/transactions/product/${productId}/stock`);
    return response.data;
  },
};
