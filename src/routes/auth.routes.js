import express from 'express';
import {
  signup,
  signIn,
  signOut,
  currentUser,
} from '#controllers/auth.controller.js';
import { authenticateToken } from '#middleware/auth.middleware.js';

const router = express.Router();

router.post('/sign-up', signup);
router.post('/sign-in', signIn);
router.post('/sign-out', signOut);
router.get('/me', authenticateToken, currentUser);

export default router;
