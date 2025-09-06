import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { stockTransactions } from '../schema/stock-transactions';
import { stock } from '../schema/stock';
import { products } from '../schema/products';
import { eq, and, isNull, desc, asc, gte, lte, between, sql } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';

export enum StockTransactionType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum StockReferenceType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
}

export interface CreateStockTransactionDto {
  product_id: string;
  transaction_type: StockTransactionType;
  quantity: number;
  reference_type: StockReferenceType;
  reference_id?: string;
  notes?: string;
  created_by: string;
}

export interface StockTransactionEntity {
  id: string;
  product_id: string;
  transaction_type: StockTransactionType;
  quantity: number;
  reference_id: string | null;
  reference_type: StockReferenceType | null;
  notes: string | null;
  created_by: string;
  created_at: Date;
  updated_by: string | null;
  updated_at: Date | null;
  deleted_by: string | null;
  deleted_at: Date | null;
}

export interface StockTransactionWithProduct extends StockTransactionEntity {
  product?: {
    id: string;
    name: string;
    sku: string;
    barcode: string | null;
  } | null;
}

export interface StockTransactionFilters {
  product_id?: string;
  transaction_type?: StockTransactionType;
  reference_id?: string;
  reference_type?: StockReferenceType;
  created_by?: string;
  date_from?: Date;
  date_to?: Date;
}

export interface StockTransactionPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'desc';
}

export interface StockTransactionSummary {
  product_id: string;
  product_name: string;
  product_sku: string;
  total_in: number;
  total_out: number;
  net_change: number;
  transaction_count: number;
}

@Injectable()
export class StockTransactionsRepository extends BaseRepository<StockTransactionEntity> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  //#region ==================== CRUD OPERATIONS ====================

  async create(transactionData: CreateStockTransactionDto): Promise<StockTransactionEntity> {
    this.logger.log(`Creating stock transaction for product: ${transactionData.product_id}`);
    
    try {
      const result = await this.db.insert(stockTransactions).values({
        product_id: transactionData.product_id,
        transaction_type: transactionData.transaction_type,
        quantity: transactionData.quantity,
        reference_type: transactionData.reference_type,
        reference_id: transactionData.reference_id || null,
        notes: transactionData.notes || null,
        created_by: transactionData.created_by,
        created_at: new Date(),
      }).returning();

      this.logger.log(`Stock transaction created successfully for product: ${transactionData.product_id}`);
      return result[0] as StockTransactionEntity;
    } catch (error) {
      this.logger.error(`Failed to create stock transaction for product: ${transactionData.product_id}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<StockTransactionEntity | null> {
    this.logger.log(`Finding stock transaction by ID: ${id}`);
    
    try {
      const result = await this.db
        .select()
        .from(stockTransactions)
        .where(eq(stockTransactions.id, id))
        .limit(1);
      
      const found = result.length > 0;
      this.logger.log(`Stock transaction ${found ? 'found' : 'not found'} for ID: ${id}`);
      return found ? (result[0] as StockTransactionEntity) : null;
    } catch (error) {
      this.logger.error(`Error finding stock transaction by ID: ${id}`, error.stack);
      throw error;
    }
  }

  async findByIdOrThrow(id: string): Promise<StockTransactionEntity> {
    const transaction = await this.findById(id);
    if (!transaction) {
      throw new Error(`Stock transaction not found with ID: ${id}`);
    }
    return transaction;
  }

  async findByProductId(
    productId: string,
    pagination?: StockTransactionPaginationOptions
  ): Promise<StockTransactionWithProduct[]> {
    this.logger.log(`Finding stock transactions for product: ${productId}`);
    
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 50;
      const offset = (page - 1) * limit;

      const result = await this.db
        .select({
          id: stockTransactions.id,
          product_id: stockTransactions.product_id,
          transaction_type: stockTransactions.transaction_type,
          quantity: stockTransactions.quantity,
          reference_id: stockTransactions.reference_id,
          reference_type: stockTransactions.reference_type,
          notes: stockTransactions.notes,
          created_by: stockTransactions.created_by,
          created_at: stockTransactions.created_at,
          updated_by: stockTransactions.updated_by,
          updated_at: stockTransactions.updated_at,
          deleted_by: stockTransactions.deleted_by,
          deleted_at: stockTransactions.deleted_at,
          product: {
            id: products.id,
            name: products.name,
            sku: products.sku,
            barcode: products.barcode,
          },
        })
        .from(stockTransactions)
        .leftJoin(products, eq(stockTransactions.product_id, products.id))
        .where(eq(stockTransactions.product_id, productId))
        .orderBy(desc(stockTransactions.created_at))
        .limit(limit)
        .offset(offset);

      this.logger.log(`Found ${result.length} stock transactions for product: ${productId}`);
      return result as StockTransactionWithProduct[];
    } catch (error) {
      this.logger.error(`Error finding stock transactions for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async findWithFilters(
    filters: StockTransactionFilters,
    pagination?: StockTransactionPaginationOptions
  ): Promise<StockTransactionWithProduct[]> {
    this.logger.log('Finding stock transactions with filters');
    
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 50;
      const offset = (page - 1) * limit;

      let whereConditions: any[] = [];

      if (filters.product_id) {
        whereConditions.push(eq(stockTransactions.product_id, filters.product_id));
      }
      if (filters.transaction_type) {
        whereConditions.push(eq(stockTransactions.transaction_type, filters.transaction_type as any));
      }
      if (filters.reference_id) {
        whereConditions.push(eq(stockTransactions.reference_id, filters.reference_id));
      }
      if (filters.reference_type) {
        whereConditions.push(eq(stockTransactions.reference_type, filters.reference_type as any));
      }
      if (filters.created_by) {
        whereConditions.push(eq(stockTransactions.created_by, filters.created_by));
      }
      if (filters.date_from && filters.date_to) {
        whereConditions.push(between(stockTransactions.created_at, filters.date_from, filters.date_to));
      } else if (filters.date_from) {
        whereConditions.push(gte(stockTransactions.created_at, filters.date_from));
      } else if (filters.date_to) {
        whereConditions.push(lte(stockTransactions.created_at, filters.date_to));
      }

      const whereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const result = await this.db
        .select({
          id: stockTransactions.id,
          product_id: stockTransactions.product_id,
          transaction_type: stockTransactions.transaction_type,
          quantity: stockTransactions.quantity,
          reference_id: stockTransactions.reference_id,
          reference_type: stockTransactions.reference_type,
          notes: stockTransactions.notes,
          created_by: stockTransactions.created_by,
          created_at: stockTransactions.created_at,
          updated_by: stockTransactions.updated_by,
          updated_at: stockTransactions.updated_at,
          deleted_by: stockTransactions.deleted_by,
          deleted_at: stockTransactions.deleted_at,
          product: {
            id: products.id,
            name: products.name,
            sku: products.sku,
            barcode: products.barcode,
          },
        })
        .from(stockTransactions)
        .leftJoin(products, eq(stockTransactions.product_id, products.id))
        .where(whereCondition)
        .orderBy(desc(stockTransactions.created_at))
        .limit(limit)
        .offset(offset);

      this.logger.log(`Found ${result.length} stock transactions with filters`);
      return result as StockTransactionWithProduct[];
    } catch (error) {
      this.logger.error('Error finding stock transactions with filters', error.stack);
      throw error;
    }
  }

  async findByReference(
    referenceId: string,
    referenceType?: string
  ): Promise<StockTransactionWithProduct[]> {
    this.logger.log(`Finding stock transactions by reference: ${referenceId}`);
    
    try {
      const whereCondition = referenceType
        ? and(
            eq(stockTransactions.reference_id, referenceId),
            eq(stockTransactions.reference_type, referenceType as any)
          )
        : eq(stockTransactions.reference_id, referenceId);

      const result = await this.db
        .select({
          id: stockTransactions.id,
          product_id: stockTransactions.product_id,
          transaction_type: stockTransactions.transaction_type,
          quantity: stockTransactions.quantity,
          reference_id: stockTransactions.reference_id,
          reference_type: stockTransactions.reference_type,
          notes: stockTransactions.notes,
          created_by: stockTransactions.created_by,
          created_at: stockTransactions.created_at,
          updated_by: stockTransactions.updated_by,
          updated_at: stockTransactions.updated_at,
          deleted_by: stockTransactions.deleted_by,
          deleted_at: stockTransactions.deleted_at,
          product: {
            id: products.id,
            name: products.name,
            sku: products.sku,
            barcode: products.barcode,
          },
        })
        .from(stockTransactions)
        .leftJoin(products, eq(stockTransactions.product_id, products.id))
        .where(whereCondition)
        .orderBy(desc(stockTransactions.created_at));

      this.logger.log(`Found ${result.length} stock transactions for reference: ${referenceId}`);
      return result as StockTransactionWithProduct[];
    } catch (error) {
      this.logger.error(`Error finding stock transactions by reference: ${referenceId}`, error.stack);
      throw error;
    }
  }

  async getTransactionSummaryByProduct(
    productId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<StockTransactionSummary> {
    this.logger.log(`Getting transaction summary for product: ${productId}`);
    
    try {
      let whereConditions = [eq(stockTransactions.product_id, productId)];
      
      if (dateFrom && dateTo) {
        whereConditions.push(between(stockTransactions.created_at, dateFrom, dateTo));
      } else if (dateFrom) {
        whereConditions.push(gte(stockTransactions.created_at, dateFrom));
      } else if (dateTo) {
        whereConditions.push(lte(stockTransactions.created_at, dateTo));
      }

      const result = await this.db
        .select({
          product_id: stockTransactions.product_id,
          product_name: products.name,
          product_sku: products.sku,
          total_in: sql<number>`SUM(CASE WHEN ${stockTransactions.quantity} > 0 THEN ${stockTransactions.quantity} ELSE 0 END)`,
          total_out: sql<number>`SUM(CASE WHEN ${stockTransactions.quantity} < 0 THEN ABS(${stockTransactions.quantity}) ELSE 0 END)`,
          net_change: sql<number>`SUM(${stockTransactions.quantity})`,
          transaction_count: sql<number>`COUNT(*)`,
        })
        .from(stockTransactions)
        .innerJoin(products, eq(stockTransactions.product_id, products.id))
        .where(and(...whereConditions))
        .groupBy(stockTransactions.product_id, products.name, products.sku);

      if (!result.length) {
        // Return empty summary if no transactions found
        const productResult = await this.db
          .select({
            name: products.name,
            sku: products.sku,
          })
          .from(products)
          .where(eq(products.id, productId))
          .limit(1);

        const productInfo = productResult[0];
        return {
          product_id: productId,
          product_name: productInfo?.name || 'Unknown Product',
          product_sku: productInfo?.sku || 'Unknown SKU',
          total_in: 0,
          total_out: 0,
          net_change: 0,
          transaction_count: 0,
        };
      }

      const summary = result[0] as StockTransactionSummary;
      this.logger.log(`Generated transaction summary for product: ${productId}`);
      return summary;
    } catch (error) {
      this.logger.error(`Error getting transaction summary for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async getTransactionSummaryByDateRange(
    dateFrom: Date,
    dateTo: Date
  ): Promise<StockTransactionSummary[]> {
    this.logger.log(`Getting transaction summary for date range: ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);
    
    try {
      const result = await this.db
        .select({
          product_id: stockTransactions.product_id,
          product_name: products.name,
          product_sku: products.sku,
          total_in: sql<number>`SUM(CASE WHEN ${stockTransactions.quantity} > 0 THEN ${stockTransactions.quantity} ELSE 0 END)`,
          total_out: sql<number>`SUM(CASE WHEN ${stockTransactions.quantity} < 0 THEN ABS(${stockTransactions.quantity}) ELSE 0 END)`,
          net_change: sql<number>`SUM(${stockTransactions.quantity})`,
          transaction_count: sql<number>`COUNT(*)`,
        })
        .from(stockTransactions)
        .innerJoin(products, eq(stockTransactions.product_id, products.id))
        .where(between(stockTransactions.created_at, dateFrom, dateTo))
        .groupBy(stockTransactions.product_id, products.name, products.sku)
        .orderBy(asc(products.name));

      this.logger.log(`Generated transaction summary for ${result.length} products in date range`);
      return result as StockTransactionSummary[];
    } catch (error) {
      this.logger.error('Error getting transaction summary by date range', error.stack);
      throw error;
    }
  }

  async countTransactions(filters?: StockTransactionFilters): Promise<number> {
    this.logger.log('Counting stock transactions');
    
    try {
      let whereConditions: any[] = [];

      if (filters?.product_id) {
        whereConditions.push(eq(stockTransactions.product_id, filters.product_id));
      }
      if (filters?.transaction_type) {
        whereConditions.push(eq(stockTransactions.transaction_type, filters.transaction_type));
      }
      if (filters?.reference_id) {
        whereConditions.push(eq(stockTransactions.reference_id, filters.reference_id));
      }
      if (filters?.reference_type) {
        whereConditions.push(eq(stockTransactions.reference_type, filters.reference_type));
      }
      if (filters?.created_by) {
        whereConditions.push(eq(stockTransactions.created_by, filters.created_by));
      }
      if (filters?.date_from && filters?.date_to) {
        whereConditions.push(between(stockTransactions.created_at, filters.date_from, filters.date_to));
      } else if (filters?.date_from) {
        whereConditions.push(gte(stockTransactions.created_at, filters.date_from));
      } else if (filters?.date_to) {
        whereConditions.push(lte(stockTransactions.created_at, filters.date_to));
      }

      const whereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const result = await this.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(stockTransactions)
        .where(whereCondition);

      const count = result[0]?.count || 0;
      this.logger.log(`Counted ${count} stock transactions`);
      return count;
    } catch (error) {
      this.logger.error('Error counting stock transactions', error.stack);
      throw error;
    }
  }

  //#region ==================== UTILITY METHODS ====================

  async getLastTransactionForProduct(productId: string): Promise<StockTransactionEntity | null> {
    this.logger.log(`Getting last transaction for product: ${productId}`);
    
    try {
      const result = await this.db
        .select()
        .from(stockTransactions)
        .where(eq(stockTransactions.product_id, productId))
        .orderBy(desc(stockTransactions.created_at))
        .limit(1);
      
      const found = result.length > 0;
      this.logger.log(`Last transaction ${found ? 'found' : 'not found'} for product: ${productId}`);
      return found ? (result[0] as StockTransactionEntity) : null;
    } catch (error) {
      this.logger.error(`Error getting last transaction for product: ${productId}`, error.stack);
      throw error;
    }
  }

  async deleteTransactionsByReference(
    referenceId: string,
    referenceType?: string
  ): Promise<number> {
    this.logger.log(`Deleting transactions by reference: ${referenceId}`);
    
    try {
      const whereCondition = referenceType
        ? and(
            eq(stockTransactions.reference_id, referenceId),
            eq(stockTransactions.reference_type, referenceType as any)
          )
        : eq(stockTransactions.reference_id, referenceId);

      const result = await this.db
        .delete(stockTransactions)
        .where(whereCondition)
        .returning();

      const deletedCount = result.length;
      this.logger.log(`Deleted ${deletedCount} transactions for reference: ${referenceId}`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Error deleting transactions by reference: ${referenceId}`, error.stack);
      throw error;
    }
  }
}