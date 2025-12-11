const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  creative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  quote: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'KES'
    },
    breakdown: [{
      item: String,
      cost: Number
    }]
  },
  timeline: {
    startDate: Date,
    endDate: Date,
    duration: String
  },
  portfolioLinks: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', 'website']
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  clientViewed: {
    type: Boolean,
    default: false
  },
  whatsappContact: {
    phoneNumber: String,
    messageSent: Boolean,
    sentAt: Date
  },
  metadata: {
    submittedAt: {
      type: Date,
      default: Date.now
    },
    viewedAt: Date,
    respondedAt: Date,
    autoRejectAt: {
      type: Date,
      default: function() {
        const date = new Date();
        date.setDate(date.getDate() + 7); // Auto-reject after 7 days
        return date;
      }
    }
  }
}, {
  timestamps: true
});

// Update request proposals array when a proposal is created
proposalSchema.post('save', async function() {
  const Request = mongoose.model('Request');
  await Request.findByIdAndUpdate(this.request, {
    $push: {
      proposals: {
        creative: this.creative,
        proposalId: this._id,
        status: 'pending'
      }
    }
  });
});

// Update creative stats when proposal is accepted
proposalSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.status === 'accepted') {
    const Creative = mongoose.model('Creative');
    await Creative.findOneAndUpdate(
      { user: doc.creative },
      { 
        $inc: { 
          'stats.acceptedProposals': 1,
          'stats.completedProjects': 1
        }
      }
    );
  }
});

// Indexes for faster queries
proposalSchema.index({ request: 1, creative: 1 }, { unique: true });
proposalSchema.index({ creative: 1, status: 1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ 'metadata.submittedAt': -1 });

module.exports = mongoose.model('Proposal', proposalSchema);