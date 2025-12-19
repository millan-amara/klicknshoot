const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  serviceType: {
    type: String,
    enum: ['photography', 'videography', 'both'],
    required: true
  },
  budget: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },
  location: {
    city: String,
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'reviewing', 'closed', 'cancelled', 'completed'],
    default: 'open'
  },
  proposals: [{
    creative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  proposalCount: {
    type: Number,
    default: 0
  },
  isBudgetVisible: {
    type: Boolean,
    default: true
  },
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    lastProposalAt: Date,
    autoReopen: {
      type: Boolean,
      default: false
    }
  },
  expiresAt: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 30); // 30 days expiry
      return date;
    }
  }
}, {
  timestamps: true
});

// Update proposal count when proposals array changes
requestSchema.pre('save', function(next) {
  this.proposalCount = this.proposals.length;
  
  // Auto-reopen logic: if all proposals are rejected, reopen request
  if (this.proposals.length > 0 && this.status === 'closed') {
    const allRejected = this.proposals.every(p => p.status === 'rejected');
    if (allRejected) {
      this.status = 'open';
      this.metadata.autoReopen = true;
    }
  }
  
  // Close request if max proposals reached (5)
  if (this.proposals.length >= 5 && this.status === 'open') {
    this.status = 'reviewing';
  }
  
  next();
});

// Indexes for faster queries
requestSchema.index({ status: 1 });
requestSchema.index({ 'budget.min': 1, 'budget.max': 1 });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ client: 1, status: 1 });

module.exports = mongoose.model('Request', requestSchema);