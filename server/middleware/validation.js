const { body, validationResult } = require('express-validator');

exports.validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['creative', 'client']),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('phoneNumber').notEmpty().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateRequest = [
  body('title').notEmpty().trim().isLength({ max: 100 }),
  body('description').notEmpty().trim().isLength({ max: 1000 }),
  body('serviceType').isIn(['photography', 'videography', 'both']),
  body('budget.min').isInt({ min: 0 }),
  body('budget.max').isInt({ min: 0 }),
  body('date').isISO8601().toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors)
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateProposal = [
  body('request').notEmpty().isMongoId(),
  body('message').notEmpty().trim().isLength({ max: 1000 }),
  body('quote.amount').isInt({ min: 0 }),
  body('timeline.startDate').optional().isISO8601().toDate(),
  body('timeline.endDate').optional().isISO8601().toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];