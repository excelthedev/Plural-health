import axios from "axios";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: "http://localhost:3001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  records: {
    list: "/records",
    stats: "/records/stats",
    filters: "/records/filters",
    single: (id: string) => `/records/${id}`,
  },
  users: {
    list: "/users",
    single: (id: string) => `/users/${id}`,
  },
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
} as const;

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Record {
  _id: string;
  patientName: string;
  patientCode: string;
  patientPhone: string;
  appointmentTime: string;
  clinic: string;
  status: string;
  appointmentType: string;
  walletBalance: number;
  currency: string;
  facilityName: string;
  isUrgent: boolean;
  cost: number;
  paymentStatus: string;
  notes: string;
  createdAt: string;
}

export interface RecordsResponse {
  records: Record[];
  pagination: PaginationInfo;
  filters: {
    search: string;
    clinic: string;
    status: string;
    startDate: string;
    endDate: string;
    sortBy: string;
    sortOrder: string;
  };
}

export interface StatsResponse {
  totalAppointments: number;
  urgentAppointments: number;
  statusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  clinicDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

export interface FilterOptions {
  clinics: string[];
  statuses: string[];
}
