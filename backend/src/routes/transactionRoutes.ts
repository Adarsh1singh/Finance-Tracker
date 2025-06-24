import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Transaction routes
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
