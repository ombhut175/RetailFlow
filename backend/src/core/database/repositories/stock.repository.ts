import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { stock } from '../schema/stock';
import { stockTransactions } from '../schema/stock-transactions';
import { products } from '../schema/products';
import { eq, and, isNull, desc, asc, sum, sql } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';
import { MESSAGES } from '../../../common/constants/string-const';

export interface CreateStockDto {
  product_id: string;
  quantity_available: number;
  quantity_reserved?: number;
  created_by: string;
}

export interface UpdateStockDto {
  quantity_available?: number;
  quantity_reserved?: number;
  updated_by: string;
}

export interface StockEntity {
  id: string;
  product_id: string;
  quantity_available: number;
  quantity_reserved: number;
  created_by: string;
  created_at: Date;
  updated_by: string | null;
  updated_at: Date | null;
  deleted_by: string | null;
  deleted_at: Date | null;
}

export interface StockWithProduct extends StockEntity {
  product?: {
    id: string;
    name: string;
    sku: string;
    barcode: string | null;
    minimum_stock_level: number;
  } | null;
}

export interface StockSummary {
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity_available: number;
  quantity_reserved: number;
  total_quantity: number;
  minimum_stock_level: number;
  is_low_stock: boolean;
}

@Injectable()
export class StockRepository extends BaseRepository<StockEntity> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  //#region ==================== CRUD OPERATIONS ====================

  async create(stockData: CreateStockDto): Promise<StockEntity> {
    this.logger.log(`Creating stock record for product: ${stockData.product_id}`);
    
    try {
      const result = await this.db.insert(stock).values({
        product_id: stockData.product_id,
        quantity_available: stockData.quantity_available,
        quantity_reserved: stockData.quantity_reserved || 0,
        created_by: stockData.created_by,
        created_at: new Date(),
      }).returning();

      this.logger.log(`Stock record created successfully for product: ${stockData.product_id}`);
      return result[0] as StockEntity;
    } catch (error) {
      this.logger.error(`Failed to create stock record for product: ${stockData.product_id}`, error.stack);
      throw error;
    }
  }

  async findByProductId(productId: string, withDeleted = false): Promise<StockEntity | null> {
    this.logger.log(`Finding stock by product ID: ${productId}`);
    
    try {
      const whereCondition = withDeleted 
        ? eq(stock.product_id, productId)
        : and(eq(stock.product_id, productId), isNull(stock.deleted_at));

      const result = await this.db.select().from(stock).where(whereCondition).limit(1);
      
      const found = result.length > 0;
      this.logger.log(`Stock ${found ? 'found' : 'not found'} for product: ${productId}`);
      return found ? (result[0] as StockEntity) : null;
    } catch (error) {
      this.logger.error(`Error finding stock for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async findByProductIdOrThrow(productId: string, withDeleted = false): Promise<StockEntity> {
    const stockRecord = await this.findByProductId(productId, withDeleted);
    if (!stockRecord) {
      throw new Error(`Stock record not found for product: ${productId}`);
    }
    return stockRecord;
  }

  async findByProductIdWithProduct(productId: string, withDeleted = false): Promise<StockWithProduct | null> {
    this.logger.log(`Finding stock with product details for product: ${productId}`);
    
    try {
      const whereCondition = withDeleted 
        ? eq(stock.product_id, productId)
        : and(eq(stock.product_id, productId), isNull(stock.deleted_at));

      const result = await this.db
        .select({
          id: stock.id,
          product_id: stock.product_id,
          quantity_available: stock.quantity_available,
          quantity_reserved: stock.quantity_reserved,
          created_by: stock.created_by,
          created_at: stock.created_at,
          updated_by: stock.updated_by,
          updated_at: stock.updated_at,
          deleted_by: stock.deleted_by,
          deleted_at: stock.deleted_at,
          product: {
            id: products.id,
            name: products.name,
            sku: products.sku,
            barcode: products.barcode,
            minimum_stock_level: products.minimum_stock_level,
          },
        })
        .from(stock)
        .leftJoin(products, eq(stock.product_id, products.id))
        .where(whereCondition)
        .limit(1);

      const found = result.length > 0;
      this.logger.log(`Stock with product ${found ? 'found' : 'not found'} for product: ${productId}`);
      return found ? (result[0] as StockWithProduct) : null;
    } catch (error) {
      this.logger.error(`Error finding stock with product for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async findAll(withDeleted = false): Promise<StockWithProduct[]> {
    this.logger.log('Finding all stock records');
    
    try {
      const whereCondition = withDeleted ? undefined : isNull(stock.deleted_at);

      const result = await this.db
        .select({
          id: stock.id,
          product_id: stock.product_id,
          quantity_available: stock.quantity_available,
          quantity_reserved: stock.quantity_reserved,
          created_by: stock.created_by,
          created_at: stock.created_at,
          updated_by: stock.updated_by,
          updated_at: stock.updated_at,
          deleted_by: stock.deleted_by,
          deleted_at: stock.deleted_at,
          product: {
            id: products.id,
            name: products.name,
            sku: products.sku,
            barcode: products.barcode,
            minimum_stock_level: products.minimum_stock_level,
          },
        })
        .from(stock)
        .leftJoin(products, eq(stock.product_id, products.id))
        .where(whereCondition)
        .orderBy(desc(stock.created_at));

      this.logger.log(`Found ${result.length} stock records`);
      return result as StockWithProduct[];
    } catch (error) {
      this.logger.error('Error finding all stock records', error.stack);
      throw error;
    }
  }

  async update(productId: string, stockData: UpdateStockDto): Promise<StockEntity> {
    this.logger.log(`Updating stock for product: ${productId}`);
    
    try {
      const updateData: any = {
        updated_by: stockData.updated_by,
        updated_at: new Date(),
      };

      if (stockData.quantity_available !== undefined) {
        updateData.quantity_available = stockData.quantity_available;
      }
      if (stockData.quantity_reserved !== undefined) {
        updateData.quantity_reserved = stockData.quantity_reserved;
      }

      const result = await this.db
        .update(stock)
        .set(updateData)
        .where(and(eq(stock.product_id, productId), isNull(stock.deleted_at)))
        .returning();

      if (!result.length) {
        throw new Error(`Stock record not found for product: ${productId}`);
      }

      this.logger.log(`Stock updated successfully for product: ${productId}`);
      return result[0] as StockEntity;
    } catch (error) {
      this.logger.error(`Failed to update stock for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async adjustQuantity(productId: string, quantityChange: number, updatedBy: string): Promise<StockEntity> {
    this.logger.log(`Adjusting stock quantity for product: ${productId} by ${quantityChange}`);
    
    try {
      const currentStock = await this.findByProductIdOrThrow(productId);
      const newQuantity = Math.max(0, currentStock.quantity_available + quantityChange);
      
      return await this.update(productId, {
        quantity_available: newQuantity,
        updated_by: updatedBy,
      });
    } catch (error) {
      this.logger.error(`Failed to adjust stock quantity for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async reserveQuantity(productId: string, quantity: number, updatedBy: string): Promise<StockEntity> {
    this.logger.log(`Reserving ${quantity} units for product: ${productId}`);
    
    try {
      const currentStock = await this.findByProductIdOrThrow(productId);
      
      if (currentStock.quantity_available < quantity) {
        throw new Error(`Insufficient stock available. Available: ${currentStock.quantity_available}, Requested: ${quantity}`);
      }
      
      return await this.update(productId, {
        quantity_available: currentStock.quantity_available - quantity,
        quantity_reserved: currentStock.quantity_reserved + quantity,
        updated_by: updatedBy,
      });
    } catch (error) {
      this.logger.error(`Failed to reserve stock for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async releaseReservedQuantity(productId: string, quantity: number, updatedBy: string): Promise<StockEntity> {
    this.logger.log(`Releasing ${quantity} reserved units for product: ${productId}`);
    
    try {
      const currentStock = await this.findByProductIdOrThrow(productId);
      
      if (currentStock.quantity_reserved < quantity) {
        throw new Error(`Insufficient reserved stock. Reserved: ${currentStock.quantity_reserved}, Requested: ${quantity}`);
      }
      
      return await this.update(productId, {
        quantity_available: currentStock.quantity_available + quantity,
        quantity_reserved: currentStock.quantity_reserved - quantity,
        updated_by: updatedBy,
      });
    } catch (error) {
      this.logger.error(`Failed to release reserved stock for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async getLowStockProducts(): Promise<StockSummary[]> {
    this.logger.log('Finding products with low stock levels');
    
    try {
      const result = await this.db
        .select({
          product_id: stock.product_id,
          product_name: products.name,
          product_sku: products.sku,
          quantity_available: stock.quantity_available,
          quantity_reserved: stock.quantity_reserved,
          minimum_stock_level: products.minimum_stock_level,
        })
        .from(stock)
        .innerJoin(products, eq(stock.product_id, products.id))
        .where(
          and(
            isNull(stock.deleted_at),
            isNull(products.deleted_at),
            sql`${stock.quantity_available} <= ${products.minimum_stock_level}`
          )
        )
        .orderBy(asc(stock.quantity_available));

      const lowStockProducts = result.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity_available: item.quantity_available,
        quantity_reserved: item.quantity_reserved,
        total_quantity: item.quantity_available + item.quantity_reserved,
        minimum_stock_level: item.minimum_stock_level,
        is_low_stock: true,
      }));

      this.logger.log(`Found ${lowStockProducts.length} products with low stock`);
      return lowStockProducts;
    } catch (error) {
      this.logger.error('Error finding low stock products', error.stack);
      throw error;
    }
  }

  async getStockSummary(): Promise<StockSummary[]> {
    this.logger.log('Getting complete stock summary');
    
    try {
      const result = await this.db
        .select({
          product_id: stock.product_id,
          product_name: products.name,
          product_sku: products.sku,
          quantity_available: stock.quantity_available,
          quantity_reserved: stock.quantity_reserved,
          minimum_stock_level: products.minimum_stock_level,
        })
        .from(stock)
        .innerJoin(products, eq(stock.product_id, products.id))
        .where(
          and(
            isNull(stock.deleted_at),
            isNull(products.deleted_at)
          )
        )
        .orderBy(asc(products.name));

      const stockSummary = result.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity_available: item.quantity_available,
        quantity_reserved: item.quantity_reserved,
        total_quantity: item.quantity_available + item.quantity_reserved,
        minimum_stock_level: item.minimum_stock_level,
        is_low_stock: item.quantity_available <= item.minimum_stock_level,
      }));

      this.logger.log(`Generated stock summary for ${stockSummary.length} products`);
      return stockSummary;
    } catch (error) {
      this.logger.error('Error generating stock summary', error.stack);
      throw error;
    }
  }

  async softDelete(productId: string, deletedBy: string): Promise<void> {
    this.logger.log(`Soft deleting stock record for product: ${productId}`);
    
    try {
      const result = await this.db
        .update(stock)
        .set({
          deleted_by: deletedBy,
          deleted_at: new Date(),
        })
        .where(and(eq(stock.product_id, productId), isNull(stock.deleted_at)))
        .returning();

      if (!result.length) {
        throw new Error(`Stock record not found for product: ${productId}`);
      }

      this.logger.log(`Stock record soft deleted successfully for product: ${productId}`);
    } catch (error) {
      this.logger.error(`Failed to soft delete stock record for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async hardDelete(productId: string): Promise<void> {
    this.logger.log(`Hard deleting stock record for product: ${productId}`);
    
    try {
      const result = await this.db
        .delete(stock)
        .where(eq(stock.product_id, productId))
        .returning();

      if (!result.length) {
        throw new Error(`Stock record not found for product: ${productId}`);
      }

      this.logger.log(`Stock record hard deleted successfully for product: ${productId}`);
    } catch (error) {
      this.logger.error(`Failed to hard delete stock record for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async restore(productId: string): Promise<StockEntity> {
    this.logger.log(`Restoring stock record for product: ${productId}`);
    
    try {
      const result = await this.db
        .update(stock)
        .set({
          deleted_by: null,
          deleted_at: null,
        })
        .where(eq(stock.product_id, productId))
        .returning();

      if (!result.length) {
        throw new Error(`Stock record not found for product: ${productId}`);
      }

      this.logger.log(`Stock record restored successfully for product: ${productId}`);
      return result[0] as StockEntity;
    } catch (error) {
      this.logger.error(`Failed to restore stock record for product: ${productId}`, error.stack);
      throw error;
    }
  }

  //#region ==================== UTILITY METHODS ====================

  async stockExists(productId: string): Promise<boolean> {
    this.logger.log(`Checking if stock exists for product: ${productId}`);
    
    try {
      const result = await this.db
        .select({ id: stock.id })
        .from(stock)
        .where(and(eq(stock.product_id, productId), isNull(stock.deleted_at)))
        .limit(1);

      const exists = result.length > 0;
      this.logger.log(`Stock ${exists ? 'exists' : 'does not exist'} for product: ${productId}`);
      return exists;
    } catch (error) {
      this.logger.error(`Error checking stock existence for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async getTotalStockValue(): Promise<number> {
    this.logger.log('Calculating total stock value');
    
    try {
      const result = await this.db
        .select({
          total_value: sql<number>`SUM(${stock.quantity_available} * CAST(${products.cost_price} AS DECIMAL))`,
        })
        .from(stock)
        .innerJoin(products, eq(stock.product_id, products.id))
        .where(
          and(
            isNull(stock.deleted_at),
            isNull(products.deleted_at)
          )
        );

      const totalValue = result[0]?.total_value || 0;
      this.logger.log(`Total stock value calculated: ${totalValue}`);
      return totalValue;
    } catch (error) {
      this.logger.error('Error calculating total stock value', error.stack);
      throw error;
    }
  }
}