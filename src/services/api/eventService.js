import api from './authService';
import { API_ENDPOINTS } from '../../utils/constants';

export const eventService = {
  async createEvent(eventData) {
  try {
    const response = await api.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
    return response.data;
  } catch (error) {
    throw error;
  }
},

async deleteEvent(id) {
  try {
    const response = await api.delete(API_ENDPOINTS.EVENTS.DELETE(id));
    return response.data;
  } catch (error) {
    throw error;
  }
},
  async getEvents(params = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.EVENTS.LIST, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getEvent(id) {
    try {
      const response = await api.get(API_ENDPOINTS.EVENTS.GET(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async registerForEvent(id) {
    try {
      const response = await api.post(API_ENDPOINTS.EVENTS.REGISTER(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};