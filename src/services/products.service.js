import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { shopProducts } from '#models/product.model.js';
import { asc, desc, eq, sql } from 'drizzle-orm';

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

const SHOP_AUTO_BOOTSTRAP =
  (process.env.SHOP_AUTO_BOOTSTRAP || '').toLowerCase() === 'true';

const defaultShopProducts = [
  {
    name: 'Glow Ritual Vitamin C Serum',
    category: 'beauty',
    image_url:
      'https://images.unsplash.com/photo-1506617564039-2f3b650b3d47?auto=format&fit=crop&w=800&q=80',
    link_url: 'https://www.sephora.com/product/truth-serum-P411134',
  },
  {
    name: 'HydraBloom Peptide Moisturizer',
    category: 'beauty',
    image_url:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    link_url: 'https://www.glossier.com/products/priming-moisturizer',
  },
  {
    name: 'Nordic Omega-3 Complex',
    category: 'supplement',
    image_url:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    link_url: 'https://www.thorne.com/products/dp/omega-3-w-2006390140',
  },
  {
    name: 'Vital Greens Daily Powder',
    category: 'supplement',
    image_url:
      'https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=800&q=80',
    link_url: 'https://athleticgreens.com/product/ag1',
  },
];

let shopCatalogReady = false;
let shopCatalogInitPromise = null;

const createShopNotReadyError = details => {
  const error = new Error('Shop catalog is not initialised');
  error.code = 'SHOP_NOT_READY';
  error.status = 503;
  error.details =
    details ||
    'Run `npm run db:migrate` (or `docker compose ... exec app npm run db:migrate`) to create the shop_products table and seed default picks.';
  return error;
};

const ensureShopCatalog = async () => {
  if (!SHOP_AUTO_BOOTSTRAP || shopCatalogReady) return;

  if (!shopCatalogInitPromise) {
    shopCatalogInitPromise = (async () => {
      try {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "shop_products" (
            "id" serial PRIMARY KEY NOT NULL,
            "name" varchar(255) NOT NULL,
            "category" varchar(64) NOT NULL,
            "image_url" text NOT NULL,
            "link_url" text NOT NULL,
            "created_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          )
        `);

        await db.execute(sql`
          CREATE INDEX IF NOT EXISTS "shop_products_category_idx"
          ON "shop_products" ("category")
        `);

        const existing = await db
          .select({
            count: sql < number > 'count(*)'.as('count'),
          })
          .from(shopProducts);

        const total = Number(existing?.[0]?.count ?? 0);

        if (total === 0) {
          await db.insert(shopProducts).values(defaultShopProducts);
          logger.info('Seeded default shop catalog items');
        }

        shopCatalogReady = true;
      } catch (error) {
        logger.error('Failed to initialise shop catalog', error);
        shopCatalogReady = false;
        throw createShopNotReadyError(
          `Automatic bootstrap failed. Check database permissions or run migrations manually. (${error.message})`
        );
      } finally {
        shopCatalogInitPromise = null;
      }
    })();
  }

  await shopCatalogInitPromise;
};

const handleShopFailure = error => {
  const message = error?.message?.toLowerCase() || '';
  const mentionsShopTable = message.includes('shop_products');

  if (error?.code === 'SHOP_NOT_READY' || mentionsShopTable) {
    if (SHOP_AUTO_BOOTSTRAP && !mentionsShopTable) {
      throw error;
    }

    throw createShopNotReadyError(
      SHOP_AUTO_BOOTSTRAP
        ? error.details
        : 'Run `npm run db:migrate` to create shop_products or allow auto-bootstrap by setting SHOP_AUTO_BOOTSTRAP=true.'
    );
  }

  throw error;
};

export const listShopProducts = async () => {
  try {
    await ensureShopCatalog();
    return await db
      .select(productSelection)
      .from(shopProducts)
      .orderBy(asc(shopProducts.category), desc(shopProducts.created_at));
  } catch (error) {
    logger.error('Failed to load shop products', error);
    throw handleShopFailure(error);
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
    await ensureShopCatalog();
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
    throw handleShopFailure(error);
  }
};

export const deleteShopProduct = async id => {
  try {
    await ensureShopCatalog();
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
    throw handleShopFailure(error);
  }
};

export const updateShopProduct = async (id, updates) => {
  try {
    await ensureShopCatalog();
    const payload = {};

    if (typeof updates.name === 'string') {
      payload.name = updates.name;
    }

    if (typeof updates.category === 'string') {
      payload.category = updates.category;
    }

    if (typeof updates.imageUrl === 'string') {
      payload.image_url = updates.imageUrl;
    }

    if (typeof updates.linkUrl === 'string') {
      payload.link_url = updates.linkUrl;
    }

    if (Object.keys(payload).length === 0) {
      throw new Error('No updates were supplied.');
    }

    payload.updated_at = sql`now()`;

    const [product] = await db
      .update(shopProducts)
      .set(payload)
      .where(eq(shopProducts.id, id))
      .returning(productSelection);

    if (!product) {
      throw new Error('Product not found');
    }

    logger.info(`Shop product updated: ${product.name} (${product.id})`);
    return product;
  } catch (error) {
    logger.error(`Failed to update shop product ${id}`, error);
    throw handleShopFailure(error);
  }
};
