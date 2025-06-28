import express from 'express';
import {
  createDepositRequest,
  getUserDepositRequests,
  getAllDepositRequests,
  processDepositRequest,
} from '../controllers/depositController.js';
import { protect, authorize } from '../middleware/auth.js';
import { depositValidation, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// User routes
router.post('/', protect, depositValidation, validateRequest, createDepositRequest);
router.get('/', protect, getUserDepositRequests);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllDepositRequests);
router.put('/admin/:id', protect, authorize('admin'), processDepositRequest);

export default router;