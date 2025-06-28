import mongoose from 'mongoose';

const depositRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Deposit amount is required'],
    min: [1, 'Deposit amount must be at least 1']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['BTC', 'USDT']
  },
  walletAddress: {
    type: String,
    required: [true, 'Wallet address is required'],
    trim: true
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
  },
  processedAt: Date
}, {
  timestamps: true
});

// Indexes
depositRequestSchema.index({ userId: 1, status: 1 });
depositRequestSchema.index({ status: 1, createdAt: -1 });
depositRequestSchema.index({ currency: 1 });

// Update processed fields when status changes
depositRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.processedAt = new Date();
  }
  next();
});

export default mongoose.model('DepositRequest', depositRequestSchema);