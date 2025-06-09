import { Router } from 'express';
import { register, login, getProfile, validateToken } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.get('/validate', authenticateToken, validateToken);

export default router;
