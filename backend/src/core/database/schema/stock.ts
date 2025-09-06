import { pgTable, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { products } from './products';

// Stock table
export const stock = pgTable('stock', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  quantity_available: integer('quantity_available').default(0).notNull(),
  quantity_reserved: integer('quantity_reserved').default(0).notNull(),

  // Audit fields
  created_by: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  updated_at: timestamp('updated_at'),
  deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  deleted_at: timestamp('deleted_at'),
});
