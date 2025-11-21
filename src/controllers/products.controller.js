import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import { createProductSchema } from '#validations/product.validation.js';
import {
  listShopProducts,
  createShopProduct,
  deleteShopProduct,
} from '#services/products.service.js';

export const getProducts = async (req, res, next) => {
  try {
    const products = await listShopProducts();
    res.status(200).json({ products });
  } catch (error) {
    logger.error('Error retrieving shop products', error);
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const validation = createProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validation.error),
      });
    }

    const payload = validation.data;
    const product = await createShopProduct({
      ...payload,
      createdBy: req.user?.id,
    });

    res.status(201).json({ product });
  } catch (error) {
    logger.error('Error creating shop product', error);
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    await deleteShopProduct(productId);

    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: 'Product not found' });
    }

    logger.error('Error deleting shop product', error);
    next(error);
  }
};
