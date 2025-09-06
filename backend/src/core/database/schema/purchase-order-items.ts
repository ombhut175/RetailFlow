import { pgTable, timestamp, uuid, integer, decimal } from 'drizzle-orm/pg-core';
import { users } from './users';
import { purchaseOrders } from './purchase-orders';
import { products } from './products';

// Purchase_Order_Items table
export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  purchase_order_id: uuid('purchase_order_id').notNull().references(() => purchaseOrders.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  product_id: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  quantity_ordered: integer('quantity_ordered').notNull(),
  quantity_received: integer('quantity_received').default(0).notNull(),
  unit_cost: decimal('unit_cost', { precision: 10, scale: 2 }).notNull(),
  total_cost: decimal('total_cost', { precision: 12, scale: 2 }).notNull(),

  // Audit fields
  created_by: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  updated_at: timestamp('updated_at'),
  deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  deleted_at: timestamp('deleted_at'),
});
