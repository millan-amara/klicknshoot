const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'pro'],
    required: true
  },
  payment: {
    provider: {
      type: String,
      default: 'paystack'
    },
    transactionId: String,
    reference: String,
    amount: Number,
    currency: {
      type: String,
      default: 'KES'
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending'
    },
    paidAt: Date
  },
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'pending'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  autoRenew: {
    type: Boolean,
    default: true
  },
  features: {
    proposalsPerMonth: Number,
    activeRequests: Number,
    canSeeBudget: Boolean,
    priority: String,
    verificationBadge: Boolean
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    lastPaymentAttempt: Date
  }
}, {
  timestamps: true
});

// Set end date based on period
subscriptionSchema.pre('save', function(next) {
  if (this.plan === 'free') {
    this.endDate = null; // Free plan never expires
    this.features = this.getFeatures();
    return next();
  }

  const endDate = new Date(this.startDate);
  
  switch (this.period) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
  }
  
  this.endDate = endDate;
  this.features = this.getFeatures();
  next();
});

// Get features based on plan
subscriptionSchema.methods.getFeatures = function() {
  const features = {
    free: {
      proposalsPerMonth: 10,
      activeRequests: 3,
      canSeeBudget: false,
      priority: 'low',
      verificationBadge: false
    },
    basic: {
      proposalsPerMonth: 50,
      activeRequests: 10,
      canSeeBudget: true,
      priority: 'medium',
      verificationBadge: true
    },
    pro: {
      proposalsPerMonth: 200,
      activeRequests: 30,
      canSeeBudget: true,
      priority: 'high',
      verificationBadge: true
    }
  };
  
  return features[this.plan];
};

// Check if subscription is active
subscriptionSchema.methods.isActive = function() {
  if (this.status !== 'active') return false;
  if (!this.endDate) return true; // Free plan
  return new Date() < this.endDate;
};

// Indexes for faster queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ 'payment.reference': 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);