import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { Student } from '../types';

export const studentService = {
  // Fetch all students
  getAllStudents: async (): Promise<Student[]> => {
    const response = await axios.get(API_ENDPOINTS.STUDENTS.LIST);
    return response.data;
  },

  // Update a student's fee status or details
  updateStudent: async (id: string, data: Partial<Student>): Promise<Student> => {
    const response = await axios.put(API_ENDPOINTS.STUDENTS.UPDATE(id), data);
    return response.data;
  },

  // Search students by name or registration number
  searchStudents: async (query: string): Promise<Student[]> => {
    const response = await axios.get(`${API_ENDPOINTS.STUDENTS.LIST}?search=${query}`);
    return response.data;
  }
};