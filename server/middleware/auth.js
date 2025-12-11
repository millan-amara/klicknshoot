const User = require('../models/user');
const ExpressError = require('../utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.originalUrl.startsWith('/api')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.redirect('/login');
    }
    next();
};

exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};