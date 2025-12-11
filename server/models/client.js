const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
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
  company: {
    name: String,
    website: String,
    logo: String
  },
  location: {
    county: String,
    city: String
  },
  stats: {
    totalRequests: {
      type: Number,
      default: 0
    },
    completedProjects: {
      type: Number,
      default: 0
    },
    totalBudgetSpent: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      whatsapp: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

// Create display name from first and last name if not provided
clientSchema.pre('save', function(next) {
  if (!this.displayName) {
    this.displayName = `${this.firstName} ${this.lastName}`;
  }
  next();
});

module.exports = mongoose.model('Client', clientSchema);