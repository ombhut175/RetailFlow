import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { purchaseOrders, purchaseOrderStatusEnum } from '../schema/purchase-orders';
import { purchaseOrderItems } from '../schema/purchase-order-items';
import { suppliers } from '../schema/suppliers';
import { products } from '../schema/products';
import { eq, and, isNull, ilike, desc, or, not, gte, lte, sql } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';
import { MESSAGES } from '../../../common/constants/string-const';

export interface CreatePurchaseOrderDto {
  supplier_id: string;
  order_number: string;
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED';
  order_date?: Date;
  expected_delivery_date?: Date;
  total_amount?: number;
  notes?: string;
  created_by: string;
}

export interface UpdatePurchaseOrderDto {
  supplier_id?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED';
  order_date?: Date;
  expected_delivery_date?: Date;
  total_amount?: number;
  notes?: string;
  updated_by: string;
}

export interface CreatePurchaseOrderItemDto {
  purchase_order_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_cost: number;
  total_cost: number;
  created_by: string;
}

export interface UpdatePurchaseOrderItemDto {
  quantity_ordered?: number;
  quantity_received?: number;
  unit_cost?: number;
  total_cost?: number;
  updated_by: string;
}

export interface PurchaseOrderEntity {
  id: string;
  supplier_id: string;
  order_number: string;
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED';
  order_date: string | null;
  expected_delivery_date: string | null;
  total_amount: string | null;
  notes: string | null;
  created_by: string;
  created_at: Date;
  updated_by: string | null;
  updated_at: Date | null;
  deleted_by: string | null;
  deleted_at: Date | null;
}

export interface PurchaseOrderWithDetails extends PurchaseOrderEntity {
  supplier: {
    id: string;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
  };
  items: PurchaseOrderItemWithProduct[];
}

export interface PurchaseOrderItemEntity {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: string;
  total_cost: string;
  created_by: string;
  created_at: Date;
  updated_by: string | null;
  updated_at: Date | null;
  deleted_by: string | null;
  deleted_at: Date | null;
}

export interface PurchaseOrderItemWithProduct extends PurchaseOrderItemEntity {
  product: {
    id: string;
    name: string;
    sku: string;
    unit_price: string;
  };
}

export interface PurchaseOrderFilters {
  supplier_id?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED';
  order_date_from?: Date;
  order_date_to?: Date;
  order_number?: string;
  withDeleted?: boolean;
}

@Injectable()
export class PurchaseOrdersRepository extends BaseRepository<PurchaseOrderEntity> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  //#region ==================== PURCHASE ORDER OPERATIONS ====================

  async createPurchaseOrder(orderData: CreatePurchaseOrderDto): Promise<PurchaseOrderEntity> {
    this.logger.log(`Creating purchase order: ${orderData.order_number}`);
    
    try {
      const result = await this.db
        .insert(purchaseOrders)
        .values({
          supplier_id: orderData.supplier_id,
          order_number: orderData.order_number,
          status: orderData.status as any,
          order_date: orderData.order_date?.toISOString().split('T')[0] || null,
          expected_delivery_date: orderData.expected_delivery_date?.toISOString().split('T')[0] || null,
          total_amount: orderData.total_amount?.toString() || null,
          notes: orderData.notes || null,
          created_by: orderData.created_by,
          created_at: new Date(),
        })
        .returning();

      this.logger.log(`Purchase order created successfully: ${orderData.order_number} (ID: ${result[0].id})`);
      return result[0] as PurchaseOrderEntity;
    } catch (error) {
      this.logger.error(`Failed to create purchase order: ${orderData.order_number}`, error.stack);
      throw error;
    }
  }

  async findPurchaseOrderById(id: string, withDeleted = false): Promise<PurchaseOrderEntity | null> {
    this.logger.log(`Finding purchase order by ID: ${id}`);
    
    const condition = withDeleted 
      ? eq(purchaseOrders.id, id)
      : and(eq(purchaseOrders.id, id), isNull(purchaseOrders.deleted_at));
    
    const result = await this.findOne(purchaseOrders, condition);
    if (result) {
      this.logger.log(`Purchase order found: ${result.order_number} (ID: ${id})`);
    } else {
      this.logger.log(`Purchase order not found with ID: ${id}`);
    }
    return result;
  }

  async findPurchaseOrderByIdOrThrow(id: string, withDeleted = false): Promise<PurchaseOrderEntity> {
    const condition = withDeleted 
      ? eq(purchaseOrders.id, id)
      : and(eq(purchaseOrders.id, id), isNull(purchaseOrders.deleted_at));
    
    return super.findOneOrThrow(purchaseOrders, condition, MESSAGES.PURCHASE_ORDER_NOT_FOUND);
  }

  async findPurchaseOrderByOrderNumber(orderNumber: string, withDeleted = false): Promise<PurchaseOrderEntity | null> {
    this.logger.log(`Finding purchase order by order number: ${orderNumber}`);
    
    const condition = withDeleted 
      ? eq(purchaseOrders.order_number, orderNumber)
      : and(eq(purchaseOrders.order_number, orderNumber), isNull(purchaseOrders.deleted_at));
    
    const result = await this.findOne(purchaseOrders, condition);
    if (result) {
      this.logger.log(`Purchase order found: ${result.order_number}`);
    } else {
      this.logger.log(`Purchase order not found with order number: ${orderNumber}`);
    }
    return result;
  }

  async findPurchaseOrderWithDetails(id: string): Promise<PurchaseOrderWithDetails | null> {
    this.logger.log(`Finding purchase order with details: ${id}`);
    
    try {
      // Get purchase order with supplier info
      const orderResult = await this.db
        .select({
          // Purchase order fields
          id: purchaseOrders.id,
          supplier_id: purchaseOrders.supplier_id,
          order_number: purchaseOrders.order_number,
          status: purchaseOrders.status,
          order_date: purchaseOrders.order_date,
          expected_delivery_date: purchaseOrders.expected_delivery_date,
          total_amount: purchaseOrders.total_amount,
          notes: purchaseOrders.notes,
          created_by: purchaseOrders.created_by,
          created_at: purchaseOrders.created_at,
          updated_by: purchaseOrders.updated_by,
          updated_at: purchaseOrders.updated_at,
          deleted_by: purchaseOrders.deleted_by,
          deleted_at: purchaseOrders.deleted_at,
          // Supplier fields
          supplier_name: suppliers.name,
          supplier_contact_person: suppliers.contact_person,
          supplier_email: suppliers.email,
          supplier_phone: suppliers.phone,
        })
        .from(purchaseOrders)
        .leftJoin(suppliers, eq(purchaseOrders.supplier_id, suppliers.id))
        .where(and(eq(purchaseOrders.id, id), isNull(purchaseOrders.deleted_at)))
        .limit(1);

      if (!orderResult.length) {
        this.logger.log(`Purchase order not found with ID: ${id}`);
        return null;
      }

      const order = orderResult[0];

      // Get purchase order items with product info
      const itemsResult = await this.db
        .select({
          // Purchase order item fields
          id: purchaseOrderItems.id,
          purchase_order_id: purchaseOrderItems.purchase_order_id,
          product_id: purchaseOrderItems.product_id,
          quantity_ordered: purchaseOrderItems.quantity_ordered,
          quantity_received: purchaseOrderItems.quantity_received,
          unit_cost: purchaseOrderItems.unit_cost,
          total_cost: purchaseOrderItems.total_cost,
          created_by: purchaseOrderItems.created_by,
          created_at: purchaseOrderItems.created_at,
          updated_by: purchaseOrderItems.updated_by,
          updated_at: purchaseOrderItems.updated_at,
          deleted_by: purchaseOrderItems.deleted_by,
          deleted_at: purchaseOrderItems.deleted_at,
          // Product fields
          product_name: products.name,
          product_sku: products.sku,
          product_unit_price: products.unit_price,
        })
        .from(purchaseOrderItems)
        .leftJoin(products, eq(purchaseOrderItems.product_id, products.id))
        .where(and(
          eq(purchaseOrderItems.purchase_order_id, id),
          isNull(purchaseOrderItems.deleted_at)
        ))
        .orderBy(purchaseOrderItems.created_at);

      // Transform the result
      const result: PurchaseOrderWithDetails = {
        id: order.id,
        supplier_id: order.supplier_id,
        order_number: order.order_number,
        status: order.status as any,
        order_date: order.order_date,
        expected_delivery_date: order.expected_delivery_date,
        total_amount: order.total_amount,
        notes: order.notes,
        created_by: order.created_by,
        created_at: order.created_at,
        updated_by: order.updated_by,
        updated_at: order.updated_at,
        deleted_by: order.deleted_by,
        deleted_at: order.deleted_at,
        supplier: {
          id: order.supplier_id,
          name: order.supplier_name || '',
          contact_person: order.supplier_contact_person,
          email: order.supplier_email,
          phone: order.supplier_phone,
        },
        items: itemsResult.map(item => ({
          id: item.id,
          purchase_order_id: item.purchase_order_id,
          product_id: item.product_id,
          quantity_ordered: item.quantity_ordered,
          quantity_received: item.quantity_received,
          unit_cost: item.unit_cost || '0',
          total_cost: item.total_cost || '0',
          created_by: item.created_by,
          created_at: item.created_at,
          updated_by: item.updated_by,
          updated_at: item.updated_at,
          deleted_by: item.deleted_by,
          deleted_at: item.deleted_at,
          product: {
            id: item.product_id,
            name: item.product_name || '',
            sku: item.product_sku || '',
            unit_price: item.product_unit_price || '0',
          }
        }))
      };

      this.logger.log(`Purchase order with details found: ${result.order_number} with ${result.items.length} items`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to find purchase order with details: ${id}`, error.stack);
      throw error;
    }
  }

  async updatePurchaseOrder(id: string, updateData: UpdatePurchaseOrderDto): Promise<PurchaseOrderEntity> {
    this.logger.log(`Updating purchase order: ${id}`);
    
    // First verify order exists
    await this.findPurchaseOrderByIdOrThrow(id);
    
    try {
      const updateValues: any = {
        ...updateData,
        updated_at: new Date(),
      };

      // Handle date formatting
      if (updateData.order_date) {
        updateValues.order_date = updateData.order_date.toISOString().split('T')[0];
      }
      if (updateData.expected_delivery_date) {
        updateValues.expected_delivery_date = updateData.expected_delivery_date.toISOString().split('T')[0];
      }
      if (updateData.total_amount !== undefined) {
        updateValues.total_amount = updateData.total_amount.toString();
      }

      const result = await this.db
        .update(purchaseOrders)
        .set(updateValues)
        .where(and(eq(purchaseOrders.id, id), isNull(purchaseOrders.deleted_at)))
        .returning();

      if (!result.length) {
        this.logger.error(`No purchase order updated with ID: ${id}`);
        throw new Error(MESSAGES.PURCHASE_ORDER_NOT_FOUND);
      }

      this.logger.log(`Purchase order updated successfully: ${id}`);
      return result[0] as PurchaseOrderEntity;
    } catch (error) {
      this.logger.error(`Failed to update purchase order: ${id}`, error.stack);
      throw error;
    }
  }

  async deletePurchaseOrder(id: string, deletedBy: string): Promise<boolean> {
    this.logger.log(`Soft deleting purchase order: ${id}`);
    
    // First verify order exists
    await this.findPurchaseOrderByIdOrThrow(id);
    
    try {
      const result = await this.db
        .update(purchaseOrders)
        .set({
          deleted_by: deletedBy,
          deleted_at: new Date(),
          updated_by: deletedBy,
          updated_at: new Date(),
        })
        .where(and(eq(purchaseOrders.id, id), isNull(purchaseOrders.deleted_at)))
        .returning();

      const success = result.length > 0;
      if (success) {
        this.logger.log(`Purchase order soft deleted successfully: ${id}`);
      } else {
        this.logger.error(`Failed to soft delete purchase order: ${id}`);
      }
      return success;
    } catch (error) {
      this.logger.error(`Failed to soft delete purchase order: ${id}`, error.stack);
      throw error;
    }
  }

  //#region ==================== PURCHASE ORDER ITEM OPERATIONS ====================

  async addPurchaseOrderItem(itemData: CreatePurchaseOrderItemDto): Promise<PurchaseOrderItemEntity> {
    this.logger.log(`Adding item to purchase order: ${itemData.purchase_order_id}`);
    
    try {
      const result = await this.db
        .insert(purchaseOrderItems)
        .values({
          purchase_order_id: itemData.purchase_order_id,
          product_id: itemData.product_id,
          quantity_ordered: itemData.quantity_ordered,
          quantity_received: itemData.quantity_received || 0,
          unit_cost: itemData.unit_cost.toString(),
          total_cost: itemData.total_cost.toString(),
          created_by: itemData.created_by,
          created_at: new Date(),
        })
        .returning();

      this.logger.log(`Purchase order item added successfully: ${result[0].id}`);
      return result[0] as PurchaseOrderItemEntity;
    } catch (error) {
      this.logger.error(`Failed to add purchase order item`, error.stack);
      throw error;
    }
  }

  async updatePurchaseOrderItem(itemId: string, updateData: UpdatePurchaseOrderItemDto): Promise<PurchaseOrderItemEntity> {
    this.logger.log(`Updating purchase order item: ${itemId}`);
    
    try {
      const updateValues: any = {
        ...updateData,
        updated_at: new Date(),
      };

      // Handle numeric fields
      if (updateData.unit_cost !== undefined) {
        updateValues.unit_cost = updateData.unit_cost.toString();
      }
      if (updateData.total_cost !== undefined) {
        updateValues.total_cost = updateData.total_cost.toString();
      }

      const result = await this.db
        .update(purchaseOrderItems)
        .set(updateValues)
        .where(and(eq(purchaseOrderItems.id, itemId), isNull(purchaseOrderItems.deleted_at)))
        .returning();

      if (!result.length) {
        this.logger.error(`No purchase order item updated with ID: ${itemId}`);
        throw new Error(MESSAGES.PURCHASE_ORDER_ITEM_NOT_FOUND);
      }

      this.logger.log(`Purchase order item updated successfully: ${itemId}`);
      return result[0] as PurchaseOrderItemEntity;
    } catch (error) {
      this.logger.error(`Failed to update purchase order item: ${itemId}`, error.stack);
      throw error;
    }
  }

  async deletePurchaseOrderItem(itemId: string, deletedBy: string): Promise<boolean> {
    this.logger.log(`Soft deleting purchase order item: ${itemId}`);
    
    try {
      const result = await this.db
        .update(purchaseOrderItems)
        .set({
          deleted_by: deletedBy,
          deleted_at: new Date(),
          updated_by: deletedBy,
          updated_at: new Date(),
        })
        .where(and(eq(purchaseOrderItems.id, itemId), isNull(purchaseOrderItems.deleted_at)))
        .returning();

      const success = result.length > 0;
      if (success) {
        this.logger.log(`Purchase order item soft deleted successfully: ${itemId}`);
      } else {
        this.logger.error(`Failed to soft delete purchase order item: ${itemId}`);
      }
      return success;
    } catch (error) {
      this.logger.error(`Failed to soft delete purchase order item: ${itemId}`, error.stack);
      throw error;
    }
  }

  //#region ==================== QUERY OPERATIONS ====================

  async findAllPurchaseOrders(filters: PurchaseOrderFilters = {}, page = 1, limit = 10): Promise<{
    data: PurchaseOrderWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    this.logger.log(`Finding all purchase orders with filters:`, filters);
    
    // Build where conditions
    const conditions: any[] = [];
    
    if (!filters.withDeleted) {
      conditions.push(isNull(purchaseOrders.deleted_at));
    }
    
    if (filters.supplier_id) {
      conditions.push(eq(purchaseOrders.supplier_id, filters.supplier_id));
    }
    
    if (filters.status) {
      conditions.push(eq(purchaseOrders.status, filters.status as any));
    }
    
    if (filters.order_number) {
      conditions.push(ilike(purchaseOrders.order_number, `%${filters.order_number}%`));
    }
    
    if (filters.order_date_from) {
      conditions.push(gte(purchaseOrders.order_date, filters.order_date_from.toISOString().split('T')[0]));
    }
    
    if (filters.order_date_to) {
      conditions.push(lte(purchaseOrders.order_date, filters.order_date_to.toISOString().split('T')[0]));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const total = await this.count(purchaseOrders, whereClause);
    
    // Get paginated results with supplier info
    const offset = (page - 1) * limit;
    const ordersData = await this.db
      .select({
        // Purchase order fields
        id: purchaseOrders.id,
        supplier_id: purchaseOrders.supplier_id,
        order_number: purchaseOrders.order_number,
        status: purchaseOrders.status,
        order_date: purchaseOrders.order_date,
        expected_delivery_date: purchaseOrders.expected_delivery_date,
        total_amount: purchaseOrders.total_amount,
        notes: purchaseOrders.notes,
        created_by: purchaseOrders.created_by,
        created_at: purchaseOrders.created_at,
        updated_by: purchaseOrders.updated_by,
        updated_at: purchaseOrders.updated_at,
        deleted_by: purchaseOrders.deleted_by,
        deleted_at: purchaseOrders.deleted_at,
        // Supplier fields
        supplier_name: suppliers.name,
        supplier_contact_person: suppliers.contact_person,
        supplier_email: suppliers.email,
        supplier_phone: suppliers.phone,
      })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplier_id, suppliers.id))
      .where(whereClause)
      .orderBy(desc(purchaseOrders.created_at))
      .limit(limit)
      .offset(offset);

    // Get items for each order (simplified for list view)
    const data: PurchaseOrderWithDetails[] = [];
    
    for (const order of ordersData) {
      const itemsCount = await this.count(purchaseOrderItems, and(
        eq(purchaseOrderItems.purchase_order_id, order.id),
        isNull(purchaseOrderItems.deleted_at)
      ));

      data.push({
        id: order.id,
        supplier_id: order.supplier_id,
        order_number: order.order_number,
        status: order.status as any,
        order_date: order.order_date,
        expected_delivery_date: order.expected_delivery_date,
        total_amount: order.total_amount,
        notes: order.notes,
        created_by: order.created_by,
        created_at: order.created_at,
        updated_by: order.updated_by,
        updated_at: order.updated_at,
        deleted_by: order.deleted_by,
        deleted_at: order.deleted_at,
        supplier: {
          id: order.supplier_id,
          name: order.supplier_name || '',
          contact_person: order.supplier_contact_person,
          email: order.supplier_email,
          phone: order.supplier_phone,
        },
        items: [] // Empty for list view, use findPurchaseOrderWithDetails for full details
      });
    }

    const totalPages = Math.ceil(total / limit);

    this.logger.log(`Found ${data.length} purchase orders out of ${total} total`);
    
    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  async getPurchaseOrderStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    received: number;
    cancelled: number;
  }> {
    this.logger.log('Getting purchase order statistics');
    
    const total = await this.count(purchaseOrders, isNull(purchaseOrders.deleted_at));
    const pending = await this.count(purchaseOrders, and(
      eq(purchaseOrders.status, 'PENDING'),
      isNull(purchaseOrders.deleted_at)
    ));
    const confirmed = await this.count(purchaseOrders, and(
      eq(purchaseOrders.status, 'CONFIRMED'),
      isNull(purchaseOrders.deleted_at)
    ));
    const received = await this.count(purchaseOrders, and(
      eq(purchaseOrders.status, 'RECEIVED'),
      isNull(purchaseOrders.deleted_at)
    ));
    const cancelled = await this.count(purchaseOrders, and(
      eq(purchaseOrders.status, 'CANCELLED'),
      isNull(purchaseOrders.deleted_at)
    ));

    const stats = {
      total,
      pending,
      confirmed,
      received,
      cancelled,
    };

    this.logger.log('Purchase order statistics:', stats);
    return stats;
  }

  async findPurchaseOrdersBySupplier(supplierId: string, limit = 10): Promise<PurchaseOrderEntity[]> {
    this.logger.log(`Finding purchase orders for supplier: ${supplierId}`);
    
    const result = await this.db
      .select()
      .from(purchaseOrders)
      .where(and(
        eq(purchaseOrders.supplier_id, supplierId),
        isNull(purchaseOrders.deleted_at)
      ))
      .orderBy(desc(purchaseOrders.created_at))
      .limit(limit);

    this.logger.log(`Found ${result.length} purchase orders for supplier: ${supplierId}`);
    return result as PurchaseOrderEntity[];
  }
}