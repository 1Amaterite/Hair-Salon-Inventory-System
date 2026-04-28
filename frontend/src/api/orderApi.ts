import api from './axios';

export interface Order {
  id: string;
  orderNumber: string;
  transactionId: string;
  destinationId: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  transaction: {
    id: string;
    remarks?: string;
    createdAt: string;
    user: {
      name: string;
      username: string;
    };
    product: {
      name: string;
      sku: string;
      category: string;
    };
  };
  destination: {
    id: string;
    name: string;
    fullAddress: string;
    contactPerson?: string;
    contactNumber?: string;
    locationType: 'PERMANENT' | 'TEMPORARY';
  };
}

export interface CreateOrderData {
  transactionId: string;
  destinationId: string;
  expectedDeliveryDate?: string;
  notes?: string;
}

export interface UpdateOrderData {
  destinationId?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
}

const orderApi = {
  getAllActiveOrders: async (filters?: {
    search?: string;
    status?: string;
    destinationId?: string;
  }): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.destinationId) params.append('destinationId', filters.destinationId);

    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await api.post(`/orders`, data);
    return response.data;
  },

  updateOrder: async (id: string, data: UpdateOrderData): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  }
};

export default orderApi;
