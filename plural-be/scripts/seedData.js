const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Facility = require("../models/Facility");

// Sample data
const facilities = [
  {
    name: "Lagos General Hospital",
    type: "Hospital",
    address: {
      street: "123 Marina Road",
      city: "Lagos",
      state: "Lagos",
      zipCode: "100001",
      country: "Nigeria",
    },
    phone: "+234-1-234-5678",
    email: "info@lagosgeneral.com",
    licenseNumber: "LGH-2024-001",
  },
  {
    name: "Abuja Medical Center",
    type: "Medical Center",
    address: {
      street: "456 Central District",
      city: "Abuja",
      state: "FCT",
      zipCode: "900001",
      country: "Nigeria",
    },
    phone: "+234-9-876-5432",
    email: "contact@abujamedical.com",
    licenseNumber: "AMC-2024-002",
  },
];

const users = [
  {
    name: "Akpopodion Endurance",
    email: "akpopodion.endurance@email.com",
    phone: "+234-801-234-5678",
    patientCode: "HOSP29384756",
    dateOfBirth: new Date("2003-05-15"),
    gender: "Male",
    walletBalance: 120000,
    currency: "NGN",
    role: "patient",
  },
  {
    name: "Boluwatife Adebayo",
    email: "boluwatife.adebayo@email.com",
    phone: "+234-802-345-6789",
    patientCode: "HOSP29384757",
    dateOfBirth: new Date("1999-03-22"),
    gender: "Female",
    walletBalance: 85000,
    currency: "NGN",
    role: "patient",
  },
  {
    name: "Omolola Johnson",
    email: "omolola.johnson@email.com",
    phone: "+234-803-456-7890",
    patientCode: "HOSP29384758",
    dateOfBirth: new Date("1994-08-10"),
    gender: "Female",
    walletBalance: 200000,
    currency: "NGN",
    role: "patient",
  },
  {
    name: "Chinedu Okonkwo",
    email: "chinedu.okonkwo@email.com",
    phone: "+234-804-567-8901",
    patientCode: "HOSP29384759",
    dateOfBirth: new Date("1989-12-05"),
    gender: "Male",
    walletBalance: 150000,
    currency: "NGN",
    role: "patient",
  },
  {
    name: "Fatima Ibrahim",
    email: "fatima.ibrahim@email.com",
    phone: "+234-805-678-9012",
    patientCode: "HOSP29384760",
    dateOfBirth: new Date("1996-07-18"),
    gender: "Female",
    walletBalance: 95000,
    currency: "NGN",
    role: "patient",
  },
  {
    name: "Emmanuel Okafor",
    email: "emmanuel.okafor@email.com",
    phone: "+234-806-789-0123",
    patientCode: "HOSP29384761",
    dateOfBirth: new Date("1982-11-30"),
    gender: "Male",
    walletBalance: 180000,
    currency: "NGN",
    role: "patient",
  },
  {
    name: "Grace Adeyemi",
    email: "grace.adeyemi@email.com",
    phone: "+234-807-890-1234",
    patientCode: "HOSP29384762",
    dateOfBirth: new Date("1991-04-12"),
    gender: "Female",
    walletBalance: 110000,
    currency: "NGN",
    role: "patient",
  },
  {
    name: "Ibrahim Mohammed",
    email: "ibrahim.mohammed@email.com",
    phone: "+234-808-901-2345",
    patientCode: "HOSP29384763",
    dateOfBirth: new Date("1974-09-25"),
    gender: "Male",
    walletBalance: 75000,
    currency: "NGN",
    role: "patient",
  },
  {
    name: "Dr. Sarah Williams",
    email: "sarah.williams@lagosgeneral.com",
    phone: "+234-809-012-3456",
    patientCode: "DOC001",
    dateOfBirth: new Date("1985-06-14"),
    gender: "Female",
    walletBalance: 0,
    currency: "NGN",
    role: "doctor",
  },
  {
    name: "Dr. Michael Brown",
    email: "michael.brown@lagosgeneral.com",
    phone: "+234-810-123-4567",
    patientCode: "DOC002",
    dateOfBirth: new Date("1980-02-28"),
    gender: "Male",
    walletBalance: 0,
    currency: "NGN",
    role: "doctor",
  },
];

const clinics = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Dermatology",
  "Orthopedics",
  "Pediatrics",
  "Ear, Nose & Throat",
  "Accident & Emergency",
];

const statuses = [
  "Processing",
  "Not arrived",
  "Awaiting vitals",
  "Awaiting doctor",
  "Admitted to ward",
  "Transferred to A&E",
  "Seen doctor",
];

const appointmentTypes = ["New", "Follow-up", "Emergency", "Consultation"];

// Generate appointments
function generateAppointments(facilities, users) {
  const appointments = [];
  const today = new Date();

  // Get patient users only
  const patients = users.filter((user) => user.role === "patient");
  const doctors = users.filter((user) => user.role === "doctor");

  // Generate appointments for the next 7 days
  for (let day = 0; day < 7; day++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + day);

    // Generate 5-15 appointments per day
    const appointmentsPerDay = Math.floor(Math.random() * 11) + 5;

    for (let i = 0; i < appointmentsPerDay; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const facility =
        facilities[Math.floor(Math.random() * facilities.length)];
      const clinic = clinics[Math.floor(Math.random() * clinics.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const appointmentType =
        appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];

      // Generate random time between 8 AM and 6 PM
      const hour = Math.floor(Math.random() * 10) + 8; // 8-17
      const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45

      const appointmentTime = new Date(appointmentDate);
      appointmentTime.setHours(hour, minute, 0, 0);

      appointments.push({
        patientId: patient._id,
        doctorId: doctor._id,
        facilityId: facility._id,
        appointmentTime,
        clinic,
        status,
        appointmentType,
        notes: `Appointment for ${clinic} consultation`,
        isUrgent: Math.random() < 0.1, // 10% chance of being urgent
        estimatedDuration: 30,
        cost: Math.floor(Math.random() * 50000) + 10000, // 10,000 - 60,000 NGN
        paymentStatus: ["Pending", "Paid", "Partial"][
          Math.floor(Math.random() * 3)
        ],
      });
    }
  }

  return appointments;
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://tobyadeyy_db_user:LBg3pJildm0Sntf3@cluster0.x16ajjr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await Facility.deleteMany({});
    await User.deleteMany({});
    await Appointment.deleteMany({});
    console.log("Cleared existing data");

    // Seed facilities
    const createdFacilities = await Facility.insertMany(facilities);
    console.log(`Created ${createdFacilities.length} facilities`);

    // Add facilityId to users
    const usersWithFacility = users.map((user) => ({
      ...user,
      facilityId:
        createdFacilities[Math.floor(Math.random() * createdFacilities.length)]
          ._id,
    }));

    // Seed users
    const createdUsers = await User.insertMany(usersWithFacility);
    console.log(`Created ${createdUsers.length} users`);

    // Generate and seed appointments
    const appointments = generateAppointments(createdFacilities, createdUsers);
    const createdAppointments = await Appointment.insertMany(appointments);
    console.log(`Created ${createdAppointments.length} appointments`);

    console.log("Database seeded successfully!");

    // Print summary
    console.log("\n=== SEED SUMMARY ===");
    console.log(`Facilities: ${createdFacilities.length}`);
    console.log(`Users: ${createdUsers.length}`);
    console.log(`Appointments: ${createdAppointments.length}`);

    // Print some sample data
    console.log("\n=== SAMPLE FACILITIES ===");
    createdFacilities.forEach((facility) => {
      console.log(`- ${facility.name} (${facility.type})`);
    });

    console.log("\n=== SAMPLE PATIENTS ===");
    const samplePatients = createdUsers
      .filter((user) => user.role === "patient")
      .slice(0, 3);
    samplePatients.forEach((patient) => {
      console.log(
        `- ${patient.name} (${
          patient.patientCode
        }) - ${patient.walletBalance.toLocaleString()} ${patient.currency}`
      );
    });
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seed function
seedDatabase();
