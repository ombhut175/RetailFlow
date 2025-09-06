import { pgTable, text, timestamp, uuid, decimal, date, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { suppliers } from './suppliers';

// Define purchase order status enum
export const purchaseOrderStatusEnum = pgEnum('purchase_order_status', ['PENDING', 'CONFIRMED', 'RECEIVED', 'CANCELLED']);

// Purchase_Orders table
export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  supplier_id: uuid('supplier_id').notNull().references(() => suppliers.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  order_number: text('order_number').notNull().unique(),
  status: purchaseOrderStatusEnum('status').notNull(),
  order_date: date('order_date'),
  expected_delivery_date: date('expected_delivery_date'),
  total_amount: decimal('total_amount', { precision: 12, scale: 2 }),
  notes: text('notes'),

  // Audit fields
  created_by: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  updated_at: timestamp('updated_at'),
  deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  deleted_at: timestamp('deleted_at'),
});
