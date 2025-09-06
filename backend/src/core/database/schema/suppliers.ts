import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  contact_person: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  is_active: boolean('is_active').default(true).notNull(),

  // Audit fields
  created_by: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  updated_at: timestamp('updated_at'),
  deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  deleted_at: timestamp('deleted_at'),
});
