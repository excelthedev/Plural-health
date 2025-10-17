const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    appointmentTime: {
      type: Date,
      required: true,
    },
    clinic: {
      type: String,
      required: true,
      enum: [
        "General Medicine",
        "Cardiology",
        "Neurology",
        "Dermatology",
        "Orthopedics",
        "Pediatrics",
        "Ear, Nose & Throat",
        "Accident & Emergency",
        "Gynecology",
        "Urology",
        "Ophthalmology",
        "Psychiatry",
      ],
    },
    status: {
      type: String,
      enum: [
        "Scheduled",
        "Confirmed",
        "In Progress",
        "Processing",
        "Awaiting vitals",
        "Awaiting doctor",
        "Seen doctor",
        "Not arrived",
        "Cancelled",
        "Completed",
        "Admitted to ward",
        "Transferred to A&E",
      ],
      default: "Scheduled",
    },
    appointmentType: {
      type: String,
      enum: ["New", "Follow-up", "Emergency", "Consultation"],
      default: "New",
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    diagnosis: String,
    prescription: String,
    followUpDate: Date,
    isUrgent: {
      type: Boolean,
      default: false,
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 30,
    },
    actualDuration: Number, // in minutes
    cost: {
      type: Number,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Partial", "Refunded"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ facilityId: 1 });
appointmentSchema.index({ appointmentTime: 1 });
appointmentSchema.index({ clinic: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ facilityId: 1, appointmentTime: 1 });

// Virtual for formatted appointment time
appointmentSchema.virtual("formattedTime").get(function () {
  if (!this.appointmentTime) return null;
  return this.appointmentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
});

// Virtual for formatted appointment date
appointmentSchema.virtual("formattedDate").get(function () {
  if (!this.appointmentTime) return null;
  return this.appointmentTime.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
});

// Ensure virtual fields are serialized
appointmentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
