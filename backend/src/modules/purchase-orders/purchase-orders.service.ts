import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { 
  PurchaseOrdersRepository, 
  PurchaseOrderEntity, 
  PurchaseOrderWithDetails, 
  PurchaseOrderItemEntity 
} from '../../core/database/repositories/purchase-orders.repository';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderFiltersDto, CreatePurchaseOrderItemDto, UpdatePurchaseOrderItemDto } from './dto';
import { MESSAGES, API_MESSAGES } from '../../common/constants/string-const';

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name);

  constructor(
    private readonly purchaseOrdersRepository: PurchaseOrdersRepository,
    private readonly suppliersService: SuppliersService,
  ) {}

  //#region ==================== PURCHASE ORDER OPERATIONS ====================

  async createPurchaseOrder(createPurchaseOrderDto: CreatePurchaseOrderDto, userId: string): Promise<PurchaseOrderWithDetails> {
    this.logger.log(`Creating purchase order: ${createPurchaseOrderDto.order_number} by user: ${userId}`);

    // Validate supplier exists and is active
    await this.suppliersService.validateSupplierActive(createPurchaseOrderDto.supplier_id);

    // Check if order number already exists
    const existingOrder = await this.purchaseOrdersRepository.findPurchaseOrderByOrderNumber(createPurchaseOrderDto.order_number);
    if (existingOrder) {
      this.logger.warn(`Purchase order number already exists: ${createPurchaseOrderDto.order_number}`);
      throw new ConflictException(MESSAGES.PURCHASE_ORDER_NUMBER_EXISTS);
    }

    // Calculate total amount if not provided
    let totalAmount = createPurchaseOrderDto.total_amount;
    if (createPurchaseOrderDto.items && createPurchaseOrderDto.items.length > 0) {
      totalAmount = createPurchaseOrderDto.items.reduce((sum, item) => sum + item.total_cost, 0);
    }

    try {
      // Create the purchase order
      const purchaseOrder = await this.purchaseOrdersRepository.createPurchaseOrder({
        supplier_id: createPurchaseOrderDto.supplier_id,
        order_number: createPurchaseOrderDto.order_number,
        status: createPurchaseOrderDto.status,
        order_date: createPurchaseOrderDto.order_date ? new Date(createPurchaseOrderDto.order_date) : new Date(),
        expected_delivery_date: createPurchaseOrderDto.expected_delivery_date ? new Date(createPurchaseOrderDto.expected_delivery_date) : undefined,
        total_amount: totalAmount,
        notes: createPurchaseOrderDto.notes,
        created_by: userId,
      });

      // Add items if provided
      if (createPurchaseOrderDto.items && createPurchaseOrderDto.items.length > 0) {
        for (const itemDto of createPurchaseOrderDto.items) {
          await this.purchaseOrdersRepository.addPurchaseOrderItem({
            purchase_order_id: purchaseOrder.id,
            product_id: itemDto.product_id,
            quantity_ordered: itemDto.quantity_ordered,
            quantity_received: itemDto.quantity_received || 0,
            unit_cost: itemDto.unit_cost,
            total_cost: itemDto.total_cost,
            created_by: userId,
          });
        }
      }

      // Return the complete purchase order with details
      const orderWithDetails = await this.purchaseOrdersRepository.findPurchaseOrderWithDetails(purchaseOrder.id);
      if (!orderWithDetails) {
        throw new Error('Failed to retrieve created purchase order');
      }

      this.logger.log(`Purchase order created successfully: ${purchaseOrder.order_number} (ID: ${purchaseOrder.id})`);
      return orderWithDetails;
    } catch (error) {
      this.logger.error(`Failed to create purchase order: ${createPurchaseOrderDto.order_number}`, error.stack);
      throw error;
    }
  }

  async findAllPurchaseOrders(
    filters: PurchaseOrderFiltersDto = {},
    page = 1,
    limit = 10,
  ): Promise<{
    data: PurchaseOrderWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    this.logger.log(`Finding purchase orders with filters:`, filters);

    try {
      // Convert date strings to Date objects
      const processedFilters = {
        ...filters,
        order_date_from: filters.order_date_from ? new Date(filters.order_date_from) : undefined,
        order_date_to: filters.order_date_to ? new Date(filters.order_date_to) : undefined,
      };

      const result = await this.purchaseOrdersRepository.findAllPurchaseOrders(processedFilters, page, limit);
      
      this.logger.log(`Found ${result.data.length} purchase orders out of ${result.total} total`);
      return result;
    } catch (error) {
      this.logger.error('Failed to find purchase orders', error.stack);
      throw error;
    }
  }

  async findPurchaseOrderById(id: string): Promise<PurchaseOrderWithDetails> {
    this.logger.log(`Finding purchase order by ID: ${id}`);

    const purchaseOrder = await this.purchaseOrdersRepository.findPurchaseOrderWithDetails(id);
    if (!purchaseOrder) {
      this.logger.warn(`Purchase order not found with ID: ${id}`);
      throw new NotFoundException(MESSAGES.PURCHASE_ORDER_NOT_FOUND);
    }

    this.logger.log(`Purchase order found: ${purchaseOrder.order_number} (ID: ${id})`);
    return purchaseOrder;
  }

  async updatePurchaseOrder(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto, userId: string): Promise<PurchaseOrderEntity> {
    this.logger.log(`Updating purchase order: ${id} by user: ${userId}`);

    // First verify the purchase order exists
    await this.purchaseOrdersRepository.findPurchaseOrderByIdOrThrow(id);

    // Validate supplier if being changed
    if (updatePurchaseOrderDto.supplier_id) {
      await this.suppliersService.validateSupplierActive(updatePurchaseOrderDto.supplier_id);
    }

    // Check if new order number conflicts with another purchase order
    if (updatePurchaseOrderDto.order_number) {
      const existingOrder = await this.purchaseOrdersRepository.findPurchaseOrderByOrderNumber(updatePurchaseOrderDto.order_number);
      if (existingOrder && existingOrder.id !== id) {
        this.logger.warn(`Purchase order number already exists: ${updatePurchaseOrderDto.order_number}`);
        throw new ConflictException(MESSAGES.PURCHASE_ORDER_NUMBER_EXISTS);
      }
    }

    try {
      const updatedPurchaseOrder = await this.purchaseOrdersRepository.updatePurchaseOrder(id, {
        ...updatePurchaseOrderDto,
        order_date: updatePurchaseOrderDto.order_date ? new Date(updatePurchaseOrderDto.order_date) : undefined,
        expected_delivery_date: updatePurchaseOrderDto.expected_delivery_date ? new Date(updatePurchaseOrderDto.expected_delivery_date) : undefined,
        updated_by: userId,
      });

      this.logger.log(`Purchase order updated successfully: ${updatedPurchaseOrder.order_number} (ID: ${id})`);
      return updatedPurchaseOrder;
    } catch (error) {
      this.logger.error(`Failed to update purchase order: ${id}`, error.stack);
      throw error;
    }
  }

  async deletePurchaseOrder(id: string, userId: string): Promise<{ message: string }> {
    this.logger.log(`Soft deleting purchase order: ${id} by user: ${userId}`);

    // First verify the purchase order exists
    await this.purchaseOrdersRepository.findPurchaseOrderByIdOrThrow(id);

    try {
      const success = await this.purchaseOrdersRepository.deletePurchaseOrder(id, userId);
      if (!success) {
        this.logger.error(`Failed to delete purchase order: ${id}`);
        throw new Error('Failed to delete purchase order');
      }

      this.logger.log(`Purchase order soft deleted successfully: ${id}`);
      return { message: API_MESSAGES.PURCHASE_ORDER_DELETED };
    } catch (error) {
      this.logger.error(`Failed to delete purchase order: ${id}`, error.stack);
      throw error;
    }
  }

  //#region ==================== PURCHASE ORDER ITEM OPERATIONS ====================

  async addPurchaseOrderItem(orderId: string, itemDto: CreatePurchaseOrderItemDto, userId: string): Promise<PurchaseOrderItemEntity> {
    this.logger.log(`Adding item to purchase order: ${orderId} by user: ${userId}`);

    // Verify the purchase order exists
    const existingOrder = await this.purchaseOrdersRepository.findPurchaseOrderByIdOrThrow(orderId);

    // Prevent adding items to completed orders
    if (existingOrder.status === 'RECEIVED' || existingOrder.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot add items to ${existingOrder.status.toLowerCase()} purchase order`);
    }

    try {
      const item = await this.purchaseOrdersRepository.addPurchaseOrderItem({
        purchase_order_id: orderId,
        product_id: itemDto.product_id,
        quantity_ordered: itemDto.quantity_ordered,
        quantity_received: itemDto.quantity_received || 0,
        unit_cost: itemDto.unit_cost,
        total_cost: itemDto.total_cost,
        created_by: userId,
      });

      this.logger.log(`Purchase order item added successfully: ${item.id}`);
      return item;
    } catch (error) {
      this.logger.error(`Failed to add purchase order item to order: ${orderId}`, error.stack);
      throw error;
    }
  }

  async updatePurchaseOrderItem(itemId: string, itemDto: UpdatePurchaseOrderItemDto, userId: string): Promise<PurchaseOrderItemEntity> {
    this.logger.log(`Updating purchase order item: ${itemId} by user: ${userId}`);

    try {
      const updatedItem = await this.purchaseOrdersRepository.updatePurchaseOrderItem(itemId, {
        ...itemDto,
        updated_by: userId,
      });

      this.logger.log(`Purchase order item updated successfully: ${itemId}`);
      return updatedItem;
    } catch (error) {
      this.logger.error(`Failed to update purchase order item: ${itemId}`, error.stack);
      throw error;
    }
  }

  async deletePurchaseOrderItem(itemId: string, userId: string): Promise<{ message: string }> {
    this.logger.log(`Deleting purchase order item: ${itemId} by user: ${userId}`);

    try {
      const success = await this.purchaseOrdersRepository.deletePurchaseOrderItem(itemId, userId);
      if (!success) {
        this.logger.error(`Failed to delete purchase order item: ${itemId}`);
        throw new NotFoundException(MESSAGES.PURCHASE_ORDER_ITEM_NOT_FOUND);
      }

      this.logger.log(`Purchase order item deleted successfully: ${itemId}`);
      return { message: API_MESSAGES.PURCHASE_ORDER_ITEM_DELETED };
    } catch (error) {
      this.logger.error(`Failed to delete purchase order item: ${itemId}`, error.stack);
      throw error;
    }
  }

  //#region ==================== UTILITY OPERATIONS ====================

  async getPurchaseOrderStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    received: number;
    cancelled: number;
  }> {
    this.logger.log('Getting purchase order statistics');

    try {
      const stats = await this.purchaseOrdersRepository.getPurchaseOrderStats();
      this.logger.log('Purchase order statistics retrieved successfully');
      return stats;
    } catch (error) {
      this.logger.error('Failed to get purchase order statistics', error.stack);
      throw error;
    }
  }

  async findPurchaseOrdersBySupplier(supplierId: string, limit = 10): Promise<PurchaseOrderEntity[]> {
    this.logger.log(`Finding purchase orders for supplier: ${supplierId}`);

    // Validate supplier exists
    await this.suppliersService.validateSupplierExists(supplierId);

    try {
      const orders = await this.purchaseOrdersRepository.findPurchaseOrdersBySupplier(supplierId, limit);
      this.logger.log(`Found ${orders.length} purchase orders for supplier: ${supplierId}`);
      return orders;
    } catch (error) {
      this.logger.error(`Failed to find purchase orders for supplier: ${supplierId}`, error.stack);
      throw error;
    }
  }

  async receivePurchaseOrder(id: string, userId: string): Promise<PurchaseOrderEntity> {
    this.logger.log(`Receiving purchase order: ${id} by user: ${userId}`);

    // Get the purchase order with details
    const orderWithDetails = await this.findPurchaseOrderById(id);

    // Validate order can be received
    if (orderWithDetails.status !== 'CONFIRMED') {
      throw new BadRequestException('Only confirmed purchase orders can be received');
    }

    try {
      // Update order status to RECEIVED
      const updatedOrder = await this.updatePurchaseOrder(id, { status: 'RECEIVED' as any }, userId);

      // TODO: Update stock levels when stock management is implemented
      // For each item in the order, add to stock

      this.logger.log(`Purchase order received successfully: ${updatedOrder.order_number}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to receive purchase order: ${id}`, error.stack);
      throw error;
    }
  }

  //#region ==================== VALIDATION HELPERS ====================

  async validatePurchaseOrderExists(orderId: string): Promise<PurchaseOrderEntity> {
    this.logger.log(`Validating purchase order exists: ${orderId}`);
    const order = await this.purchaseOrdersRepository.findPurchaseOrderById(orderId);
    if (!order) {
      throw new NotFoundException(MESSAGES.PURCHASE_ORDER_NOT_FOUND);
    }
    return order;
  }
}
