import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvestmentPlan',
    required: [true, 'Investment plan ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Investment amount is required'],
    min: [1, 'Investment amount must be at least 1']
  },
  roi: {
    type: Number,
    required: [true, 'ROI percentage is required'],
    min: [0, 'ROI cannot be negative']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  profitAmount: {
    type: Number,
    default: 0
  },
  isProfitPaid: {
    type: Boolean,
    default: false
  },
  isReinvestment: {
    type: Boolean,
    default: false
  },
  parentInvestmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
investmentSchema.index({ userId: 1, status: 1 });
investmentSchema.index({ endDate: 1, status: 1 });
investmentSchema.index({ planId: 1 });

// Virtual for total return
investmentSchema.virtual('totalReturn').get(function() {
  return this.amount + this.profitAmount;
});

// Virtual for time remaining
investmentSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const remaining = this.endDate.getTime() - now.getTime();
  return Math.max(0, remaining);
});

// Virtual for progress percentage
investmentSchema.virtual('progressPercentage').get(function() {
  const now = new Date();
  const total = this.endDate.getTime() - this.startDate.getTime();
  const elapsed = now.getTime() - this.startDate.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
});

// Calculate profit amount before saving
investmentSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('roi')) {
    this.profitAmount = (this.amount * this.roi) / 100;
  }
  next();
});

export default mongoose.model('Investment', investmentSchema);