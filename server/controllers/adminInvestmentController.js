import InvestmentPlan from '../models/InvestmentPlan.js';
import Investment from '../models/Investment.js';
import mongoose from 'mongoose';

/**
 * @desc    Get all investment plans (admin)
 * @route   GET /api/admin/investment-plans
 * @access  Private/Admin
 */
export const getAllInvestmentPlans = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error('Admin get all investment plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * @desc    Get investment plan by ID (admin)
 * @route   GET /api/admin/investment-plans/:id
 * @access  Private/Admin
 */
export const getInvestmentPlanById = async (req, res) => {
  try {
    const plan = await InvestmentPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found',
      });
    }

    // Get count of investments for this plan
    const investmentCount = await Investment.countDocuments({ planId: plan._id });
    
    res.status(200).json({
      success: true,
      data: {
        ...plan.toObject(),
        investmentCount
      },
    });
  } catch (error) {
    console.error('Admin get investment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * @desc    Create investment plan (admin)
 * @route   POST /api/admin/investment-plans
 * @access  Private/Admin
 */
export const createInvestmentPlan = async (req, res) => {
  try {
    const {
      name,
      minAmount,
      maxAmount,
      roi,
      durationHours,
      description,
      features,
      isActive,
      popularity
    } = req.body;

    // Check if plan with same name already exists
    const existingPlan = await InvestmentPlan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: 'Investment plan with this name already exists',
      });
    }

    const plan = await InvestmentPlan.create({
      name,
      minAmount,
      maxAmount,
      roi,
      durationHours,
      description,
      features: features || [],
      isActive: isActive !== undefined ? isActive : true,
      popularity: popularity || 0
    });

    res.status(201).json({
      success: true,
      message: 'Investment plan created successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Admin create investment plan error:', error);
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * @desc    Update investment plan (admin)
 * @route   PUT /api/admin/investment-plans/:id
 * @access  Private/Admin
 */
export const updateInvestmentPlan = async (req, res) => {
  try {
    const {
      name,
      minAmount,
      maxAmount,
      roi,
      durationHours,
      description,
      features,
      isActive,
      popularity
    } = req.body;

    // Check if plan exists
    let plan = await InvestmentPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found',
      });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== plan.name) {
      const existingPlan = await InvestmentPlan.findOne({ name });
      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: 'Investment plan with this name already exists',
        });
      }
    }

    // Update plan
    plan = await InvestmentPlan.findByIdAndUpdate(
      req.params.id,
      {
        name,
        minAmount,
        maxAmount,
        roi,
        durationHours,
        description,
        features,
        isActive,
        popularity
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Investment plan updated successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Admin update investment plan error:', error);
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * @desc    Delete investment plan (admin)
 * @route   DELETE /api/admin/investment-plans/:id
 * @access  Private/Admin
 */
export const deleteInvestmentPlan = async (req, res) => {
  try {
    // Check if plan has any investments
    const investmentCount = await Investment.countDocuments({ planId: req.params.id });
    if (investmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete plan with existing investments. Deactivate it instead.',
      });
    }

    const plan = await InvestmentPlan.findByIdAndDelete(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Investment plan deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete investment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * @desc    Toggle investment plan status (admin)
 * @route   PATCH /api/admin/investment-plans/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleInvestmentPlanStatus = async (req, res) => {
  try {
    const plan = await InvestmentPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found',
      });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Investment plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`,
      data: plan,
    });
  } catch (error) {
    console.error('Admin toggle investment plan status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
