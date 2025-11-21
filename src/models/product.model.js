import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './user.model.js';

export const shopProducts = pgTable('shop_products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 64 }).notNull(),
  image_url: text('image_url').notNull(),
  link_url: text('link_url').notNull(),
  created_by: integer('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
