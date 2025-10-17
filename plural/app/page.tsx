"use client";

import Image from "next/image";
import { useState } from "react";
import AddPatientModal from "@/components/AddPatientModal";
import { useRecords, useFilterOptions } from "@/lib/hooks/useRecords";
import type { Record } from "@/lib/api";

// Icons as SVG components
const BellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.0002 0C5.95007 0 2.66683 3.28325 2.66683 7.33333V13.3333H1.3335V14.6667H18.6668V13.3333H17.3335V7.33333C17.3335 3.28325 14.0503 0 10.0002 0Z"
      fill="#0B0C7D"
    />
    <path
      d="M6.66683 16.6667V16H13.3335V16.6667C13.3335 18.5076 11.8411 20 10.0002 20C8.15921 20 6.66683 18.5076 6.66683 16.6667Z"
      fill="#0B0C7D"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="16" fill="#A6AFC2" />
    <path
      d="M16 8C13.9383 8 12.2666 9.67005 12.2666 11.7312C12.2666 13.7924 13.9383 15.4625 16 15.4625C18.0617 15.4625 19.7333 13.7924 19.7333 11.7312C19.7333 9.67005 18.0617 8 16 8Z"
      fill="white"
    />
    <path
      d="M13.8666 17.5938C11.8049 17.5938 10.1333 19.2646 10.1333 21.3265V23.9903H21.8666V21.3265C21.8666 19.2646 20.195 17.5938 18.1333 17.5938H13.8666Z"
      fill="white"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="11" cy="11" r="8" stroke="#6B7280" strokeWidth="2" />
    <path
      d="M21 21L16.65 16.65"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FingerprintIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z"
      fill="#6B7280"
    />
    <path
      d="M12 6C8.7 6 6 8.7 6 12C6 15.3 8.7 18 12 18C15.3 18 18 15.3 18 12C18 8.7 15.3 6 12 6ZM12 16C9.8 16 8 14.2 8 12C8 9.8 9.8 8 12 8C14.2 8 16 9.8 16 12C16 14.2 14.2 16 12 16Z"
      fill="#6B7280"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 5V19M5 12H19"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 18L9 12L15 6"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 18L15 12L9 6"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SortIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 6H21M3 12H15M3 18H9"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      ry="2"
      stroke="#6B7280"
      strokeWidth="2"
    />
    <line
      x1="16"
      y1="2"
      x2="16"
      y2="6"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="2"
      x2="8"
      y2="6"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="3"
      y1="10"
      x2="21"
      y2="10"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MoreIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="1" fill="#6B7280" />
    <circle cx="19" cy="12" r="1" fill="#6B7280" />
    <circle cx="5" cy="12" r="1" fill="#6B7280" />
  </svg>
);

// Status Icons
const ProcessingIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" />
  </svg>
);

const NotArrivedIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <line
      x1="15"
      y1="9"
      x2="9"
      y2="15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="9"
      y1="9"
      x2="15"
      y2="15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const HeartIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z"
      fill="currentColor"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 6L9 17L4 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusCircleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <line
      x1="12"
      y1="8"
      x2="12"
      y2="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="12"
      x2="16"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Clinic Icons
const BrainIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.5 2C8.5 2 7.5 2.5 7 3.5C6.5 2.5 5.5 2 4.5 2C3.5 2 2.5 2.5 2 3.5C2 5.5 3 7 4.5 8C6 9 7.5 10 9.5 10C11.5 10 13 9 14.5 8C16 7 17 5.5 17 3.5C16.5 2.5 15.5 2 14.5 2C13.5 2 12.5 2.5 12 3.5C11.5 2.5 10.5 2 9.5 2Z"
      fill="#6B7280"
    />
  </svg>
);

const EarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 8C6 5.5 7.5 3 10 3C12.5 3 14 5.5 14 8C14 10.5 12.5 13 10 13C9 13 8 12.5 7.5 11.5"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 13V16C10 17.5 11.5 19 13 19"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AmbulanceIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 3H1V16H16V3Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 8H20L23 11V16H16V8Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="5.5" cy="18.5" r="2.5" stroke="#6B7280" strokeWidth="2" />
    <circle cx="18.5" cy="18.5" r="2.5" stroke="#6B7280" strokeWidth="2" />
  </svg>
);

// Helper functions for data transformation
const getClinicIcon = (clinic: string) => {
  switch (clinic.toLowerCase()) {
    case "neurology":
      return BrainIcon;
    case "ear, nose & throat":
      return EarIcon;
    case "accident & emergency":
      return AmbulanceIcon;
    default:
      return HeartIcon;
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "processing":
      return ProcessingIcon;
    case "not arrived":
      return NotArrivedIcon;
    case "awaiting vitals":
    case "awaiting doctor":
      return HeartIcon;
    case "admitted to ward":
    case "transferred to a&e":
      return PlusCircleIcon;
    case "seen doctor":
      return CheckIcon;
    default:
      return HeartIcon;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "not arrived":
      return "bg-red-100 text-red-800";
    case "awaiting vitals":
    case "transferred to a&e":
      return "bg-purple-100 text-purple-800";
    case "awaiting doctor":
      return "bg-blue-100 text-blue-800";
    case "admitted to ward":
      return "bg-orange-100 text-orange-800";
    case "seen doctor":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTimeColor = (time: string) => {
  const hour = new Date(time).getHours();
  if (hour < 10) return "text-green-500";
  if (hour < 12) return "text-yellow-500";
  if (hour < 14) return "text-orange-500";
  if (hour < 16) return "text-blue-500";
  if (hour < 18) return "text-purple-500";
  return "text-red-500";
};

const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (time: string) => {
  return new Date(time).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount: number, currency: string = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function Dashboard() {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    clinic: "",
    status: "",
    sortBy: "appointmentTime",
    sortOrder: "asc" as "asc" | "desc",
  });

  // Fetch records from API
  const { data: recordsData, isLoading, error, refetch } = useRecords(filters);

  // Fetch filter options
  const { data: filterOptions } = useFilterOptions();

  const appointments = recordsData?.records || [];
  const pagination = recordsData?.pagination;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-[#EDF0F8] flex items-center justify-between px-4 py-6 border-b-[#dfe2ea] border-b-2">
        <div className="flex items-center space-x-3">
          <Image src={"/images/Plogo.png"} width={76} height={24} alt="logo" />
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-lg font-bold text-black">22 September</div>
          <div className="text-lg text-[#677597] font-bold">
            {formatTime(new Date().toISOString())}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-lg text-[#051438] font-bold">
            Hi Mr Daniel,
          </span>
          <BellIcon />
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <UserIcon size={20} stroke="white" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Search and Actions Section */}
        <div className="mb-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Find patient"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 1,
                }))
              }
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FingerprintIcon />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 mb-4">
            <button
              onClick={() => setIsAddPatientModalOpen(true)}
              className="bg-[#0B0C7D] text-white px-4 py-3 rounded-lg flex items-center space-x-2 hover:bg-[#1A2B5B]/90 transition-colors"
            >
              <PlusIcon />
              <span>Add new patient</span>
            </button>
            <button className="bg-[#0B0C7D] text-white px-4 py-3 rounded-lg flex items-center space-x-2 hover:bg-[#1A2B5B]/90 transition-colors">
              <PlusIcon />
              <span>Create appointment</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="p-4">
              <div className="flex items-center justify-between gap-10">
                <h2 className="text-lg font-semibold text-gray-900">
                  Appointments
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <select
                      value={filters.clinic}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          clinic: e.target.value,
                          page: 1,
                        }))
                      }
                      className="text-sm text-gray-600 bg-transparent border-none outline-none cursor-pointer"
                    >
                      <option value="">All clinics</option>
                      {filterOptions?.clinics.map((clinic) => (
                        <option key={clinic} value={clinic}>
                          {clinic}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon />
                  </div>
                  <div className="flex items-center space-x-2">
                    <SortIcon />
                    <select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split("-");
                        setFilters((prev) => ({
                          ...prev,
                          sortBy,
                          sortOrder: sortOrder as "asc" | "desc",
                          page: 1,
                        }));
                      }}
                      className="text-sm text-gray-600 bg-transparent border-none outline-none cursor-pointer"
                    >
                      <option value="appointmentTime-asc">Time (Asc)</option>
                      <option value="appointmentTime-desc">Time (Desc)</option>
                      <option value="patientName-asc">Name (A-Z)</option>
                      <option value="patientName-desc">Name (Z-A)</option>
                      <option value="clinic-asc">Clinic (A-Z)</option>
                      <option value="clinic-desc">Clinic (Z-A)</option>
                    </select>
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-10">
              <span className="text-sm text-gray-600">
                {pagination
                  ? `${
                      (pagination.currentPage - 1) * pagination.recordsPerPage +
                      1
                    } - ${Math.min(
                      pagination.currentPage * pagination.recordsPerPage,
                      pagination.totalRecords
                    )} of ${pagination.totalRecords}`
                  : "Loading..."}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={!pagination?.hasPrevPage}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={!pagination?.hasNextPage}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Table Headers */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm  text-[#cad0dd] border-b text-[16px] font-bold">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Patient information</div>
            <div className="col-span-2">Clinic</div>
            <div className="col-span-2">Wallet bal. (N)</div>
            <div className="col-span-2 flex items-center space-x-1">
              <CalendarIcon />
              <span>Time/Date</span>
            </div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading appointments...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                Error loading appointments. Please try again.
                <button
                  onClick={() => refetch()}
                  className="ml-2 text-blue-500 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No appointments found.
              </div>
            ) : (
              appointments.map((appointment: Record, index: number) => {
                const ClinicIcon = getClinicIcon(appointment.clinic);
                const StatusIcon = getStatusIcon(appointment.status);
                const statusColor = getStatusColor(appointment.status);
                const timeColor = getTimeColor(appointment.appointmentTime);

                return (
                  <div
                    key={appointment._id}
                    className={`grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedRow === appointment._id
                        ? "bg-orange-50 border-l-4 border-orange-500"
                        : ""
                    }`}
                    onClick={() => setSelectedRow(appointment._id)}
                  >
                    <div className="col-span-1 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                        {((pagination?.currentPage || 1) - 1) *
                          (pagination?.recordsPerPage || 20) +
                          index +
                          1}
                      </div>
                      <ChevronDownIcon />
                    </div>

                    <div className="col-span-3 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon size={20} stroke="#6B7280" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {appointment.patientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.patientCode} • {appointment.patientPhone}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center space-x-2">
                      <ClinicIcon />
                      <span className="text-sm">{appointment.clinic}</span>
                    </div>

                    <div className="col-span-2 text-sm font-medium">
                      {formatCurrency(
                        appointment.walletBalance,
                        appointment.currency
                      )}
                    </div>

                    <div className="col-span-2">
                      <div className={`text-sm font-medium ${timeColor}`}>
                        {formatTime(appointment.appointmentTime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(appointment.appointmentTime)}
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        <StatusIcon />
                        <span>{appointment.status}</span>
                      </span>
                      <MoreIcon />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
      />
    </div>
  );
}
