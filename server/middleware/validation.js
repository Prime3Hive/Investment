import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during validation'
    });
  }
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('btcWallet').optional().trim(),
  body('usdtWallet').optional().trim(),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const investmentValidation = [
  body('planId').notEmpty().withMessage('Plan ID is required'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1'),
];

export const depositValidation = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Deposit amount must be at least 1'),
  
  body('currency')
    .isIn(['BTC', 'USDT'])
    .withMessage('Currency must be BTC or USDT'),
];

export const withdrawalValidation = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1'),
  body('walletAddress')
    .trim()
    .notEmpty()
    .withMessage('Wallet address is required'),
  
  body('currency')
    .isIn(['BTC', 'USDT', 'ETH'])
    .withMessage('Currency must be BTC, USDT, or ETH')
];

export const investmentPlanValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Plan name is required')
    .isLength({ max: 50 })
    .withMessage('Plan name cannot exceed 50 characters'),
  body('minAmount')
    .isNumeric()
    .withMessage('Minimum amount must be a number')
    .isFloat({ min: 1 })
    .withMessage('Minimum amount must be at least 1'),
  body('maxAmount')
    .isNumeric()
    .withMessage('Maximum amount must be a number')
    .custom((value, { req }) => {
      if (parseFloat(value) <= parseFloat(req.body.minAmount)) {
        throw new Error('Maximum amount must be greater than minimum amount');
      }
      return true;
    }),
  body('roi')
    .isNumeric()
    .withMessage('ROI must be a number')
    .isFloat({ min: 0, max: 100 })
    .withMessage('ROI must be between 0 and 100'),
  body('durationHours')
    .isNumeric()
    .withMessage('Duration must be a number')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 hour'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('popularity')
    .optional()
    .isNumeric()
    .withMessage('Popularity must be a number')
    .isInt({ min: 0 })
    .withMessage('Popularity must be a non-negative integer')
];