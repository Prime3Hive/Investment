import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('btcWallet')
    .trim()
    .notEmpty()
    .withMessage('BTC wallet address is required'),
  
  body('usdtWallet')
    .trim()
    .notEmpty()
    .withMessage('USDT wallet address is required'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const investmentValidation = [
  body('planId')
    .isMongoId()
    .withMessage('Valid plan ID is required'),
  
  body('amount')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Investment amount must be at least 1'),
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