import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export interface AnnouncementData {
  title: string;
  content: string;
  category: 'General' | 'Academic' | 'Holiday' | 'Event';
  date: string;
}

export const announcementService = {
  createAnnouncement: async (data: AnnouncementData) => {
    const response = await axios.post(API_ENDPOINTS.ANNOUNCEMENTS.ADMIN, data);
    return response.data;
  },
  
  deleteAnnouncement: async (id: string) => {
    await axios.delete(`${API_ENDPOINTS.ANNOUNCEMENTS.ADMIN}/${id}`);
  }
};