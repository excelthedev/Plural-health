const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Facility = require("../models/Facility");

// Middleware for logging
const logEvent = (req, event, details = {}) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get("User-Agent") || "Unknown";
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${event}:`, {
    ip,
    userAgent,
    endpoint: req.originalUrl,
    method: req.method,
    ...details,
  });
};

// GET /api/records - Get appointment records with filters and pagination
router.get("/", async (req, res) => {
  try {
    logEvent(req, "RECORDS_LIST_REQUESTED", { query: req.query });

    // Extract query parameters
    const {
      page = 1,
      limit = 20,
      search = "",
      clinic = "",
      status = "",
      sortBy = "appointmentTime",
      sortOrder = "asc",
      startDate = "",
      endDate = "",
      facilityId = "",
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 records per page
    const skip = (pageNum - 1) * limitNum;

    // Validate sort parameters
    const validSortFields = [
      "appointmentTime",
      "patientName",
      "clinic",
      "status",
      "walletBalance",
    ];
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : "appointmentTime";
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.appointmentTime = {};
      if (startDate) {
        dateFilter.appointmentTime.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.appointmentTime.$lte = new Date(endDate);
      }
    } else {
      // Default to today if no date range specified
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      dateFilter.appointmentTime = {
        $gte: today,
        $lt: tomorrow,
      };
    }

    // Build base query
    let query = { ...dateFilter };

    // Add clinic filter
    if (clinic) {
      query.clinic = clinic;
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add facility filter (for facility scoping)
    if (facilityId) {
      query.facilityId = facilityId;
    }

    // Build aggregation pipeline
    const pipeline = [
      // Match appointments
      { $match: query },

      // Lookup patient information
      {
        $lookup: {
          from: "users",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },

      // Unwind patient array
      { $unwind: "$patient" },

      // Lookup facility information
      {
        $lookup: {
          from: "facilities",
          localField: "facilityId",
          foreignField: "_id",
          as: "facility",
        },
      },

      // Unwind facility array
      { $unwind: "$facility" },

      // Add computed fields
      {
        $addFields: {
          patientName: "$patient.name",
          patientCode: "$patient.patientCode",
          patientPhone: "$patient.phone",
          walletBalance: "$patient.walletBalance",
          currency: "$patient.currency",
          facilityName: "$facility.name",
        },
      },
    ];

    // Add text search if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { patientName: { $regex: search, $options: "i" } },
            { patientCode: { $regex: search, $options: "i" } },
            { patientPhone: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Add sorting
    const sortStage = {};
    sortStage[sortField] = sortDirection;
    pipeline.push({ $sort: sortStage });

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Appointment.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    // Project final fields
    pipeline.push({
      $project: {
        _id: 1,
        patientName: 1,
        patientCode: 1,
        patientPhone: 1,
        appointmentTime: 1,
        formattedTime: 1,
        formattedDate: 1,
        clinic: 1,
        status: 1,
        appointmentType: 1,
        walletBalance: 1,
        currency: 1,
        facilityName: 1,
        isUrgent: 1,
        cost: 1,
        paymentStatus: 1,
        notes: 1,
        createdAt: 1,
      },
    });

    // Execute aggregation
    const records = await Appointment.aggregate(pipeline);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Format response
    const response = {
      success: true,
      data: {
        records,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalRecords: total,
          recordsPerPage: limitNum,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          search,
          clinic,
          status,
          startDate,
          endDate,
          sortBy: sortField,
          sortOrder,
        },
      },
      message:
        total > 0 ? "Records retrieved successfully" : "No records found",
    };

    logEvent(req, "RECORDS_LIST_SUCCESS", {
      totalRecords: total,
      returnedRecords: records.length,
      page: pageNum,
      filters: response.data.filters,
    });

    res.json(response);
  } catch (error) {
    logEvent(req, "RECORDS_LIST_ERROR", { error: error.message });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve records",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// GET /api/records/stats - Get statistics for dashboard
router.get("/stats", async (req, res) => {
  try {
    logEvent(req, "RECORDS_STATS_REQUESTED");

    const { facilityId = "", startDate = "", endDate = "" } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.appointmentTime = {};
      if (startDate) {
        dateFilter.appointmentTime.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.appointmentTime.$lte = new Date(endDate);
      }
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      dateFilter.appointmentTime = {
        $gte: today,
        $lt: tomorrow,
      };
    }

    // Add facility filter
    if (facilityId) {
      dateFilter.facilityId = facilityId;
    }

    // Get statistics
    const [totalAppointments, statusStats, clinicStats, urgentCount] =
      await Promise.all([
        // Total appointments
        Appointment.countDocuments(dateFilter),

        // Status distribution
        Appointment.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),

        // Clinic distribution
        Appointment.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: "$clinic",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),

        // Urgent appointments
        Appointment.countDocuments({ ...dateFilter, isUrgent: true }),
      ]);

    const response = {
      success: true,
      data: {
        totalAppointments,
        urgentAppointments: urgentCount,
        statusDistribution: statusStats,
        clinicDistribution: clinicStats,
      },
      message: "Statistics retrieved successfully",
    };

    logEvent(req, "RECORDS_STATS_SUCCESS", {
      totalAppointments,
      urgentCount,
    });

    res.json(response);
  } catch (error) {
    logEvent(req, "RECORDS_STATS_ERROR", { error: error.message });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve statistics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// GET /api/records/filters - Get available filter options
router.get("/filters", async (req, res) => {
  try {
    logEvent(req, "RECORDS_FILTERS_REQUESTED");

    const { facilityId = "" } = req.query;

    let matchQuery = {};
    if (facilityId) {
      matchQuery.facilityId = facilityId;
    }

    const [clinics, statuses] = await Promise.all([
      // Get unique clinics
      Appointment.distinct("clinic", matchQuery),

      // Get unique statuses
      Appointment.distinct("status", matchQuery),
    ]);

    const response = {
      success: true,
      data: {
        clinics: clinics.sort(),
        statuses: statuses.sort(),
      },
      message: "Filter options retrieved successfully",
    };

    logEvent(req, "RECORDS_FILTERS_SUCCESS", {
      clinicsCount: clinics.length,
      statusesCount: statuses.length,
    });

    res.json(response);
  } catch (error) {
    logEvent(req, "RECORDS_FILTERS_ERROR", { error: error.message });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve filter options",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// GET /api/records/:id - Get single appointment record
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    logEvent(req, "RECORD_DETAIL_REQUESTED", { recordId: id });

    const record = await Appointment.findById(id)
      .populate("patientId", "name patientCode phone walletBalance currency")
      .populate("doctorId", "name patientCode")
      .populate("facilityId", "name type address phone");

    if (!record) {
      logEvent(req, "RECORD_DETAIL_NOT_FOUND", { recordId: id });
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    const response = {
      success: true,
      data: record,
      message: "Record retrieved successfully",
    };

    logEvent(req, "RECORD_DETAIL_SUCCESS", { recordId: id });

    res.json(response);
  } catch (error) {
    logEvent(req, "RECORD_DETAIL_ERROR", {
      recordId: req.params.id,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve record",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

module.exports = router;
