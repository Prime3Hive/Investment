import DepositRequest from '../models/DepositRequest.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

export const createDepositRequest = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const userId = req.user.id;

    // Get wallet address based on currency
    const walletAddress = currency === 'BTC' 
      ? process.env.BTC_WALLET_ADDRESS 
      : process.env.USDT_WALLET_ADDRESS;

    // Create deposit request
    const depositRequest = await DepositRequest.create({
      userId,
      amount,
      currency,
      walletAddress,
    });

    // Create pending transaction
    await Transaction.create({
      userId,
      type: 'deposit',
      amount,
      status: 'pending',
      description: `${currency} deposit request - $${amount}`,
      referenceId: depositRequest._id,
      referenceModel: 'DepositRequest',
    });

    res.status(201).json({
      success: true,
      message: 'Deposit request created successfully',
      data: depositRequest,
    });
  } catch (error) {
    console.error('Create deposit request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getUserDepositRequests = async (req, res) => {
  try {
    const deposits = await DepositRequest.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: deposits,
    });
  } catch (error) {
    console.error('Get user deposits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Admin functions
export const getAllDepositRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const deposits = await DepositRequest.find(filter)
      .populate('userId', 'name email')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DepositRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: deposits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all deposits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const processDepositRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status, adminNotes, transactionHash } = req.body;
    const adminId = req.user.id;

    // Get deposit request
    const depositRequest = await DepositRequest.findById(id)
      .populate('userId')
      .session(session);

    if (!depositRequest) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Deposit request not found',
      });
    }

    if (depositRequest.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Deposit request has already been processed',
      });
    }

    // Update deposit request
    depositRequest.status = status;
    depositRequest.adminNotes = adminNotes;
    depositRequest.transactionHash = transactionHash;
    depositRequest.processedBy = adminId;
    await depositRequest.save({ session });

    // If confirmed, update user balance
    if (status === 'confirmed') {
      const user = depositRequest.userId;
      const balanceBefore = user.balance;
      const balanceAfter = balanceBefore + depositRequest.amount;

      await User.findByIdAndUpdate(
        user._id,
        { balance: balanceAfter },
        { session }
      );

      // Update transaction status
      await Transaction.findOneAndUpdate(
        { 
          referenceId: depositRequest._id,
          referenceModel: 'DepositRequest',
          type: 'deposit',
        },
        {
          status: 'completed',
          balanceBefore,
          balanceAfter,
        },
        { session }
      );
    } else if (status === 'rejected') {
      // Update transaction status to failed
      await Transaction.findOneAndUpdate(
        { 
          referenceId: depositRequest._id,
          referenceModel: 'DepositRequest',
          type: 'deposit',
        },
        { status: 'failed' },
        { session }
      );
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Deposit request ${status} successfully`,
      data: depositRequest,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Process deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  } finally {
    session.endSession();
  }
};