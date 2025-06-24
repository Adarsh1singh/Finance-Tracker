import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Budget routes
router.post('/', createBudget);
router.get('/', getBudgets);
router.get('/:id', getBudgetById);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
