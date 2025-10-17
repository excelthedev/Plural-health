const mongoose = require("mongoose");
const Facility = require("../models/Facility");
require("dotenv").config();

async function createDefaultFacility() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/plural-healthcare"
    );
    console.log("Connected to MongoDB");

    // Check if default facility already exists
    const existingFacility = await Facility.findOne({
      name: "Default Healthcare Facility",
    });

    if (existingFacility) {
      console.log("Default facility already exists:", existingFacility._id);
      return existingFacility._id;
    }

    // Create default facility
    const defaultFacility = new Facility({
      name: "Default Healthcare Facility",
      type: "Hospital",
      address: {
        street: "123 Healthcare Street",
        city: "Lagos",
        state: "Lagos",
        zipCode: "100001",
        country: "Nigeria",
      },
      contactInfo: {
        phone: "+2348012345678",
        email: "info@defaulthealthcare.com",
        website: "https://defaulthealthcare.com",
      },
      isActive: true,
      createdBy: "system",
    });

    const savedFacility = await defaultFacility.save();
    console.log("Default facility created:", savedFacility._id);

    return savedFacility._id;
  } catch (error) {
    console.error("Error creating default facility:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run if called directly
if (require.main === module) {
  createDefaultFacility()
    .then((facilityId) => {
      console.log("Default facility ID:", facilityId);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to create default facility:", error);
      process.exit(1);
    });
}

module.exports = createDefaultFacility;
