import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mediaRequestService = {
  submitRequest: async (requestData) => {
    try {
      const response = await api.post('/media-requests', requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  trackRequest: async (trackingId) => {
    try {
      const response = await api.get(`/media-requests/track/${trackingId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRequestStatus: async (requestId) => {
    try {
      const response = await api.get(`/media-requests/status/${requestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelRequest: async (requestId, reason) => {
    try {
      const response = await api.put(`/media-requests/cancel/${requestId}`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;