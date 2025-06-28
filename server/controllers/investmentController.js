import Investment from '../models/Investment.js';
import InvestmentPlan from '../models/InvestmentPlan.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

export const getInvestmentPlans = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find({ isActive: true }).sort({ minAmount: 1 });
    
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Get investment plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const createInvestment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { planId, amount } = req.body;
    const userId = req.user.id;

    // Get investment plan
    const plan = await InvestmentPlan.findById(planId);
    if (!plan || !plan.isActive) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found or inactive',
      });
    }

    // Validate amount
    if (amount < plan.minAmount || amount > plan.maxAmount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Investment amount must be between $${plan.minAmount} and $${plan.maxAmount}`,
      });
    }

    // Get user and check balance
    const user = await User.findById(userId).session(session);
    if (user.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
      });
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + plan.durationHours);

    // Create investment
    const investment = await Investment.create([{
      userId,
      planId,
      amount,
      roi: plan.roi,
      endDate,
    }], { session });

    // Update user balance
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore - amount;
    
    await User.findByIdAndUpdate(
      userId,
      { balance: balanceAfter },
      { session }
    );

    // Create transaction record
    await Transaction.create([{
      userId,
      type: 'investment',
      amount,
      status: 'completed',
      description: `Investment in ${plan.name} plan`,
      referenceId: investment[0]._id,
      referenceModel: 'Investment',
      balanceBefore,
      balanceAfter,
    }], { session });

    await session.commitTransaction();

    // Populate the investment with plan details
    const populatedInvestment = await Investment.findById(investment[0]._id)
      .populate('planId', 'name roi durationHours');

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: populatedInvestment,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Create investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  } finally {
    session.endSession();
  }
};

export const getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id })
      .populate('planId', 'name roi durationHours description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: investments,
    });
  } catch (error) {
    console.error('Get user investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate('planId', 'name roi durationHours description');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: investment,
    });
  } catch (error) {
    console.error('Get investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Admin function to process completed investments
export const processCompletedInvestments = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    
    // Find completed investments that haven't been processed
    const completedInvestments = await Investment.find({
      status: 'active',
      endDate: { $lte: now },
      isProfitPaid: false,
    }).populate('userId').session(session);

    for (const investment of completedInvestments) {
      const user = investment.userId;
      const profitAmount = investment.profitAmount;
      const totalReturn = investment.amount + profitAmount;

      // Update user balance
      const balanceBefore = user.balance;
      const balanceAfter = balanceBefore + totalReturn;

      await User.findByIdAndUpdate(
        user._id,
        { balance: balanceAfter },
        { session }
      );

      // Update investment status
      await Investment.findByIdAndUpdate(
        investment._id,
        { 
          status: 'completed',
          isProfitPaid: true,
        },
        { session }
      );

      // Create profit transaction
      await Transaction.create([{
        userId: user._id,
        type: 'profit',
        amount: totalReturn,
        status: 'completed',
        description: `Investment completed: ${investment.amount} + ${profitAmount} profit`,
        referenceId: investment._id,
        referenceModel: 'Investment',
        balanceBefore,
        balanceAfter,
      }], { session });
    }

    await session.commitTransaction();
    console.log(`Processed ${completedInvestments.length} completed investments`);
  } catch (error) {
    await session.abortTransaction();
    console.error('Process completed investments error:', error);
  } finally {
    session.endSession();
  }
};