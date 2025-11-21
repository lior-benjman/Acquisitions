import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProducts,
} from '#controllers/products.controller.js';
import {
  authenticateToken,
  requireRole,
} from '#middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', authenticateToken, requireRole(['admin']), createProduct);
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  deleteProduct
);

export default router;
