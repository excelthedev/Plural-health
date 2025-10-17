"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreatePatient, useCheckDuplicates } from "@/lib/hooks/usePatients";
import {
  CreatePatientData,
  formatPhoneNumber,
  validatePhoneNumber,
  validateEmail,
  validateDateOfBirth,
} from "@/lib/services/patients";
import Image from "next/image";
import { toast } from "sonner";

// Icons
const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
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
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FingerprintIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z"
      fill="currentColor"
    />
    <path
      d="M12 6C8.7 6 6 8.7 6 12C6 15.3 8.7 18 12 18C15.3 18 18 15.3 18 12C18 8.7 15.3 6 12 6ZM12 16C9.8 16 8 14.2 8 12C8 9.8 9.8 8 12 8C14.2 8 16 9.8 16 12C16 14.2 14.2 16 12 16Z"
      fill="currentColor"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="#FFA500" strokeWidth="2" />
    <line x1="12" y1="16" x2="12" y2="12" stroke="#FFA500" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="8" stroke="#FFA500" strokeWidth="2" />
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
      stroke="currentColor"
      strokeWidth="2"
    />
    <line
      x1="16"
      y1="2"
      x2="16"
      y2="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="2"
      x2="8"
      y2="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="3"
      y1="10"
      x2="21"
      y2="10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="9"
      x2="12"
      y2="13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="17"
      x2="12.01"
      y2="17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  gender: string;
  dateOfBirth: string;
  primaryPhone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  identities: Array<{
    type: string;
    number: string;
    isActive: boolean;
    issuedBy: string;
    issuedDate: string;
    expiryDate: string;
  }>;
  insurance: {
    hasInsurance: boolean;
    insurer: string;
    plan: string;
    memberId: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    coverageDetails: string;
  };
  isNewPatient: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    middleName: "",
    gender: "",
    dateOfBirth: "",
    primaryPhone: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Nigeria",
    },
    identities: [],
    insurance: {
      hasInsurance: false,
      insurer: "",
      plan: "",
      memberId: "",
      startDate: "",
      endDate: "",
      isActive: true,
      coverageDetails: "",
    },
    isNewPatient: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showInsurance, setShowInsurance] = useState(false);
  const [showDuplicateCheck, setShowDuplicateCheck] = useState(false);
  const [duplicates, setDuplicates] = useState<unknown[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPatientMutation = useCreatePatient();
  // const checkDuplicatesMutation = useCheckDuplicates();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        middleName: "",
        gender: "",
        dateOfBirth: "",
        primaryPhone: "",
        email: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "Nigeria",
        },
        identities: [],
        insurance: {
          hasInsurance: false,
          insurer: "",
          plan: "",
          memberId: "",
          startDate: "",
          endDate: "",
          isActive: true,
          coverageDetails: "",
        },
        isNewPatient: true,
      });
      setErrors({});
      setPhotoFile(null);
      setPhotoPreview(null);
      setShowInsurance(false);
      setShowDuplicateCheck(false);
      setDuplicates([]);
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle nested object changes (address, insurance)
  const handleNestedChange = (
    parent: string,
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof FormData] as Record<string, unknown>),
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    const errorKey = `${parent}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  // Handle phone number formatting
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange("primaryPhone", formatted);
  };

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.primaryPhone.trim())
      newErrors.primaryPhone = "Primary phone is required";
    if (!formData.address.street.trim())
      newErrors["address.street"] = "Street address is required";
    if (!formData.address.city.trim())
      newErrors["address.city"] = "City is required";
    if (!formData.address.state.trim())
      newErrors["address.state"] = "State is required";

    // Format validations
    if (formData.primaryPhone && !validatePhoneNumber(formData.primaryPhone)) {
      newErrors.primaryPhone =
        "Please enter a valid phone number (e.g., +2348012345678)";
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth)) {
      newErrors.dateOfBirth = "Date of birth must be in the past";
    }

    // Insurance validation
    if (formData.insurance.hasInsurance) {
      if (!formData.insurance.insurer.trim())
        newErrors["insurance.insurer"] = "Insurance company is required";
      if (!formData.insurance.plan.trim())
        newErrors["insurance.plan"] = "Insurance plan is required";
      if (!formData.insurance.memberId.trim())
        newErrors["insurance.memberId"] = "Member ID is required";

      if (formData.insurance.startDate && formData.insurance.endDate) {
        if (
          new Date(formData.insurance.startDate) >=
          new Date(formData.insurance.endDate)
        ) {
          newErrors["insurance.endDate"] = "End date must be after start date";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check for duplicates
  // const handleCheckDuplicates = async () => {
  //   if (!validateForm()) {
  //     toast.error(
  //       "Please fix validation errors before checking for duplicates"
  //     );
  //     return;
  //   }

  //   try {
  //     const result = await checkDuplicatesMutation.mutateAsync({
  //       firstName: formData.firstName,
  //       lastName: formData.lastName,
  //       dateOfBirth: formData.dateOfBirth,
  //       gender: formData.gender,
  //       primaryPhone: formData.primaryPhone,
  //       facilityId: "507f1f77bcf86cd799439011", // Mock facility ID
  //     });

  //     if (result.hasDuplicates) {
  //       setDuplicates(result.duplicates);
  //       setShowDuplicateCheck(true);
  //       toast.warning(
  //         `Found ${result.duplicates.length} potential duplicate(s)`
  //       );
  //     } else {
  //       toast.success("No duplicates found");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to check for duplicates");
  //   }
  // };

  // Handle duplicate selection
  const handleSelectDuplicate = (duplicate: unknown) => {
    // Pre-fill form with duplicate data
    const duplicateData = duplicate as Record<string, unknown>;
    setFormData((prev) => ({
      ...prev,
      firstName:
        (duplicateData.name as string)?.split(" ")[0] || prev.firstName,
      lastName:
        (duplicateData.name as string)?.split(" ").slice(1).join(" ") ||
        prev.lastName,
      primaryPhone: (duplicateData.phone as string) || prev.primaryPhone,
      dateOfBirth: (duplicateData.dateOfBirth as string) || prev.dateOfBirth,
      email: (duplicateData.email as string) || prev.email,
    }));
    setShowDuplicateCheck(false);
    toast.info("Form pre-filled with existing patient data");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!validateForm()) {
    //   toast.error("Please fix validation errors");
    //   return;
    // }

    setIsSubmitting(true);

    try {
      const patientData: CreatePatientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        middleName: formData.middleName.trim() || undefined,
        gender: formData.gender as "Male" | "Female" | "Other",
        dateOfBirth: formData.dateOfBirth,
        primaryPhone: formData.primaryPhone,
        email: formData.email.trim() || undefined,
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          zipCode: formData.address.zipCode.trim() || undefined,
          country: formData.address.country,
        },
        identities: formData.identities.filter((id) => id.type && id.number),
        insurance: formData.insurance.hasInsurance
          ? {
              hasInsurance: true,
              insurer: formData.insurance.insurer,
              plan: formData.insurance.plan,
              memberId: formData.insurance.memberId,
              startDate: formData.insurance.startDate || undefined,
              endDate: formData.insurance.endDate || undefined,
              isActive: formData.insurance.isActive,
              coverageDetails: formData.insurance.coverageDetails || undefined,
            }
          : undefined,
        facilityId: "507f1f77bcf86cd799439011", // Mock facility ID
      };

      const result = await createPatientMutation.mutateAsync({
        patientData,
        photoFile: photoFile || undefined,
      });

      if (result.success) {
        toast.success("Patient created successfully!");
        onClose();
      } else if (result.duplicates) {
        setDuplicates(result.duplicates);
        setShowDuplicateCheck(true);
        toast.warning("Potential duplicates found. Please review.");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to create patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-fit max-h-[90vh] overflow-y-auto p-0 bg-gray-50 rounded-lg shadow-lg">
        {/* Custom Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-[#051438]">
              Add new patient
            </h2>
            <p className="text-gray-600 mt-1">
              Fill in the patient information in the fields provided below
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-[#051438] text-white hover:bg-[#051438]/90"
          >
            <CloseIcon />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Section: Patient Photo */}
            <div className="lg:col-span-1 space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2 border-gray-400">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Patient Preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="text-gray-600 text-4xl">👤</div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2 text-white bg-[#051438] border-[#051438] hover:bg-[#051438]/90 rounded-lg h-10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span>Take patient&apos;s picture</span>
                  <ChevronDownIcon />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2 text-white bg-[#051438] border-[#051438] hover:bg-[#051438]/90 rounded-lg h-10"
                >
                  <FingerprintIcon />
                  <span>Add fingerprint</span>
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Patient picture should be updated by reception personnel.
              </p>
            </div>

            {/* Right Section: Form Fields */}
            <div className="lg:col-span-3 space-y-6">
              {/* Patient ID Section */}
              <div className="space-y-4">
                {/* Tooltip */}
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 flex items-start space-x-2">
                  <InfoIcon />
                  <p className="text-sm text-orange-800">
                    If there is an existing Patient ID, input the patient&apos;s
                    existing ID into the field.
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="patientId"
                    className="text-[#051438] font-medium"
                  >
                    Patient ID
                  </Label>
                  <div className="relative flex items-center mt-1">
                    <Input
                      id="patientId"
                      value="HOSP98765433"
                      readOnly
                      className="pr-8 bg-white border-gray-300 text-gray-900"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Patient Toggle */}
                <div className="flex items-center justify-end">
                  <Label
                    htmlFor="newPatient"
                    className="mr-3 text-sm text-gray-700"
                  >
                    Is patient new to the hospital?
                  </Label>
                  <Switch
                    id="newPatient"
                    checked={formData.isNewPatient}
                    onCheckedChange={(checked) =>
                      handleInputChange("isNewPatient", checked)
                    }
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                {/* First Row: Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="text-[#051438] font-medium"
                    >
                      First name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder="First name"
                      className={`mt-1 bg-white border-gray-300 ${
                        errors.firstName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="middleName"
                      className="text-[#051438] font-medium"
                    >
                      Middle name
                    </Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) =>
                        handleInputChange("middleName", e.target.value)
                      }
                      placeholder="Middle name"
                      className="mt-1 bg-white border-gray-300"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="lastName"
                      className="text-[#051438] font-medium"
                    >
                      Last name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      placeholder="Last name"
                      className={`mt-1 ${
                        errors.lastName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="title"
                      className="text-[#051438] font-medium"
                    >
                      Title
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("title", value)
                      }
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300">
                        <SelectValue placeholder="Title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr.</SelectItem>
                        <SelectItem value="Ms">Ms.</SelectItem>
                        <SelectItem value="Dr">Dr.</SelectItem>
                        <SelectItem value="Mrs">Mrs.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Second Row: DOB, Gender, Phone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dob" className="text-[#051438] font-medium">
                      Date of birth<span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange("dateOfBirth", e.target.value)
                        }
                        placeholder="Date of birth"
                        className={`pr-8 ${
                          errors.dateOfBirth ? "border-red-500" : ""
                        }`}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <CalendarIcon />
                      </div>
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="gender"
                      className="text-[#051438] font-medium"
                    >
                      Gender
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                    >
                      <SelectTrigger
                        className={`mt-1 bg-white border-gray-300 ${
                          errors.gender ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-[#051438] font-medium"
                    >
                      Phone number<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.primaryPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="Phone number"
                      className={`mt-1 ${
                        errors.primaryPhone ? "border-red-500" : ""
                      }`}
                    />
                    {errors.primaryPhone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.primaryPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Third Row: Address */}
                <div>
                  <Label
                    htmlFor="address"
                    className="text-[#051438] font-medium"
                  >
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address.street}
                    onChange={(e) =>
                      handleNestedChange("address", "street", e.target.value)
                    }
                    placeholder="Address"
                    className={`mt-1 ${
                      errors["address.street"] ? "border-red-500" : ""
                    }`}
                  />
                  {errors["address.street"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["address.street"]}
                    </p>
                  )}
                </div>

                {/* Fourth Row: Email, Nationality, State of Origin */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-[#051438] font-medium"
                    >
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Email address"
                      className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="nationality"
                      className="text-[#051438] font-medium"
                    >
                      Nationality
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("nationality", value)
                      }
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300">
                        <SelectValue placeholder="Nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nigerian">Nigerian</SelectItem>
                        <SelectItem value="Ghanaian">Ghanaian</SelectItem>
                        <SelectItem value="Kenyan">Kenyan</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="stateOfOrigin"
                      className="text-[#051438] font-medium"
                    >
                      State of origin
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("stateOfOrigin", value)
                      }
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300">
                        <SelectValue placeholder="State of origin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lagos">Lagos</SelectItem>
                        <SelectItem value="Abuja">Abuja</SelectItem>
                        <SelectItem value="Kano">Kano</SelectItem>
                        <SelectItem value="Rivers">Rivers</SelectItem>
                        <SelectItem value="Ogun">Ogun</SelectItem>
                        <SelectItem value="Oyo">Oyo</SelectItem>
                        <SelectItem value="Kaduna">Kaduna</SelectItem>
                        <SelectItem value="Enugu">Enugu</SelectItem>
                        <SelectItem value="Delta">Delta</SelectItem>
                        <SelectItem value="Imo">Imo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Insurance Provider */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowInsurance(!showInsurance)}
                    className="flex items-center space-x-2 text-[#051438] px-0 hover:bg-transparent font-semibold"
                  >
                    <span>Insurance provider details</span>
                    <ChevronDownIcon />
                  </Button>
                </div>

                {showInsurance && (
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="insurer"
                        className="text-[#051438] font-medium"
                      >
                        Insurance provider
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="insurer"
                        value={formData.insurance.insurer}
                        onChange={(e) =>
                          handleNestedChange(
                            "insurance",
                            "insurer",
                            e.target.value
                          )
                        }
                        placeholder="Insurance provider"
                        className={`mt-1 ${
                          errors["insurance.insurer"] ? "border-red-500" : ""
                        }`}
                      />
                      {errors["insurance.insurer"] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors["insurance.insurer"]}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Duplicate Check Results */}
              {showDuplicateCheck && duplicates.length > 0 && (
                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangleIcon />
                    <h3 className="font-semibold text-yellow-800">
                      Potential Duplicates Found
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {duplicates.map((duplicate, index) => {
                      const duplicateData = duplicate as Record<
                        string,
                        unknown
                      >;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded border"
                        >
                          <div>
                            <p className="font-medium">
                              {duplicateData.name as string}
                            </p>
                            <p className="text-sm text-gray-600">
                              {duplicateData.phone as string} •{" "}
                              {duplicateData.patientCode as string} •{" "}
                              {new Date(
                                duplicateData.dateOfBirth as string
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectDuplicate(duplicate)}
                          >
                            Use This
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDuplicateCheck(false)}
                    >
                      Continue Anyway
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="bg-purple-200 text-white border-purple-200 hover:bg-purple-300 rounded-lg px-6 py-2"
                >
                  Save & close
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || createPatientMutation.isPending}
                  className="bg-[#051438] text-white hover:bg-[#051438]/90 rounded-lg px-6 py-2"
                >
                  {isSubmitting || createPatientMutation.isPending
                    ? "Creating..."
                    : "Create appointment"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientModal;
