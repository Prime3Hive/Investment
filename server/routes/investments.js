import express from 'express';
import {
  getInvestmentPlans,
  createInvestment,
  getUserInvestments,
  getInvestmentById,
} from '../controllers/investmentController.js';
import { protect } from '../middleware/auth.js';
import { investmentValidation, validateRequest } from '../middleware/validation.js';

const router = express.Router();

router.get('/plans', protect, getInvestmentPlans);
router.post('/', protect, investmentValidation, validateRequest, createInvestment);
router.get('/', protect, getUserInvestments);
router.get('/:id', protect, getInvestmentById);

export default router;