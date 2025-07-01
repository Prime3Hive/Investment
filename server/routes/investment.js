import express from "express";
import Plan from "../models/Plan.js";

const router = express.Router();

// @desc    Get all investment plans
// @route   GET /api/investments/plans
router.get("/plans", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (err) {
    console.error("Error fetching plans:", err.message);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
});

export default router;
