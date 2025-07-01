import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Plan from "../models/Plan.js";

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Log for debugging
console.log('Environment loaded from:', path.resolve(__dirname, '../.env'));
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Fallback to a default URI if environment variable is not set
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/profitra';

const plans = [
  {
    name: "Basic Plan",
    interestRate: "5%",
    duration: "30 days",
    minimumInvestment: 100,
  },
  {
    name: "Premium Plan",
    interestRate: "10%",
    duration: "60 days",
    minimumInvestment: 500,
  },
  {
    name: "Elite Plan",
    interestRate: "15%",
    duration: "90 days",
    minimumInvestment: 1000,
  },
];

const seedPlans = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    await Plan.deleteMany();
    await Plan.insertMany(plans);
    console.log("✅ Plans seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding plans:", err.message);
    process.exit(1);
  }
};

seedPlans();
