import express from 'express';
import {
  createWithdrawalRequest,
  getUserWithdrawalRequests,
  getAllWithdrawalRequests,
  processWithdrawalRequest,
} from '../controllers/withdrawalController.js';
import { protect, authorize } from '../middleware/auth.js';
import { withdrawalValidation, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// User routes
router.post('/', protect, withdrawalValidation, validateRequest, createWithdrawalRequest);
router.get('/', protect, getUserWithdrawalRequests);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllWithdrawalRequests);
router.put('/admin/:id', protect, authorize('admin'), processWithdrawalRequest);

export default router;
