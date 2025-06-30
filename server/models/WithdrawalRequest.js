import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [10, 'Minimum withdrawal amount is $10']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['BTC', 'USDT', 'ETH']
  },
  wallet: {
    type: String,
    required: [true, 'Wallet address is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  transactionHash: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
withdrawalRequestSchema.index({ userId: 1, createdAt: -1 });
withdrawalRequestSchema.index({ status: 1 });

export default mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
