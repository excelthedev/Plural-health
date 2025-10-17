import { api, endpoints } from "@/lib/api";

export interface PatientIdentity {
  type: string;
  number: string;
  isActive?: boolean;
  issuedBy?: string;
  issuedDate?: string;
  expiryDate?: string;
}

export interface PatientInsurance {
  hasInsurance: boolean;
  insurer?: string;
  plan?: string;
  memberId?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  coverageDetails?: string;
}

export interface PatientAddress {
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
}

export interface PatientPhoto {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: string;
}

export interface CreatePatientData {
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  primaryPhone: string;
  email?: string;
  address: PatientAddress;
  identities?: PatientIdentity[];
  insurance?: PatientInsurance;
  facilityId: string;
}

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: string;
  dateOfBirth: string;
  primaryPhone: string;
  email?: string;
  address: PatientAddress;
  identities: PatientIdentity[];
  insurance: PatientInsurance;
  photo?: PatientPhoto;
  facilityId: string;
  patientCode: string;
  walletBalance: number;
  currency: string;
  isActive: boolean;
  isNewPatient: boolean;
  createdBy: string;
  updatedBy?: string;
  createdFromIP?: string;
  createdFromDevice?: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  age: number;
}

export interface DuplicateCheckData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  primaryPhone: string;
  facilityId: string;
}

export interface DuplicatePatient {
  id: string;
  name: string;
  phone: string;
  patientCode: string;
  dateOfBirth: string;
  email?: string;
}

export interface DuplicateCheckResponse {
  hasDuplicates: boolean;
  duplicates: DuplicatePatient[];
}

export interface CreatePatientResponse {
  success: boolean;
  message: string;
  data?: Patient;
  duplicates?: DuplicatePatient[];
}

export interface PatientsListResponse {
  success: boolean;
  data: {
    patients: Patient[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      recordsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface PatientResponse {
  success: boolean;
  data: Patient;
}

// Format phone number to E.164 format
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Handle Nigerian numbers
  if (digits.startsWith("234")) {
    return "+" + digits;
  } else if (digits.startsWith("0")) {
    return "+234" + digits.substring(1);
  } else if (digits.length === 10) {
    return "+234" + digits;
  }

  return phone; // Return as-is if already formatted
};

// Validate phone number format
export const validatePhoneNumber = (phone: string): boolean => {
  const formatted = formatPhoneNumber(phone);
  return /^\+[1-9]\d{1,14}$/.test(formatted);
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate date of birth
export const validateDateOfBirth = (dateOfBirth: string): boolean => {
  const date = new Date(dateOfBirth);
  return date < new Date();
};

// Patient service functions
export const patientService = {
  // Create a new patient
  createPatient: async (
    patientData: CreatePatientData,
    photoFile?: File
  ): Promise<CreatePatientResponse> => {
    try {
      const formData = new FormData();

      // Add patient data
      Object.entries(patientData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Add photo if provided
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const response = await api.post("/patients", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create patient"
      );
    }
  },

  // Check for duplicate patients
  checkDuplicates: async (
    data: DuplicateCheckData
  ): Promise<DuplicateCheckResponse> => {
    try {
      const response = await api.post("/patients/check-duplicates", data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to check for duplicates"
      );
    }
  },

  // Get patients list with pagination and filters
  getPatients: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      facilityId?: string;
      gender?: string;
      hasInsurance?: boolean;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ): Promise<PatientsListResponse> => {
    try {
      const response = await api.get("/patients", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch patients"
      );
    }
  },

  // Get single patient by ID
  getPatient: async (id: string): Promise<PatientResponse> => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch patient"
      );
    }
  },

  // Update patient
  updatePatient: async (
    id: string,
    patientData: Partial<CreatePatientData>,
    photoFile?: File
  ): Promise<PatientResponse> => {
    try {
      const formData = new FormData();

      // Add patient data
      Object.entries(patientData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Add photo if provided
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const response = await api.put(`/patients/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update patient"
      );
    }
  },

  // Delete patient (soft delete)
  deletePatient: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/patients/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete patient"
      );
    }
  },

  // Upload patient photo
  uploadPhoto: async (
    file: File
  ): Promise<{ url: string; filename: string }> => {
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await api.post("/patients/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to upload photo"
      );
    }
  },
};

export default patientService;
