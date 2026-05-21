import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { Result } from '../types';

export const resultService = {
  // Upload results for a whole class
  uploadBulkResults: async (results: Partial<Result>[]): Promise<void> => {
    await axios.post(API_ENDPOINTS.RESULTS.UPLOAD, { results });
  },

  // Get a specific student's terminal report
  getStudentReport: async (studentId: string, term: string): Promise<Result[]> => {
    const response = await axios.get(API_ENDPOINTS.RESULTS.TERM_SUMMARY(studentId, term));
    return response.data;
  }
};