import { Router } from 'express';
import { body } from 'express-validator';
import { login, signup, me, logout } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post(
  '/signup',
  [
    body('name').isString().trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6 }),
  ],
  signup
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()],
  login
);

router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);

export default router;


