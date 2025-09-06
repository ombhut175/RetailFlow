import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { categories } from '../schema/categories';
import { eq, and, isNull, ilike, desc } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';
import { MESSAGES } from '../../../common/constants/string-const';

export interface CreateCategoryDto {
  name: string;
  description?: string;
  is_active?: boolean;
  created_by: string; // UUID of the user creating the category
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  is_active?: boolean;
  updated_by: string; // UUID of the user updating the category
}

export interface CategoryEntity {
  id: string; // UUID
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_by: string | null;
  updated_at: Date | null;
  deleted_by: string | null;
  deleted_at: Date | null;
}

export interface CategoryFilters {
  name?: string;
  is_active?: boolean;
  withDeleted?: boolean;
}

@Injectable()
export class CategoriesRepository extends BaseRepository<CategoryEntity> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  //#region ==================== CRUD OPERATIONS ====================

  async create(categoryData: CreateCategoryDto): Promise<CategoryEntity> {
    this.logger.log(`Creating category: ${categoryData.name}`);
    
    try {
      const result = await this.db
        .insert(categories)
        .values({
          name: categoryData.name,
          description: categoryData.description || null,
          is_active: categoryData.is_active ?? true,
          created_by: categoryData.created_by,
          created_at: new Date(),
        })
        .returning();

      this.logger.log(`Category created successfully: ${categoryData.name} (ID: ${result[0].id})`);
      return result[0] as CategoryEntity;
    } catch (error) {
      this.logger.error(`Failed to create category: ${categoryData.name}`, error.stack);
      throw error;
    }
  }

  async findById(id: string, withDeleted = false): Promise<CategoryEntity | null> {
    this.logger.log(`Finding category by ID: ${id}`);
    
    const condition = withDeleted 
      ? eq(categories.id, id)
      : and(eq(categories.id, id), isNull(categories.deleted_at));
    
    const result = await this.findOne(categories, condition);
    if (result) {
      this.logger.log(`Category found: ${result.name} (ID: ${id})`);
    } else {
      this.logger.log(`Category not found with ID: ${id}`);
    }
    return result;
  }

  async findCategoryByIdOrThrow(id: string, withDeleted = false): Promise<CategoryEntity> {
    const condition = withDeleted 
      ? eq(categories.id, id)
      : and(eq(categories.id, id), isNull(categories.deleted_at));
    
    return super.findOneOrThrow(categories, condition, MESSAGES.CATEGORY_NOT_FOUND);
  }

  async findByName(name: string, withDeleted = false): Promise<CategoryEntity | null> {
    this.logger.log(`Finding category by name: ${name}`);
    
    const condition = withDeleted 
      ? eq(categories.name, name)
      : and(eq(categories.name, name), isNull(categories.deleted_at));
    
    const result = await this.findOne(categories, condition);
    if (result) {
      this.logger.log(`Category found with name: ${name} (ID: ${result.id})`);
    } else {
      this.logger.log(`Category not found with name: ${name}`);
    }
    return result;
  }

  async findAll(filters: CategoryFilters = {}): Promise<CategoryEntity[]> {
    this.logger.log('Finding all categories with filters', { filters });
    
    try {
      let query = this.db.select().from(categories);
      
      // Build where conditions
      const conditions = [];
      
      // Soft delete filter (default: exclude deleted)
      if (!filters.withDeleted) {
        conditions.push(isNull(categories.deleted_at));
      }
      
      // Active status filter
      if (filters.is_active !== undefined) {
        conditions.push(eq(categories.is_active, filters.is_active));
      }
      
      // Name search filter
      if (filters.name) {
        conditions.push(ilike(categories.name, `%${filters.name}%`));
      }
      
      // Apply conditions
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      // Order by name
      query = query.orderBy(categories.name) as any;
      
      const result = await query;
      this.logger.log(`Retrieved ${result.length} categories`);
      return result as CategoryEntity[];
    } catch (error) {
      this.logger.error('Failed to fetch categories', error.stack);
      throw error;
    }
  }

  async update(id: string, categoryData: UpdateCategoryDto): Promise<CategoryEntity> {
    this.logger.log(`Updating category: ${id}`);
    
    try {
      const updateData: any = {
        updated_by: categoryData.updated_by,
        updated_at: new Date(),
      };

      if (categoryData.name !== undefined) {
        updateData.name = categoryData.name;
      }

      if (categoryData.description !== undefined) {
        updateData.description = categoryData.description;
      }

      if (categoryData.is_active !== undefined) {
        updateData.is_active = categoryData.is_active;
      }

      const result = await this.db
        .update(categories)
        .set(updateData)
        .where(and(eq(categories.id, id), isNull(categories.deleted_at)))
        .returning();

      if (!result.length) {
        this.logger.warn(`Category not found for update: ${id}`);
        throw new Error(MESSAGES.CATEGORY_NOT_FOUND);
      }

      this.logger.log(`Category updated successfully: ${id}`);
      return result[0] as CategoryEntity;
    } catch (error) {
      this.logger.error(`Failed to update category: ${id}`, error.stack);
      throw error;
    }
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    this.logger.log(`Soft deleting category: ${id}`);
    
    try {
      const result = await this.db
        .update(categories)
        .set({
          deleted_by: deletedBy,
          deleted_at: new Date(),
        })
        .where(and(eq(categories.id, id), isNull(categories.deleted_at)))
        .returning();

      if (!result.length) {
        this.logger.warn(`Category not found for soft deletion: ${id}`);
        throw new Error(MESSAGES.CATEGORY_NOT_FOUND);
      }
      
      this.logger.log(`Category soft deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to soft delete category: ${id}`, error.stack);
      throw error;
    }
  }

  async hardDelete(id: string): Promise<void> {
    this.logger.log(`Hard deleting category: ${id}`);
    
    try {
      const result = await this.db
        .delete(categories)
        .where(eq(categories.id, id))
        .returning();

      if (!result.length) {
        this.logger.warn(`Category not found for hard deletion: ${id}`);
        throw new Error(MESSAGES.CATEGORY_NOT_FOUND);
      }
      
      this.logger.log(`Category hard deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to hard delete category: ${id}`, error.stack);
      throw error;
    }
  }

  //#endregion

  //#region ==================== UTILITY OPERATIONS ====================

  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    this.logger.log(`Checking if category name exists: ${name}`);
    
    const conditions = [eq(categories.name, name), isNull(categories.deleted_at)];
    
    if (excludeId) {
      conditions.push(eq(categories.id, excludeId));
    }
    
    const exists = await this.exists(categories, and(...conditions));
    this.logger.log(`Category name exists check for ${name}: ${exists}`);
    return exists;
  }

  async getActiveCategories(): Promise<CategoryEntity[]> {
    this.logger.log('Fetching active categories');
    return this.findAll({ is_active: true });
  }

  async getCategoriesCount(withDeleted = false): Promise<number> {
    this.logger.log('Counting categories');
    const condition = withDeleted ? undefined : isNull(categories.deleted_at);
    return this.count(categories, condition);
  }

  async restore(id: string): Promise<CategoryEntity> {
    this.logger.log(`Restoring category: ${id}`);
    
    try {
      const result = await this.db
        .update(categories)
        .set({
          deleted_by: null,
          deleted_at: null,
        })
        .where(eq(categories.id, id))
        .returning();

      if (!result.length) {
        this.logger.warn(`Category not found for restoration: ${id}`);
        throw new Error(MESSAGES.CATEGORY_NOT_FOUND);
      }

      this.logger.log(`Category restored successfully: ${id}`);
      return result[0] as CategoryEntity;
    } catch (error) {
      this.logger.error(`Failed to restore category: ${id}`, error.stack);
      throw error;
    }
  }

  //#endregion
}