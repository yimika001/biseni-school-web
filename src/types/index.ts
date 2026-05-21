export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'staff';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean; // Ensure this is here!
}

// Ensure "export" is in front of this!
export interface StudentResult {
  subject: string;
  testScore: number;
  examScore: number;
  total: number;
  grade: string;
  remark: string;
}

export interface Student {
  id: string;
  regNumber: string;
  firstName: string;
  lastName: string;
  class: string;
  feesStatus: 'Paid' | 'Pending' | 'Part-Payment';
}

// User Roles
export type UserRole = 'admin' | 'staff' | 'student';

// Basic User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Student Interface
export interface Student {
  id: string;
  regNumber: string;
  firstName: string;
  lastName: string;
  class: string;
  feesStatus: 'Paid' | 'Pending' | 'Part-Payment';
  gender?: 'Male' | 'Female';
  parentContact?: string;
}

// Staff Interface (This fixes your error!)
export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string; // e.g., "Principal", "Class Teacher"
  department: 'Sciences' | 'Arts' | 'Commercial' | 'Administration' | 'Vocational';
  status: 'Active' | 'On Leave';
  subjects?: string[];
}

// Auth State Interface
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Results Interface
export interface Result {
  id: string;
  studentId: string;
  subject: string;
  testScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  term: 'First' | 'Second' | 'Third';
  session: string;
}