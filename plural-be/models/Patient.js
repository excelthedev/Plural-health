const mongoose = require("mongoose");

// Identity schema for Hospital ID and other identifiers
const identitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["Hospital ID", "National ID", "Passport", "Driver License", "Other"],
  },
  number: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  issuedBy: {
    type: String,
    trim: true,
  },
  issuedDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
});

// Insurance schema
const insuranceSchema = new mongoose.Schema({
  hasInsurance: {
    type: Boolean,
    default: false,
  },
  insurer: {
    type: String,
    trim: true,
  },
  plan: {
    type: String,
    trim: true,
  },
  memberId: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  coverageDetails: {
    type: String,
    trim: true,
  },
});

// Photo schema
const photoSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Address schema
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  zipCode: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
    default: "Nigeria",
  },
});

// Main Patient schema
const patientSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    middleName: {
      type: String,
      trim: true,
      maxlength: [50, "Middle name cannot exceed 50 characters"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: function (value) {
          return value < new Date();
        },
        message: "Date of birth must be in the past",
      },
    },

    // Contact Information
    primaryPhone: {
      type: String,
      required: [true, "Primary phone is required"],
      trim: true,
      validate: {
        validator: function (value) {
          // E.164 format validation
          return /^\+[1-9]\d{1,14}$/.test(value);
        },
        message: "Phone number must be in E.164 format (e.g., +2348012345678)",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          if (!value) return true; // Optional field
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Please provide a valid email address",
      },
    },
    address: {
      type: addressSchema,
      required: [true, "Contact address is required"],
    },

    // Identities
    identities: [identitySchema],

    // Insurance
    insurance: {
      type: insuranceSchema,
      default: () => ({}),
    },

    // Photo
    photo: {
      type: photoSchema,
    },

    // System Information
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: [true, "Facility ID is required"],
    },

    // Patient Code (auto-generated)
    patientCode: {
      type: String,
      unique: true,
      required: true,
    },

    // Wallet Information
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, "Wallet balance cannot be negative"],
    },
    currency: {
      type: String,
      default: "NGN",
      enum: ["NGN", "USD", "EUR", "GBP"],
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isNewPatient: {
      type: Boolean,
      default: true,
    },

    // Audit Information
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdFromIP: {
      type: String,
    },
    createdFromDevice: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
patientSchema.virtual("fullName").get(function () {
  if (this.middleName) {
    return `${this.firstName} ${this.middleName} ${this.lastName}`;
  }
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
patientSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// Indexes for performance and uniqueness
patientSchema.index({ facilityId: 1, primaryPhone: 1 });
patientSchema.index({ facilityId: 1, email: 1 });
patientSchema.index({ facilityId: 1, patientCode: 1 });
patientSchema.index({
  facilityId: 1,
  firstName: 1,
  lastName: 1,
  dateOfBirth: 1,
  gender: 1,
});

// Pre-save middleware to generate patient code
patientSchema.pre("save", async function (next) {
  if (this.isNew && !this.patientCode) {
    try {
      const facility = await mongoose
        .model("Facility")
        .findById(this.facilityId);
      if (!facility) {
        return next(new Error("Facility not found"));
      }

      // Generate patient code: HOSP + 8 digits
      const count = await this.constructor.countDocuments({
        facilityId: this.facilityId,
      });
      const paddedCount = String(count + 1).padStart(8, "0");
      this.patientCode = `HOSP${paddedCount}`;

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Static method to check for duplicates
patientSchema.statics.findDuplicates = function (
  patientData,
  facilityId,
  excludeId = null
) {
  const query = {
    facilityId,
    $or: [
      { primaryPhone: patientData.primaryPhone },
      {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
      },
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.find(query);
};

// Method to check if insurance is active
patientSchema.methods.isInsuranceActive = function () {
  if (!this.insurance.hasInsurance) return false;
  if (!this.insurance.isActive) return false;

  const now = new Date();
  if (this.insurance.endDate && this.insurance.endDate < now) return false;

  return true;
};

module.exports = mongoose.model("Patient", patientSchema);
