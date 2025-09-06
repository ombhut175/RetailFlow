import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { products } from '../schema/products';
import { categories } from '../schema/categories';
import { eq, and, isNull, ilike, desc, gte, lte, or, count } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';
import { MESSAGES } from '../../../common/constants/string-const';

export interface CreateProductDto {
  name: string;
  sku: string;
  barcode?: string;
  category_id?: string;
  description?: string;
  unit_price: number;
  cost_price?: number;
  minimum_stock_level?: number;
  is_active?: boolean;
  created_by: string; // UUID of the user creating the product
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  barcode?: string;
  category_id?: string;
  description?: string;
  unit_price?: number;
  cost_price?: number;
  minimum_stock_level?: number;
  is_active?: boolean;
  updated_by: string; // UUID of the user updating the product
}

export interface ProductEntity {
  id: string; // UUID
  name: string;
  sku: string;
  barcode: string | null;
  category_id: string | null;
  description: string | null;
  unit_price: string; // Decimal stored as string
  cost_price: string | null; // Decimal stored as string
  minimum_stock_level: number;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_by: string | null;
  updated_at: Date | null;
  deleted_by: string | null;
  deleted_at: Date | null;
}

export interface ProductWithCategory extends ProductEntity {
  category?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

export interface ProductFilters {
  name?: string;
  sku?: string;
  barcode?: string;
  category_id?: string;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
  withDeleted?: boolean;
  withCategory?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'sku' | 'unit_price' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductsRepository extends BaseRepository<ProductEntity> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  //#region ==================== CRUD OPERATIONS ====================

  async create(productData: CreateProductDto): Promise<ProductEntity> {
    this.logger.log(`Creating product: ${productData.name} (SKU: ${productData.sku})`);
    
    try {
      const result = await this.db
        .insert(products)
        .values({
          name: productData.name,
          sku: productData.sku,
          barcode: productData.barcode || null,
          category_id: productData.category_id || null,
          description: productData.description || null,
          unit_price: productData.unit_price.toString(),
          cost_price: productData.cost_price?.toString() || null,
          minimum_stock_level: productData.minimum_stock_level ?? 0,
          is_active: productData.is_active ?? true,
          created_by: productData.created_by,
          created_at: new Date(),
        })
        .returning();

      this.logger.log(`Product created successfully: ${productData.name} (ID: ${result[0].id})`);
      return result[0] as ProductEntity;
    } catch (error) {
      this.logger.error(`Failed to create product: ${productData.name}`, error.stack);
      throw error;
    }
  }

  async findById(id: string, withDeleted = false): Promise<ProductEntity | null> {
    this.logger.log(`Finding product by ID: ${id}`);
    
    const condition = withDeleted 
      ? eq(products.id, id)
      : and(eq(products.id, id), isNull(products.deleted_at));
    
    const result = await this.findOne(products, condition);
    if (result) {
      this.logger.log(`Product found: ${result.name} (ID: ${id})`);
    } else {
      this.logger.log(`Product not found with ID: ${id}`);
    }
    return result;
  }

  async findProductByIdOrThrow(id: string, withDeleted = false): Promise<ProductEntity> {
    const condition = withDeleted 
      ? eq(products.id, id)
      : and(eq(products.id, id), isNull(products.deleted_at));
    
    return super.findOneOrThrow(products, condition, MESSAGES.PRODUCT_NOT_FOUND);
  }

  async findByIdWithCategory(id: string, withDeleted = false): Promise<ProductWithCategory | null> {
    this.logger.log(`Finding product with category by ID: ${id}`);
    
    try {
      const condition = withDeleted 
        ? eq(products.id, id)
        : and(eq(products.id, id), isNull(products.deleted_at));
      
      const result = await this.db
        .select({
          // Product fields
          id: products.id,
          name: products.name,
          sku: products.sku,
          barcode: products.barcode,
          category_id: products.category_id,
          description: products.description,
          unit_price: products.unit_price,
          cost_price: products.cost_price,
          minimum_stock_level: products.minimum_stock_level,
          is_active: products.is_active,
          created_by: products.created_by,
          created_at: products.created_at,
          updated_by: products.updated_by,
          updated_at: products.updated_at,
          deleted_by: products.deleted_by,
          deleted_at: products.deleted_at,
          // Category fields
          category_id_ref: categories.id,
          category_name: categories.name,
          category_description: categories.description,
        })
        .from(products)
        .leftJoin(categories, and(
          eq(products.category_id, categories.id),
          isNull(categories.deleted_at)
        ))
        .where(condition)
        .limit(1);

      if (!result.length) {
        this.logger.log(`Product not found with ID: ${id}`);
        return null;
      }

      const row = result[0];
      const productWithCategory: ProductWithCategory = {
        id: row.id,
        name: row.name,
        sku: row.sku,
        barcode: row.barcode,
        category_id: row.category_id,
        description: row.description,
        unit_price: row.unit_price,
        cost_price: row.cost_price,
        minimum_stock_level: row.minimum_stock_level,
        is_active: row.is_active,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_by: row.updated_by,
        updated_at: row.updated_at,
        deleted_by: row.deleted_by,
        deleted_at: row.deleted_at,
        category: row.category_id_ref ? {
          id: row.category_id_ref,
          name: row.category_name!,
          description: row.category_description,
        } : null,
      };

      this.logger.log(`Product with category found: ${productWithCategory.name} (ID: ${id})`);
      return productWithCategory;
    } catch (error) {
      this.logger.error(`Failed to find product with category by ID: ${id}`, error.stack);
      throw error;
    }
  }

  async findBySku(sku: string, withDeleted = false): Promise<ProductEntity | null> {
    this.logger.log(`Finding product by SKU: ${sku}`);
    
    const condition = withDeleted 
      ? eq(products.sku, sku)
      : and(eq(products.sku, sku), isNull(products.deleted_at));
    
    const result = await this.findOne(products, condition);
    if (result) {
      this.logger.log(`Product found with SKU: ${sku} (ID: ${result.id})`);
    } else {
      this.logger.log(`Product not found with SKU: ${sku}`);
    }
    return result;
  }

  async findByBarcode(barcode: string, withDeleted = false): Promise<ProductEntity | null> {
    this.logger.log(`Finding product by barcode: ${barcode}`);
    
    const condition = withDeleted 
      ? eq(products.barcode, barcode)
      : and(eq(products.barcode, barcode), isNull(products.deleted_at));
    
    const result = await this.findOne(products, condition);
    if (result) {
      this.logger.log(`Product found with barcode: ${barcode} (ID: ${result.id})`);
    } else {
      this.logger.log(`Product not found with barcode: ${barcode}`);
    }
    return result;
  }

  async findAll(filters: ProductFilters = {}, pagination?: PaginationOptions): Promise<PaginatedResult<ProductWithCategory> | ProductWithCategory[]> {
    this.logger.log('Finding products with filters', { filters, pagination });
    
    try {
      // Build base query
      let query = this.db
        .select({
          // Product fields
          id: products.id,
          name: products.name,
          sku: products.sku,
          barcode: products.barcode,
          category_id: products.category_id,
          description: products.description,
          unit_price: products.unit_price,
          cost_price: products.cost_price,
          minimum_stock_level: products.minimum_stock_level,
          is_active: products.is_active,
          created_by: products.created_by,
          created_at: products.created_at,
          updated_by: products.updated_by,
          updated_at: products.updated_at,
          deleted_by: products.deleted_by,
          deleted_at: products.deleted_at,
          // Category fields
          category_id_ref: categories.id,
          category_name: categories.name,
          category_description: categories.description,
        })
        .from(products);

      // Add category join if needed
      if (filters.withCategory !== false) {
        query = query.leftJoin(categories, and(
          eq(products.category_id, categories.id),
          isNull(categories.deleted_at)
        )) as any;
      }
      
      // Build where conditions
      const conditions = [];
      
      // Soft delete filter (default: exclude deleted)
      if (!filters.withDeleted) {
        conditions.push(isNull(products.deleted_at));
      }
      
      // Active status filter
      if (filters.is_active !== undefined) {
        conditions.push(eq(products.is_active, filters.is_active));
      }
      
      // Category filter
      if (filters.category_id) {
        conditions.push(eq(products.category_id, filters.category_id));
      }
      
      // Name search filter
      if (filters.name) {
        conditions.push(ilike(products.name, `%${filters.name}%`));
      }
      
      // SKU search filter
      if (filters.sku) {
        conditions.push(ilike(products.sku, `%${filters.sku}%`));
      }
      
      // Barcode filter
      if (filters.barcode) {
        conditions.push(eq(products.barcode, filters.barcode));
      }
      
      // Price range filters
      if (filters.min_price !== undefined) {
        conditions.push(gte(products.unit_price, filters.min_price.toString()));
      }
      
      if (filters.max_price !== undefined) {
        conditions.push(lte(products.unit_price, filters.max_price.toString()));
      }
      
      // Apply conditions
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      // Handle pagination
      if (pagination) {
        const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = pagination;
        
        // Add sorting
        const sortColumn = products[sortBy] || products.name;
        query = sortOrder === 'desc' 
          ? query.orderBy(desc(sortColumn)) as any
          : query.orderBy(sortColumn) as any;
        
        // Get total count for pagination
        let countQuery = this.db.select({ count: count() }).from(products);
        if (conditions.length > 0) {
          countQuery = countQuery.where(and(...conditions)) as any;
        }
        const totalResult = await countQuery;
        const total = totalResult[0]?.count || 0;
        
        // Apply pagination
        const offset = (page - 1) * limit;
        query = query.limit(limit).offset(offset) as any;
        
        const result = await query;
        const data = this.mapResultsToProductsWithCategory(result);
        
        this.logger.log(`Retrieved ${data.length} products (page ${page}/${Math.ceil(total / limit)})`);
        
        return {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      } else {
        // No pagination - return all results
        query = query.orderBy(products.name) as any;
        const result = await query;
        const data = this.mapResultsToProductsWithCategory(result);
        
        this.logger.log(`Retrieved ${data.length} products`);
        return data;
      }
    } catch (error) {
      this.logger.error('Failed to fetch products', error.stack);
      throw error;
    }
  }

  private mapResultsToProductsWithCategory(results: any[]): ProductWithCategory[] {
    return results.map(row => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      barcode: row.barcode,
      category_id: row.category_id,
      description: row.description,
      unit_price: row.unit_price,
      cost_price: row.cost_price,
      minimum_stock_level: row.minimum_stock_level,
      is_active: row.is_active,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_by: row.updated_by,
      updated_at: row.updated_at,
      deleted_by: row.deleted_by,
      deleted_at: row.deleted_at,
      category: row.category_id_ref ? {
        id: row.category_id_ref,
        name: row.category_name,
        description: row.category_description,
      } : null,
    }));
  }

  async update(id: string, productData: UpdateProductDto): Promise<ProductEntity> {
    this.logger.log(`Updating product: ${id}`);
    
    try {
      const updateData: any = {
        updated_by: productData.updated_by,
        updated_at: new Date(),
      };

      if (productData.name !== undefined) {
        updateData.name = productData.name;
      }

      if (productData.sku !== undefined) {
        updateData.sku = productData.sku;
      }

      if (productData.barcode !== undefined) {
        updateData.barcode = productData.barcode;
      }

      if (productData.category_id !== undefined) {
        updateData.category_id = productData.category_id;
      }

      if (productData.description !== undefined) {
        updateData.description = productData.description;
      }

      if (productData.unit_price !== undefined) {
        updateData.unit_price = productData.unit_price.toString();
      }

      if (productData.cost_price !== undefined) {
        updateData.cost_price = productData.cost_price?.toString() || null;
      }

      if (productData.minimum_stock_level !== undefined) {
        updateData.minimum_stock_level = productData.minimum_stock_level;
      }

      if (productData.is_active !== undefined) {
        updateData.is_active = productData.is_active;
      }

      const result = await this.db
        .update(products)
        .set(updateData)
        .where(and(eq(products.id, id), isNull(products.deleted_at)))
        .returning();

      if (!result.length) {
        this.logger.warn(`Product not found for update: ${id}`);
        throw new Error(MESSAGES.PRODUCT_NOT_FOUND);
      }

      this.logger.log(`Product updated successfully: ${id}`);
      return result[0] as ProductEntity;
    } catch (error) {
      this.logger.error(`Failed to update product: ${id}`, error.stack);
      throw error;
    }
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    this.logger.log(`Soft deleting product: ${id}`);
    
    try {
      const result = await this.db
        .update(products)
        .set({
          deleted_by: deletedBy,
          deleted_at: new Date(),
        })
        .where(and(eq(products.id, id), isNull(products.deleted_at)))
        .returning();

      if (!result.length) {
        this.logger.warn(`Product not found for soft deletion: ${id}`);
        throw new Error(MESSAGES.PRODUCT_NOT_FOUND);
      }
      
      this.logger.log(`Product soft deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to soft delete product: ${id}`, error.stack);
      throw error;
    }
  }

  async hardDelete(id: string): Promise<void> {
    this.logger.log(`Hard deleting product: ${id}`);
    
    try {
      const result = await this.db
        .delete(products)
        .where(eq(products.id, id))
        .returning();

      if (!result.length) {
        this.logger.warn(`Product not found for hard deletion: ${id}`);
        throw new Error(MESSAGES.PRODUCT_NOT_FOUND);
      }
      
      this.logger.log(`Product hard deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to hard delete product: ${id}`, error.stack);
      throw error;
    }
  }

  //#endregion

  //#region ==================== UTILITY OPERATIONS ====================

  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    this.logger.log(`Checking if product SKU exists: ${sku}`);
    
    const conditions = [eq(products.sku, sku), isNull(products.deleted_at)];
    
    if (excludeId) {
      conditions.push(eq(products.id, excludeId));
    }
    
    const exists = await this.exists(products, and(...conditions));
    this.logger.log(`Product SKU exists check for ${sku}: ${exists}`);
    return exists;
  }

  async barcodeExists(barcode: string, excludeId?: string): Promise<boolean> {
    this.logger.log(`Checking if product barcode exists: ${barcode}`);
    
    const conditions = [eq(products.barcode, barcode), isNull(products.deleted_at)];
    
    if (excludeId) {
      conditions.push(eq(products.id, excludeId));
    }
    
    const exists = await this.exists(products, and(...conditions));
    this.logger.log(`Product barcode exists check for ${barcode}: ${exists}`);
    return exists;
  }

  async getActiveProducts(): Promise<ProductEntity[]> {
    this.logger.log('Fetching active products');
    const result = await this.findAll({ is_active: true });
    return Array.isArray(result) ? result : result.data;
  }

  async getProductsByCategory(categoryId: string): Promise<ProductEntity[]> {
    this.logger.log(`Fetching products by category: ${categoryId}`);
    const result = await this.findAll({ category_id: categoryId });
    return Array.isArray(result) ? result : result.data;
  }

  async getProductsCount(withDeleted = false): Promise<number> {
    this.logger.log('Counting products');
    const condition = withDeleted ? undefined : isNull(products.deleted_at);
    return this.count(products, condition);
  }

  async searchProducts(searchTerm: string, limit = 10): Promise<ProductEntity[]> {
    this.logger.log(`Searching products with term: ${searchTerm}`);
    
    try {
      const result = await this.db
        .select()
        .from(products)
        .where(
          and(
            isNull(products.deleted_at),
            or(
              ilike(products.name, `%${searchTerm}%`),
              ilike(products.sku, `%${searchTerm}%`),
              ilike(products.description, `%${searchTerm}%`)
            )
          )
        )
        .limit(limit)
        .orderBy(products.name);

      this.logger.log(`Found ${result.length} products matching search term: ${searchTerm}`);
      return result as ProductEntity[];
    } catch (error) {
      this.logger.error(`Failed to search products with term: ${searchTerm}`, error.stack);
      throw error;
    }
  }

  async restore(id: string): Promise<ProductEntity> {
    this.logger.log(`Restoring product: ${id}`);
    
    try {
      const result = await this.db
        .update(products)
        .set({
          deleted_by: null,
          deleted_at: null,
        })
        .where(eq(products.id, id))
        .returning();

      if (!result.length) {
        this.logger.warn(`Product not found for restoration: ${id}`);
        throw new Error(MESSAGES.PRODUCT_NOT_FOUND);
      }

      this.logger.log(`Product restored successfully: ${id}`);
      return result[0] as ProductEntity;
    } catch (error) {
      this.logger.error(`Failed to restore product: ${id}`, error.stack);
      throw error;
    }
  }

  //#endregion
}