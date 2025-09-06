import { pgTable, text, boolean, timestamp, uuid, decimal, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { categories } from './categories';

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  sku: text('sku').notNull().unique(),
  barcode: text('barcode').unique(),
  category_id: uuid('category_id').references(() => categories.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  description: text('description'),
  unit_price: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  cost_price: decimal('cost_price', { precision: 10, scale: 2 }),
  minimum_stock_level: integer('minimum_stock_level').default(0).notNull(),
  is_active: boolean('is_active').default(true).notNull(),

  // Audit fields
  created_by: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  updated_at: timestamp('updated_at'),
  deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  deleted_at: timestamp('deleted_at'),
});
