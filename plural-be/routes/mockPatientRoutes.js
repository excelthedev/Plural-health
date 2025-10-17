const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/patients";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "patient-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Format phone number to E.164
const formatPhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("234")) {
    return "+" + digits;
  } else if (digits.startsWith("0")) {
    return "+234" + digits.substring(1);
  } else if (digits.length === 10) {
    return "+234" + digits;
  }

  return phone;
};

// Mock patient data storage (in-memory)
let mockPatients = [];
let patientCounter = 1;

// Validation middleware
const validatePatientData = (req, res, next) => {
  const { firstName, lastName, gender, dateOfBirth, primaryPhone, address } =
    req.body;

  const errors = [];

  if (!firstName) errors.push("First name is required");
  if (!lastName) errors.push("Last name is required");
  if (!gender) errors.push("Gender is required");
  if (!dateOfBirth) errors.push("Date of birth is required");
  if (!primaryPhone) errors.push("Primary phone is required");
  if (!address || !address.street || !address.city || !address.state) {
    errors.push("Complete address is required");
  }

  if (
    primaryPhone &&
    !/^\+[1-9]\d{1,14}$/.test(formatPhoneNumber(primaryPhone))
  ) {
    errors.push("Phone number must be in E.164 format (e.g., +2348012345678)");
  }

  if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    errors.push("Please provide a valid email address");
  }

  if (dateOfBirth && new Date(dateOfBirth) >= new Date()) {
    errors.push("Date of birth must be in the past");
  }

  if (req.body.insurance && req.body.insurance.hasInsurance) {
    const { insurer, plan, memberId } = req.body.insurance;
    if (!insurer)
      errors.push("Insurance company is required when insurance is selected");
    if (!plan)
      errors.push("Insurance plan is required when insurance is selected");
    if (!memberId)
      errors.push("Member ID is required when insurance is selected");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};

// POST /api/patients - Create new patient (mock)
router.post(
  "/",
  upload.single("photo"),
  validatePatientData,
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        middleName,
        gender,
        dateOfBirth,
        primaryPhone,
        email,
        address,
        identities,
        insurance,
        facilityId,
      } = req.body;

      const formattedPhone = formatPhoneNumber(primaryPhone);

      // Check for duplicates in mock data
      const duplicatePatients = mockPatients.filter(
        (patient) =>
          patient.primaryPhone === formattedPhone ||
          (patient.firstName === firstName &&
            patient.lastName === lastName &&
            patient.dateOfBirth === dateOfBirth &&
            patient.gender === gender)
      );

      if (duplicatePatients.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Potential duplicate patient found",
          duplicates: duplicatePatients.map((patient) => ({
            id: patient._id,
            name: patient.fullName,
            phone: patient.primaryPhone,
            patientCode: patient.patientCode,
            dateOfBirth: patient.dateOfBirth,
          })),
        });
      }

      // Create mock patient
      const patientId = `patient_${patientCounter++}`;
      const patientCode = `HOSP${String(patientCounter).padStart(8, "0")}`;

      const patient = {
        _id: patientId,
        firstName,
        lastName,
        middleName: middleName || undefined,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        primaryPhone: formattedPhone,
        email: email || undefined,
        address: typeof address === "string" ? JSON.parse(address) : address,
        identities: identities
          ? typeof identities === "string"
            ? JSON.parse(identities)
            : identities
          : [],
        insurance: insurance
          ? typeof insurance === "string"
            ? JSON.parse(insurance)
            : insurance
          : { hasInsurance: false },
        photo: req.file
          ? {
              filename: req.file.filename,
              originalName: req.file.originalname,
              mimeType: req.file.mimetype,
              size: req.file.size,
              path: req.file.path,
              uploadedAt: new Date(),
            }
          : undefined,
        facilityId: facilityId || "507f1f77bcf86cd799439011",
        patientCode,
        walletBalance: 0,
        currency: "NGN",
        isActive: true,
        isNewPatient: true,
        createdBy: "system",
        createdFromIP: req.ip,
        createdFromDevice: req.get("User-Agent"),
        createdAt: new Date(),
        updatedAt: new Date(),
        fullName: middleName
          ? `${firstName} ${middleName} ${lastName}`
          : `${firstName} ${lastName}`,
        age: Math.floor(
          (new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)
        ),
      };

      mockPatients.push(patient);

      res.status(201).json({
        success: true,
        message: "Patient created successfully",
        data: patient,
      });
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(500).json({
        success: false,
        message: "Error creating patient",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// POST /api/patients/check-duplicates - Check for duplicate patients (mock)
router.post("/check-duplicates", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      primaryPhone,
      facilityId,
    } = req.body;

    if (!facilityId) {
      return res.status(400).json({
        success: false,
        message: "Facility ID is required",
      });
    }

    const formattedPhone = formatPhoneNumber(primaryPhone);

    const duplicates = mockPatients.filter(
      (patient) =>
        patient.primaryPhone === formattedPhone ||
        (patient.firstName === firstName &&
          patient.lastName === lastName &&
          patient.dateOfBirth === dateOfBirth &&
          patient.gender === gender)
    );

    res.json({
      success: true,
      data: {
        hasDuplicates: duplicates.length > 0,
        duplicates: duplicates.map((patient) => ({
          id: patient._id,
          name: patient.fullName,
          phone: patient.primaryPhone,
          patientCode: patient.patientCode,
          dateOfBirth: patient.dateOfBirth,
          email: patient.email,
        })),
      },
    });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    res.status(500).json({
      success: false,
      message: "Error checking for duplicates",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// GET /api/patients - Get patients list (mock)
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      facilityId,
      gender,
      hasInsurance,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filteredPatients = [...mockPatients];

    // Apply filters
    if (facilityId) {
      filteredPatients = filteredPatients.filter(
        (p) => p.facilityId === facilityId
      );
    }

    if (gender) {
      filteredPatients = filteredPatients.filter((p) => p.gender === gender);
    }

    if (hasInsurance !== undefined) {
      filteredPatients = filteredPatients.filter(
        (p) => p.insurance.hasInsurance === (hasInsurance === "true")
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPatients = filteredPatients.filter(
        (p) =>
          p.firstName.toLowerCase().includes(searchLower) ||
          p.lastName.toLowerCase().includes(searchLower) ||
          p.patientCode.toLowerCase().includes(searchLower) ||
          p.primaryPhone.includes(search) ||
          (p.email && p.email.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filteredPatients.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (sortOrder === "desc") {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        patients: paginatedPatients,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredPatients.length / limit),
          totalRecords: filteredPatients.length,
          recordsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(filteredPatients.length / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching patients",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// GET /api/patients/:id - Get single patient (mock)
router.get("/:id", async (req, res) => {
  try {
    const patient = mockPatients.find((p) => p._id === req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching patient",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

module.exports = router;
