import WithdrawalRequest from '../models/WithdrawalRequest.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

export const createWithdrawalRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, currency, wallet } = req.body;
    const userId = req.user.id;

    // Get user and check balance
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
      });
    }

    // Create withdrawal request
    const withdrawalRequest = await WithdrawalRequest.create([{
      userId,
      amount,
      currency,
      wallet,
    }], { session });

    // Update user balance (reserve the amount)
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore - amount;
    
    await User.findByIdAndUpdate(
      userId,
      { balance: balanceAfter },
      { session }
    );

    // Create pending transaction
    await Transaction.create([{
      userId,
      type: 'withdrawal',
      amount,
      status: 'pending',
      description: `${currency} withdrawal request - $${amount}`,
      referenceId: withdrawalRequest[0]._id,
      referenceModel: 'WithdrawalRequest',
      balanceBefore,
      balanceAfter,
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request created successfully',
      data: withdrawalRequest[0],
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Create withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  } finally {
    session.endSession();
  }
};

export const getUserWithdrawalRequests = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: withdrawals,
    });
  } catch (error) {
    console.error('Get user withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Admin functions
export const getAllWithdrawalRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const withdrawals = await WithdrawalRequest.find(filter)
      .populate('userId', 'name email')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WithdrawalRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: withdrawals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const processWithdrawalRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status, adminNotes, transactionHash } = req.body;
    const adminId = req.user.id;

    // Get withdrawal request
    const withdrawalRequest = await WithdrawalRequest.findById(id)
      .populate('userId')
      .session(session);

    if (!withdrawalRequest) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found',
      });
    }

    if (withdrawalRequest.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Withdrawal request has already been processed',
      });
    }

    // Update withdrawal request
    withdrawalRequest.status = status;
    withdrawalRequest.adminNotes = adminNotes;
    withdrawalRequest.transactionHash = transactionHash;
    withdrawalRequest.processedBy = adminId;
    await withdrawalRequest.save({ session });

    // If rejected, refund the amount to user balance
    if (status === 'rejected') {
      const user = withdrawalRequest.userId;
      const balanceBefore = user.balance;
      const balanceAfter = balanceBefore + withdrawalRequest.amount;

      await User.findByIdAndUpdate(
        user._id,
        { balance: balanceAfter },
        { session }
      );

      // Update transaction status
      await Transaction.findOneAndUpdate(
        { 
          referenceId: withdrawalRequest._id,
          referenceModel: 'WithdrawalRequest',
          type: 'withdrawal',
        },
        {
          status: 'failed',
          balanceBefore,
          balanceAfter,
        },
        { session }
      );
    } else if (status === 'confirmed') {
      // Update transaction status to completed
      await Transaction.findOneAndUpdate(
        { 
          referenceId: withdrawalRequest._id,
          referenceModel: 'WithdrawalRequest',
          type: 'withdrawal',
        },
        { status: 'completed' },
        { session }
      );
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Withdrawal request ${status} successfully`,
      data: withdrawalRequest,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Process withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  } finally {
    session.endSession();
  }
};
