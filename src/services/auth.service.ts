import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { User } from '@/types';

export const login = async (credentials: any): Promise<{ user: User; token: string }> => {
  const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  return response.data;
};