import {
  api,
  endpoints,
  type ApiResponse,
  type RecordsResponse,
  type StatsResponse,
  type FilterOptions,
  type Record,
} from "../api";

export interface RecordsFilters {
  page?: number;
  limit?: number;
  search?: string;
  clinic?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  facilityId?: string;
}

export interface StatsFilters {
  facilityId?: string;
  startDate?: string;
  endDate?: string;
}

// Fetch records with filters and pagination
export const fetchRecords = async (
  filters: RecordsFilters = {}
): Promise<RecordsResponse> => {
  const params = new URLSearchParams();

  // Add filters to params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, value.toString());
    }
  });

  const response = await api.get<ApiResponse<RecordsResponse>>(
    `${endpoints.records.list}?${params.toString()}`
  );

  return response.data.data;
};

// Fetch statistics
export const fetchStats = async (
  filters: StatsFilters = {}
): Promise<StatsResponse> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, value.toString());
    }
  });

  const response = await api.get<ApiResponse<StatsResponse>>(
    `${endpoints.records.stats}?${params.toString()}`
  );

  return response.data.data;
};

// Fetch filter options
export const fetchFilterOptions = async (
  facilityId?: string
): Promise<FilterOptions> => {
  const params = new URLSearchParams();

  if (facilityId) {
    params.append("facilityId", facilityId);
  }

  const response = await api.get<ApiResponse<FilterOptions>>(
    `${endpoints.records.filters}?${params.toString()}`
  );

  return response.data.data;
};

// Fetch single record
export const fetchRecord = async (id: string) => {
  const response = await api.get<ApiResponse<any>>(
    endpoints.records.single(id)
  );
  return response.data.data;
};
