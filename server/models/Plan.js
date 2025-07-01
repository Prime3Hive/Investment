import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  interestRate: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  minimumInvestment: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
