import { pgTable, timestamp, uuid, integer, decimal } from 'drizzle-orm/pg-core';
import { users } from './users';
import { salesInvoices } from './sales-invoices';
import { products } from './products';

// Sales_Invoice_Items table
export const salesInvoiceItems = pgTable('sales_invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sales_invoice_id: uuid('sales_invoice_id').notNull().references(() => salesInvoices.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  product_id: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  quantity: integer('quantity').notNull(),
  unit_price: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  total_price: decimal('total_price', { precision: 12, scale: 2 }).notNull(),

  // Audit fields
  created_by: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  updated_at: timestamp('updated_at'),
  deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  deleted_at: timestamp('deleted_at'),
});
