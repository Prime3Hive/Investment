import express from 'express';
import {
  getAllInvestmentPlans,
  getInvestmentPlanById,
  createInvestmentPlan,
  updateInvestmentPlan,
  deleteInvestmentPlan,
  toggleInvestmentPlanStatus
} from '../controllers/adminInvestmentController.js';
import { protect } from '../middleware/auth.js';
import isAdmin from '../middleware/adminAuth.js';
import { investmentPlanValidation, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);
router.use(isAdmin);

// Investment plan routes
router.route('/')
  .get(getAllInvestmentPlans)
  .post(investmentPlanValidation, validateRequest, createInvestmentPlan);

router.route('/:id')
  .get(getInvestmentPlanById)
  .put(investmentPlanValidation, validateRequest, updateInvestmentPlan)
  .delete(deleteInvestmentPlan);

router.patch('/:id/toggle-status', toggleInvestmentPlanStatus);

export default router;
