const mongoose = require('mongoose');

const creativeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    county: String,
    city: String,
    address: String
  },
  bio: {
    type: String,
    maxlength: 500
  },
  services: [{
    type: String,
    enum: ['photography', 'videography', 'editing', 'drone', 'event', 'portrait', 'commercial', 'wedding', 'product']
  }],
  equipment: [{
    type: String
  }],
  socialLinks: {
    instagram: String,
    twitter: String,
    facebook: String,
    tiktok: String,
    youtube: String,
    portfolio: String
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    socialProof: [{
      platform: String,
      url: String,
      verified: Boolean
    }]
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  portfolio: [{
    title: String,
    description: String,
    mediaType: {
      type: String,
      enum: ['image', 'video']
    },
    url: String,
    thumbnail: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    totalProposals: {
      type: Number,
      default: 0
    },
    acceptedProposals: {
      type: Number,
      default: 0
    },
    completedProjects: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    profileViews: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Create display name from first and last name if not provided
creativeSchema.pre('save', function(next) {
  if (!this.displayName) {
    this.displayName = `${this.firstName} ${this.lastName}`;
  }
  next();
});

// Indexes for faster queries
creativeSchema.index({ 'location.county': 1 });
creativeSchema.index({ services: 1 });
creativeSchema.index({ 'verification.isVerified': 1 });
creativeSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('Creative', creativeSchema);