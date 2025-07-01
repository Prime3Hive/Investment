import express from "express";
import Plan from "../models/Plan.js";
import { protect } from '../middleware/auth.js';
import isAdmin from '../middleware/adminAuth.js';
import { investmentPlanValidation, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get all investment plans
// @route   GET /api/investments/plans
router.get("/plans", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (err) {
    console.error("Error fetching plans:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch plans" 
    });
  }
});

// @desc    Get investment plan by ID
// @route   GET /api/investments/plans/:id
router.get("/plans/:id", async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false, 
        message: "Plan not found" 
      });
    }
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    console.error("Error fetching plan:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch plan" 
    });
  }
});

// ADMIN PROTECTED ROUTES

// @desc    Create new investment plan (Admin only)
// @route   POST /api/investments/plans
router.post(
  "/plans", 
  protect, 
  isAdmin, 
  investmentPlanValidation,
  validateRequest,
  async (req, res) => {
    try {
      const { name, interestRate, duration, minimumInvestment } = req.body;
      
      const newPlan = new Plan({
        name,
        interestRate,
        duration,
        minimumInvestment
      });
      
      const savedPlan = await newPlan.save();
      
      res.status(201).json({
        success: true,
        message: "Investment plan created successfully",
        plan: savedPlan
      });
    } catch (err) {
      console.error("Error creating plan:", err.message);
      res.status(500).json({ 
        success: false,
        message: "Failed to create investment plan" 
      });
    }
  }
);

// @desc    Update investment plan (Admin only)
// @route   PUT /api/investments/plans/:id
router.put(
  "/plans/:id", 
  protect, 
  isAdmin, 
  async (req, res) => {
    try {
      const { name, interestRate, duration, minimumInvestment } = req.body;
      
      const plan = await Plan.findById(req.params.id);
      
      if (!plan) {
        return res.status(404).json({ 
          success: false,
          message: "Plan not found" 
        });
      }
      
      plan.name = name || plan.name;
      plan.interestRate = interestRate || plan.interestRate;
      plan.duration = duration || plan.duration;
      plan.minimumInvestment = minimumInvestment || plan.minimumInvestment;
      
      const updatedPlan = await plan.save();
      
      res.status(200).json({
        success: true,
        message: "Investment plan updated successfully",
        plan: updatedPlan
      });
    } catch (err) {
      console.error("Error updating plan:", err.message);
      res.status(500).json({ 
        success: false,
        message: "Failed to update investment plan" 
      });
    }
  }
);

// @desc    Delete investment plan (Admin only)
// @route   DELETE /api/investments/plans/:id
router.delete(
  "/plans/:id", 
  protect, 
  isAdmin, 
  async (req, res) => {
    try {
      const plan = await Plan.findById(req.params.id);
      
      if (!plan) {
        return res.status(404).json({ 
          success: false,
          message: "Plan not found" 
        });
      }
      
      await plan.remove();
      
      res.status(200).json({
        success: true,
        message: "Investment plan deleted successfully"
      });
    } catch (err) {
      console.error("Error deleting plan:", err.message);
      res.status(500).json({ 
        success: false,
        message: "Failed to delete investment plan" 
      });
    }
  }
);

export default router;
