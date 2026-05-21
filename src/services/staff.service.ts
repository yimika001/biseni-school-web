import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { Staff } from '../types';

export const staffService = {
  getAllStaff: async (): Promise<Staff[]> => {
    const response = await axios.get(API_ENDPOINTS.STAFF.LIST);
    return response.data;
  },

  addStaff: async (data: Omit<Staff, 'id'>): Promise<Staff> => {
    const response = await axios.post(API_ENDPOINTS.STAFF.CREATE, data);
    return response.data;
  },

  deleteStaff: async (id: string): Promise<void> => {
    await axios.delete(API_ENDPOINTS.STAFF.DELETE(id));
  }
};