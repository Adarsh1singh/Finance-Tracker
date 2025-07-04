import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getDashboardSummary,
  getExpensesByCategory,
  getMonthlyTrends,
  getTopSpendingCategories,
  getCumulativeBalance,
  exportData
} from '../controllers/analyticsController';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Analytics routes
router.get('/dashboard', getDashboardSummary);
router.get('/expenses-by-category', getExpensesByCategory);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/top-spending-categories', getTopSpendingCategories);
router.get('/cumulative-balance', getCumulativeBalance);
router.get('/export', exportData);

export default router;
