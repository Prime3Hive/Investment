import mongoose from 'mongoose';

const investmentPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    unique: true,
    trim: true
  },
  minAmount: {
    type: Number,
    required: [true, 'Minimum amount is required'],
    min: [1, 'Minimum amount must be at least 1']
  },
  maxAmount: {
    type: Number,
    required: [true, 'Maximum amount is required'],
    validate: {
      validator: function(value) {
        return value > this.minAmount;
      },
      message: 'Maximum amount must be greater than minimum amount'
    }
  },
  roi: {
    type: Number,
    required: [true, 'ROI percentage is required'],
    min: [0, 'ROI cannot be negative'],
    max: [100, 'ROI cannot exceed 100%']
  },
  durationHours: {
    type: Number,
    required: [true, 'Duration in hours is required'],
    min: [1, 'Duration must be at least 1 hour']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String,
    trim: true
  }],
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
investmentPlanSchema.index({ isActive: 1 });
investmentPlanSchema.index({ minAmount: 1, maxAmount: 1 });

// Virtual for investment count
investmentPlanSchema.virtual('investmentCount', {
  ref: 'Investment',
  localField: '_id',
  foreignField: 'planId',
  count: true
});

export default mongoose.model('InvestmentPlan', investmentPlanSchema);