import api from './authService';
import { API_ENDPOINTS } from '../../utils/constants';

export const analyticsService = {
  async getOverview() {
    try {
      const response = await api.get(API_ENDPOINTS.ANALYTICS.OVERVIEW);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async trackEvent(eventData) {
    try {
      const response = await api.post(API_ENDPOINTS.ANALYTICS.TRACK, eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};