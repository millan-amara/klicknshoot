const mongoose = require('mongoose');

const verificationQueueSchema = new mongoose.Schema({
  creative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creative',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  socialLinks: [{
    platform: String,
    url: String,
    verified: Boolean
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'needs_review'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  notes: String,
  rejectionReason: String,
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 3 // 3 = high, 2 = medium, 1 = low
  },
  metadata: {
    submittedAt: {
      type: Date,
      default: Date.now
    },
    lastViewedAt: Date,
    views: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
verificationQueueSchema.index({ status: 1, priority: -1 });
verificationQueueSchema.index({ creative: 1 }, { unique: true });
verificationQueueSchema.index({ 'metadata.submittedAt': 1 });

module.exports = mongoose.model('VerificationQueue', verificationQueueSchema);