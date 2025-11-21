import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { shopProducts } from '#models/product.model.js';
import { asc, desc, eq } from 'drizzle-orm';

const productSelection = {
  id: shopProducts.id,
  name: shopProducts.name,
  category: shopProducts.category,
  imageUrl: shopProducts.image_url,
  linkUrl: shopProducts.link_url,
  createdAt: shopProducts.created_at,
  updatedAt: shopProducts.updated_at,
  createdBy: shopProducts.created_by,
};

export const listShopProducts = async () => {
  try {
    return await db
      .select(productSelection)
      .from(shopProducts)
      .orderBy(asc(shopProducts.category), desc(shopProducts.created_at));
  } catch (error) {
    logger.error('Failed to load shop products', error);
    throw error;
  }
};

export const createShopProduct = async ({
  name,
  category,
  imageUrl,
  linkUrl,
  createdBy,
}) => {
  try {
    const [product] = await db
      .insert(shopProducts)
      .values({
        name,
        category,
        image_url: imageUrl,
        link_url: linkUrl,
        created_by: createdBy ?? null,
      })
      .returning(productSelection);

    logger.info(`Shop product created: ${product.name}`);
    return product;
  } catch (error) {
    logger.error('Failed to create shop product', error);
    throw error;
  }
};

export const deleteShopProduct = async id => {
  try {
    const [removed] = await db
      .delete(shopProducts)
      .where(eq(shopProducts.id, id))
      .returning(productSelection);

    if (!removed) {
      throw new Error('Product not found');
    }

    logger.info(`Shop product removed: ${removed.name}`);
    return removed;
  } catch (error) {
    logger.error(`Failed to delete shop product ${id}`, error);
    throw error;
  }
};
