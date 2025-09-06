import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

// Posts table with audit columns referencing users(id) with cascade
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  body: text('body').notNull(),

  // Audit fields
  created_by: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  updated_at: timestamp('updated_at'),
  deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  deleted_at: timestamp('deleted_at'),
});
