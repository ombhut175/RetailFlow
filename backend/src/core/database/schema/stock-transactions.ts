import { pgTable, text, timestamp, uuid, integer, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { products } from './products';

// Define transaction type enum
export const transactionTypeEnum = pgEnum('transaction_type', ['IN', 'OUT', 'ADJUSTMENT']);

// Define reference type enum
export const referenceTypeEnum = pgEnum('reference_type', ['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN']);

// Stock_Transactions table
export const stockTransactions = pgTable('stock_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  transaction_type: transactionTypeEnum('transaction_type').notNull(),
  quantity: integer('quantity').notNull(),
  reference_type: referenceTypeEnum('reference_type').notNull(),
  reference_id: uuid('reference_id'),
  notes: text('notes'),

  // Audit fields
  created_by: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  updated_at: timestamp('updated_at'),
  deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  deleted_at: timestamp('deleted_at'),
});
