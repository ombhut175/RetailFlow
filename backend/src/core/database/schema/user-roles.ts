import { pgTable, text, boolean, timestamp, uuid, json, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// Define role enum
export const roleEnum = pgEnum('role', ['ADMIN', 'MANAGER', 'STAFF']);

// User_Roles table
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  role: roleEnum('role').notNull(),
  permissions: json('permissions').$type<string[]>(),
  is_active: boolean('is_active').default(true).notNull(),
  assigned_by: uuid('assigned_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

  // Audit fields
  created_by: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  updated_at: timestamp('updated_at'),
  deleted_by: uuid('deleted_by').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  deleted_at: timestamp('deleted_at'),
});
