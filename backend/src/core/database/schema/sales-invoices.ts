import { pgTable, text, timestamp, uuid, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// Define payment status enum
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PAID', 'PARTIAL', 'CANCELLED']);

// Sales_Invoices table
export const salesInvoices = pgTable('sales_invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoice_number: text('invoice_number').notNull().unique(),
  customer_name: text('customer_name'),
  customer_email: text('customer_email'),
  customer_phone: text('customer_phone'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  tax_amount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  discount_amount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  total_amount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  payment_status: paymentStatusEnum('payment_status').notNull(),

  // Audit fields
  created_by: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  updated_at: timestamp('updated_at'),
  deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  deleted_at: timestamp('deleted_at'),
});
