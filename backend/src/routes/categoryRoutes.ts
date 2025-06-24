import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Category routes
router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
