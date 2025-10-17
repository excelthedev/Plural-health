import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  patientService,
  CreatePatientData,
  DuplicateCheckData,
} from "@/lib/services/patients";

// Query keys
export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (params: any) => [...patientKeys.lists(), params] as const,
  details: () => [...patientKeys.all, "detail"] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

// Hook to get patients list
export const usePatients = (
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
) => {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => patientService.getPatients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get single patient
export const usePatient = (id: string) => {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientService.getPatient(id),
    enabled: !!id,
  });
};

// Hook to create patient
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientData,
      photoFile,
    }: {
      patientData: CreatePatientData;
      photoFile?: File;
    }) => patientService.createPatient(patientData, photoFile),
    onSuccess: () => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
};

// Hook to update patient
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      patientData,
      photoFile,
    }: {
      id: string;
      patientData: Partial<CreatePatientData>;
      photoFile?: File;
    }) => patientService.updatePatient(id, patientData, photoFile),
    onSuccess: (data, variables) => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      // Update the specific patient in cache
      queryClient.setQueryData(patientKeys.detail(variables.id), data);
    },
  });
};

// Hook to delete patient
export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientService.deletePatient(id),
    onSuccess: () => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
};

// Hook to check for duplicates
export const useCheckDuplicates = () => {
  return useMutation({
    mutationFn: (data: DuplicateCheckData) =>
      patientService.checkDuplicates(data),
  });
};

// Hook to upload photo
export const useUploadPhoto = () => {
  return useMutation({
    mutationFn: (file: File) => patientService.uploadPhoto(file),
  });
};
