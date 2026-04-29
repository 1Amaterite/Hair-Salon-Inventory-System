import api from './axios';

export interface DeliveryDestination {
  id: string;
  name: string;
  fullAddress: string;
  contactPerson?: string;
  contactNumber?: string;
  locationType: 'PERMANENT' | 'TEMPORARY';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateDestinationData {
  name: string;
  fullAddress: string;
  contactPerson?: string;
  contactNumber?: string;
  locationType: 'PERMANENT' | 'TEMPORARY';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateDestinationData {
  name?: string;
  fullAddress?: string;
  contactPerson?: string;
  contactNumber?: string;
  locationType?: 'PERMANENT' | 'TEMPORARY';
  status?: 'ACTIVE' | 'INACTIVE';
}

const destinationApi = {
  getAllDestinations: async (filters?: {
    search?: string;
    locationType?: string;
    status?: string;
  }): Promise<DeliveryDestination[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.locationType) params.append('locationType', filters.locationType);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/destinations?${params.toString()}`);
    return response.data;
  },

  getDestinationById: async (id: string): Promise<DeliveryDestination> => {
    const response = await api.get(`/destinations/${id}`);
    return response.data;
  },

  createDestination: async (data: CreateDestinationData): Promise<DeliveryDestination> => {
    const response = await api.post(`/destinations`, data);
    return response.data;
  },

  updateDestination: async (id: string, data: UpdateDestinationData): Promise<DeliveryDestination> => {
    const response = await api.put(`/destinations/${id}`, data);
    return response.data;
  },

  deleteDestination: async (id: string): Promise<void> => {
    await api.delete(`/destinations/${id}`);
  }
};

export default destinationApi;
