const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  
  // Public & Academic Data
  ANNOUNCEMENTS: {
    PUBLIC: `${API_BASE_URL}/announcements/public`,
    ADMIN: `${API_BASE_URL}/announcements`,
  },

  // Student Management (Admin & Portal)
  STUDENTS: {
    LIST: `${API_BASE_URL}/students`,
    CREATE: `${API_BASE_URL}/students/register`,
    DETAILS: (id: string) => `${API_BASE_URL}/students/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/students/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/students/${id}`,
    RESULTS: (id: string) => `${API_BASE_URL}/students/${id}/results`,
    FEES_STATUS: (id: string) => `${API_BASE_URL}/students/${id}/fees`,
  },

  // Staff Management (Admin)
  STAFF: {
    LIST: `${API_BASE_URL}/staff`,
    CREATE: `${API_BASE_URL}/staff/add`,
    DETAILS: (id: string) => `${API_BASE_URL}/staff/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/staff/${id}`,
  },

  // Academic Records
  RESULTS: {
    UPLOAD: `${API_BASE_URL}/results/upload`,
    BULK_UPDATE: `${API_BASE_URL}/results/bulk`,
    TERM_SUMMARY: (studentId: string, term: string) => `${API_BASE_URL}/results/${studentId}/${term}`,
  },

  // School Operations
  TIMETABLE: {
    GET_BY_CLASS: (className: string) => `${API_BASE_URL}/timetable/${className}`,
    UPDATE: `${API_BASE_URL}/timetable/update`,
  },

  // Admin Specific Stats
  ADMIN: {
    STATS: `${API_BASE_URL}/admin/stats`,
    ACTIVITY_LOGS: `${API_BASE_URL}/admin/logs`,
  }
};

// Standard Axios Config Values
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export default API_BASE_URL;