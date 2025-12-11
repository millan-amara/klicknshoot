const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose').default;

// const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {  // Optional: can be removed if you only use email
    type: String,
    unique: true,
    sparse: true  // Allows null/undefined values for uniqueness
  },
  role: {
    type: String,
    enum: ['creative', 'client', 'admin'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: String,
    enum: ['free', 'basic', 'pro'],
    default: 'free'
  },
  subscriptionExpiry: {
    type: Date
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Configure passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  usernameLowerCase: true,
  hashField: 'password',  // This tells passport-local-mongoose to use 'password' field
  errorMessages: {
    UserExistsError: 'A user with the given email is already registered'
  }
});

// Custom method for comparing passwords (optional - passport-local-mongoose provides one)
userSchema.methods.comparePassword = async function(candidatePassword) {
  // This will be added by passport-local-mongoose
  return this.authenticate(candidatePassword);
};

// Get user limits based on subscription (keep your existing method)
userSchema.methods.getLimits = function() {
  const limits = {
    free: {
      proposalsPerMonth: 10,
      activeRequests: 3,
      canSeeBudget: false,
      priority: 'low'
    },
    basic: {
      proposalsPerMonth: 50,
      activeRequests: 10,
      canSeeBudget: true,
      priority: 'medium'
    },
    pro: {
      proposalsPerMonth: 200,
      activeRequests: 30,
      canSeeBudget: true,
      priority: 'high'
    }
  };
  
  return limits[this.subscription];
};

module.exports = mongoose.model('User', userSchema);