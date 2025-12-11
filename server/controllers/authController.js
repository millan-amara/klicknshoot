const User = require('../models/user');

// REGISTER - Uses passport-local-mongoose's User.register() method
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Use passport-local-mongoose's register method
    // Note: passport-local-mongoose automatically hashes the password
    const user = await User.register({
      email,
      role,
      profileComplete: role === 'client', // Client profile is simpler
      subscription: 'free'
    }, password);

    // Create profile based on role
    if (role === 'creative') {
      const Creative = require('../models/creative');
      const creative = new Creative({
        user: user._id,
        firstName,
        lastName,
        phoneNumber
      });
      await creative.save();
    } else if (role === 'client') {
      const Client = require('../models/client');
      const client = new Client({
        user: user._id,
        firstName,
        lastName,
        phoneNumber
      });
      await client.save();
    }

    // Auto-login after registration
    req.login(user, async (err) => {
      if (err) {
        return next(err);
      }

      // Get profile data
      let profile = null;
      if (user.role === 'creative') {
        const Creative = require('../models/creative');
        profile = await Creative.findOne({ user: user._id });
      } else if (user.role === 'client') {
        const Client = require('../models/client');
        profile = await Client.findOne({ user: user._id });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profileComplete: user.profileComplete,
          subscription: user.subscription,
          profile
        },
        message: 'Registration successful'
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// LOGIN - Uses Passport's local strategy
exports.login = async (req, res) => {
  try {
    console.log('req.user', req.user);

    console.log('noooo')
    // Passport already authenticated the user at this point
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get profile data
    let profile = null;
    if (user.role === 'creative') {
      const Creative = require('../models/creative');
      profile = await Creative.findOne({ user: user._id });
    } else if (user.role === 'client') {
      const Client = require('../models/client');
      profile = await Client.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
        subscription: user.subscription,
        profile
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// LOGOUT - Destroys the session
exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      
      res.clearCookie('session'); // Clear the session cookie
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
};

// GET CURRENT USER - From session
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    const user = req.user;
    
    // Get profile data
    let profile = null;
    if (user.role === 'creative') {
      const Creative = require('../models/creative');
      profile = await Creative.findOne({ user: user._id });
    } else if (user.role === 'client') {
      const Client = require('../models/client');
      profile = await Client.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
        subscription: user.subscription,
        profile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// AUTH STATUS - Simple endpoint to check if user is authenticated
exports.authStatus = (req, res) => {
  res.json({
    success: true,
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    } : null
  });
};