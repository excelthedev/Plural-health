const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Patient = require("../models/Patient");
const Facility = require("../models/Facility");
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
  // Accept only image files
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

// Validation middleware
const validatePatientData = (req, res, next) => {
  const { firstName, lastName, gender, dateOfBirth, primaryPhone, address } =
    req.body;

  const errors = [];

  // Required field validation
  if (!firstName) errors.push("First name is required");
  if (!lastName) errors.push("Last name is required");
  if (!gender) errors.push("Gender is required");
  if (!dateOfBirth) errors.push("Date of birth is required");
  if (!primaryPhone) errors.push("Primary phone is required");
  if (!address || !address.street || !address.city || !address.state) {
    errors.push("Complete address is required");
  }

  // Phone number validation (E.164 format)
  if (primaryPhone && !/^\+[1-9]\d{1,14}$/.test(primaryPhone)) {
    errors.push("Phone number must be in E.164 format (e.g., +2348012345678)");
  }

  // Email validation
  if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    errors.push("Please provide a valid email address");
  }

  // Date validation
  if (dateOfBirth && new Date(dateOfBirth) >= new Date()) {
    errors.push("Date of birth must be in the past");
  }

  // Insurance validation
  if (req.body.insurance && req.body.insurance.hasInsurance) {
    const { insurer, plan, memberId, startDate, endDate } = req.body.insurance;
    if (!insurer)
      errors.push("Insurance company is required when insurance is selected");
    if (!plan)
      errors.push("Insurance plan is required when insurance is selected");
    if (!memberId)
      errors.push("Member ID is required when insurance is selected");

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      errors.push("Insurance start date must be before end date");
    }
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

// Format phone number to E.164
const formatPhoneNumber = (phone) => {
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

// POST /api/patients - Create new patient
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

      // Format phone number
      const formattedPhone = formatPhoneNumber(primaryPhone);

      // Check for duplicates
      const duplicatePatients = await Patient.findDuplicates(
        {
          firstName,
          lastName,
          dateOfBirth,
          gender,
          primaryPhone: formattedPhone,
        },
        facilityId
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

      // Verify facility exists
      const facility = await Facility.findById(facilityId);
      if (!facility) {
        return res.status(404).json({
          success: false,
          message: "Facility not found",
        });
      }

      // Prepare patient data
      const patientData = {
        firstName,
        lastName,
        middleName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        primaryPhone: formattedPhone,
        email: email || undefined,
        address,
        facilityId,
        createdBy: req.user?.id || "system", // Assuming auth middleware sets req.user
        createdFromIP: req.ip,
        createdFromDevice: req.get("User-Agent"),
      };

      // Add identities if provided
      if (identities && Array.isArray(identities)) {
        patientData.identities = identities.map((identity) => ({
          type: identity.type,
          number: identity.number,
          isActive: identity.isActive !== false,
          issuedBy: identity.issuedBy,
          issuedDate: identity.issuedDate
            ? new Date(identity.issuedDate)
            : undefined,
          expiryDate: identity.expiryDate
            ? new Date(identity.expiryDate)
            : undefined,
        }));
      }

      // Add insurance if provided
      if (insurance) {
        patientData.insurance = {
          hasInsurance: insurance.hasInsurance === true,
          insurer: insurance.insurer,
          plan: insurance.plan,
          memberId: insurance.memberId,
          startDate: insurance.startDate
            ? new Date(insurance.startDate)
            : undefined,
          endDate: insurance.endDate ? new Date(insurance.endDate) : undefined,
          isActive: insurance.isActive !== false,
          coverageDetails: insurance.coverageDetails,
        };
      }

      // Add photo if uploaded
      if (req.file) {
        patientData.photo = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
        };
      }

      // Create patient
      const patient = new Patient(patientData);
      await patient.save();

      // Populate facility and createdBy
      await patient.populate("facilityId", "name type");
      await patient.populate("createdBy", "name email");

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

// GET /api/patients/check-duplicates - Check for duplicate patients
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

    const duplicates = await Patient.findDuplicates(
      {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        primaryPhone: formattedPhone,
      },
      facilityId
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

// GET /api/patients - Get patients with pagination and filters
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

    const query = {};

    // Facility filter
    if (facilityId) {
      query.facilityId = facilityId;
    }

    // Gender filter
    if (gender) {
      query.gender = gender;
    }

    // Insurance filter
    if (hasInsurance !== undefined) {
      query["insurance.hasInsurance"] = hasInsurance === "true";
    }

    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { patientCode: { $regex: search, $options: "i" } },
        { primaryPhone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const patients = await Patient.find(query)
      .populate("facilityId", "name type")
      .populate("createdBy", "name email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Patient.countDocuments(query);

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          recordsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(total / limit),
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

// GET /api/patients/:id - Get single patient
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate("facilityId", "name type address")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

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

// PUT /api/patients/:id - Update patient
router.put(
  "/:id",
  upload.single("photo"),
  validatePatientData,
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      // Check for duplicates (excluding current patient)
      const duplicatePatients = await Patient.findDuplicates(
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          dateOfBirth: req.body.dateOfBirth,
          gender: req.body.gender,
          primaryPhone: formatPhoneNumber(req.body.primaryPhone),
        },
        req.body.facilityId,
        req.params.id
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

      // Update patient data
      const updateData = { ...req.body };
      updateData.primaryPhone = formatPhoneNumber(req.body.primaryPhone);
      updateData.updatedBy = req.user?.id || "system";
      updateData.updatedAt = new Date();

      // Handle photo update
      if (req.file) {
        // Delete old photo if exists
        if (patient.photo && patient.photo.path) {
          try {
            fs.unlinkSync(patient.photo.path);
          } catch (error) {
            console.error("Error deleting old photo:", error);
          }
        }

        updateData.photo = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
        };
      }

      const updatedPatient = await Patient.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate("facilityId", "name type")
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email");

      res.json({
        success: true,
        message: "Patient updated successfully",
        data: updatedPatient,
      });
    } catch (error) {
      console.error("Error updating patient:", error);
      res.status(500).json({
        success: false,
        message: "Error updating patient",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// DELETE /api/patients/:id - Delete patient (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Soft delete by setting isActive to false
    patient.isActive = false;
    patient.updatedBy = req.user?.id || "system";
    await patient.save();

    res.json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting patient",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

module.exports = router;
