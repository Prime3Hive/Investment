import express from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.js';
import isAdmin from '../middleware/adminAuth.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Log a new transaction
// @route   POST /api/transactions
// @access  Private
router.post('/', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { type, amount, description, referenceId, referenceModel, metadata } = req.body;
    const userId = req.user.id;

    // Get user to update balance
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const balanceBefore = user.balance;
    let balanceAfter = balanceBefore;

    // Update user balance based on transaction type
    if (type === 'deposit' || type === 'profit') {
      balanceAfter = balanceBefore + amount;
      user.balance = balanceAfter;
    } else if (type === 'withdrawal' || type === 'investment') {
      // Check if user has enough balance
      if (balanceBefore < amount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }
      balanceAfter = balanceBefore - amount;
      user.balance = balanceAfter;
    }

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type,
      amount,
      status: 'completed', // Default for direct transactions
      description,
      referenceId,
      referenceModel,
      balanceBefore,
      balanceAfter,
      metadata
    });

    // Save transaction and updated user
    await transaction.save({ session });
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Transaction logged successfully',
      transaction,
      newBalance: balanceAfter
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error logging transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log transaction'
    });
  }
});

// @desc    Get user's transactions
// @route   GET /api/transactions
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    // Build query
    const query = { userId };
    
    if (type) query.type = type;
    if (status) query.status = status;
    
    // Date filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Check if transaction belongs to user or user is admin
    if (transaction.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction'
      });
    }
    
    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction'
    });
  }
});

// @desc    Get all transactions (admin only)
// @route   GET /api/transactions/admin/all
// @access  Admin
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const { type, status, userId, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (userId) query.userId = userId;
    
    // Date filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      transactions
    });
  } catch (error) {
    console.error('Error fetching admin transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// @desc    Update transaction status (admin only)
// @route   PATCH /api/transactions/:id/status
// @access  Admin
router.patch('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status required (pending, completed, failed)'
      });
    }
    
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Update status
    transaction.status = status;
    await transaction.save();
    
    res.status(200).json({
      success: true,
      message: 'Transaction status updated',
      transaction
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction status'
    });
  }
});

export default router;
