import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getDashboardSummary,
  getExpensesByCategory,
  getMonthlyTrends,
  exportData
} from '../controllers/analyticsController';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Analytics routes
router.get('/dashboard', getDashboardSummary);
router.get('/expenses-by-category', getExpensesByCategory);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/export', exportData);

export default router;
