import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  ParseIntPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { 
  CreatePurchaseOrderDto, 
  UpdatePurchaseOrderDto, 
  PurchaseOrderResponseDto, 
  PurchaseOrderListResponseDto,
  PurchaseOrderFiltersDto,
  CreatePurchaseOrderItemDto,
  UpdatePurchaseOrderItemDto
} from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ManagerGuard } from '../../common/guards/manager.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse, createdResponse } from '../../common/helpers/api-response.helper';
import { API_MESSAGES } from '../../common/constants/string-const';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
@UseGuards(AuthGuard) // All endpoints require authentication
@ApiBearerAuth()
export class PurchaseOrdersController {
  private readonly logger = new Logger(PurchaseOrdersController.name);

  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  //#region ==================== CREATE OPERATIONS ====================

  @ApiOperation({
    summary: 'Create a new purchase order',
    description: 'Create a new purchase order with items. Requires MANAGER or ADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Purchase order created successfully',
    type: PurchaseOrderResponseDto,
  })
  @ApiConflictResponse({
    description: 'Purchase order number already exists',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ManagerGuard) // Requires MANAGER or ADMIN role
  async createPurchaseOrder(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Creating purchase order: ${createPurchaseOrderDto.order_number} by user: ${userId}`);
    
    const purchaseOrder = await this.purchaseOrdersService.createPurchaseOrder(createPurchaseOrderDto, userId);
    
    this.logger.log(`Purchase order created successfully: ${purchaseOrder.id}`);
    return createdResponse(purchaseOrder, API_MESSAGES.PURCHASE_ORDER_CREATED);
  }

  //#region ==================== READ OPERATIONS ====================

  @ApiOperation({
    summary: 'Get all purchase orders',
    description: 'Retrieve a paginated list of purchase orders with optional filtering. Requires STAFF role or above.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starting from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (1-100)', example: 10 })
  @ApiQuery({ name: 'supplier_id', required: false, type: String, description: 'Filter by supplier ID' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'order_number', required: false, type: String, description: 'Filter by order number (partial match)' })
  @ApiQuery({ name: 'order_date_from', required: false, type: String, description: 'Filter by order date from (YYYY-MM-DD)' })
  @ApiQuery({ name: 'order_date_to', required: false, type: String, description: 'Filter by order date to (YYYY-MM-DD)' })
  @ApiQuery({ name: 'withDeleted', required: false, type: Boolean, description: 'Include soft deleted orders (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Purchase orders retrieved successfully',
    type: PurchaseOrderListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Staff role required' })
  @Get()
  @UseGuards(StaffGuard) // Requires STAFF, MANAGER, or ADMIN role
  async findAllPurchaseOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query() filters: PurchaseOrderFiltersDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Finding purchase orders - page: ${page}, limit: ${limit}`);

    // Validate pagination
    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    // Only admins can see deleted orders
    if (filters.withDeleted && user.role !== 'ADMIN') {
      filters.withDeleted = false;
    }

    const result = await this.purchaseOrdersService.findAllPurchaseOrders(filters, page, limit);
    
    this.logger.log(`Found ${result.data.length} purchase orders`);
    return successResponse({
      ...result,
      limit,
    }, API_MESSAGES.PURCHASE_ORDERS_FETCHED);
  }

  @ApiOperation({
    summary: 'Get purchase order by ID',
    description: 'Retrieve a specific purchase order with all details by ID. Requires STAFF role or above.',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase order UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase order retrieved successfully',
    type: PurchaseOrderResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Purchase order not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Staff role required' })
  @Get(':id')
  @UseGuards(StaffGuard)
  async findPurchaseOrderById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Finding purchase order by ID: ${id}`);
    
    const purchaseOrder = await this.purchaseOrdersService.findPurchaseOrderById(id);
    
    this.logger.log(`Purchase order found: ${purchaseOrder.order_number}`);
    return successResponse(purchaseOrder, 'Purchase order retrieved successfully');
  }

  @ApiOperation({
    summary: 'Get purchase orders by supplier',
    description: 'Retrieve purchase orders for a specific supplier. Requires STAFF role or above.',
  })
  @ApiParam({
    name: 'supplierId',
    description: 'Supplier UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of results (1-50)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase orders retrieved successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Staff role required' })
  @Get('supplier/:supplierId')
  @UseGuards(StaffGuard)
  async findPurchaseOrdersBySupplier(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    this.logger.log(`Finding purchase orders for supplier: ${supplierId}`);

    // Validate limit
    if (limit < 1) limit = 1;
    if (limit > 50) limit = 50;

    const orders = await this.purchaseOrdersService.findPurchaseOrdersBySupplier(supplierId, limit);
    
    this.logger.log(`Found ${orders.length} purchase orders for supplier: ${supplierId}`);
    return successResponse(orders, 'Purchase orders retrieved successfully');
  }

  //#region ==================== UPDATE OPERATIONS ====================

  @ApiOperation({
    summary: 'Update a purchase order',
    description: 'Update purchase order information by ID. Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase order UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase order updated successfully',
    type: PurchaseOrderResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Purchase order not found' })
  @ApiConflictResponse({ description: 'Purchase order number already exists' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Patch(':id')
  @UseGuards(ManagerGuard)
  async updatePurchaseOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Updating purchase order: ${id} by user: ${userId}`);
    
    const purchaseOrder = await this.purchaseOrdersService.updatePurchaseOrder(id, updatePurchaseOrderDto, userId);
    
    this.logger.log(`Purchase order updated successfully: ${purchaseOrder.id}`);
    return successResponse(purchaseOrder, API_MESSAGES.PURCHASE_ORDER_UPDATED);
  }

  @ApiOperation({
    summary: 'Receive a purchase order',
    description: 'Mark a purchase order as received and update stock levels. Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase order UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase order received successfully',
  })
  @ApiNotFoundResponse({ description: 'Purchase order not found' })
  @ApiBadRequestResponse({ description: 'Purchase order cannot be received' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Post(':id/receive')
  @UseGuards(ManagerGuard)
  async receivePurchaseOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Receiving purchase order: ${id} by user: ${userId}`);
    
    const purchaseOrder = await this.purchaseOrdersService.receivePurchaseOrder(id, userId);
    
    this.logger.log(`Purchase order received successfully: ${purchaseOrder.id}`);
    return successResponse(purchaseOrder, 'Purchase order received successfully');
  }

  //#region ==================== DELETE OPERATIONS ====================

  @ApiOperation({
    summary: 'Delete a purchase order',
    description: 'Soft delete a purchase order by ID. Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase order UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase order deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Purchase order not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Delete(':id')
  @UseGuards(ManagerGuard)
  async deletePurchaseOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Deleting purchase order: ${id} by user: ${userId}`);
    
    const result = await this.purchaseOrdersService.deletePurchaseOrder(id, userId);
    
    this.logger.log(`Purchase order deleted successfully: ${id}`);
    return successResponse(result, result.message);
  }

  //#region ==================== PURCHASE ORDER ITEM OPERATIONS ====================

  @ApiOperation({
    summary: 'Add item to purchase order',
    description: 'Add a new item to an existing purchase order. Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase order UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Purchase order item added successfully',
  })
  @ApiNotFoundResponse({ description: 'Purchase order not found' })
  @ApiBadRequestResponse({ description: 'Cannot add items to completed orders' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ManagerGuard)
  async addPurchaseOrderItem(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Body() createItemDto: CreatePurchaseOrderItemDto,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Adding item to purchase order: ${orderId} by user: ${userId}`);
    
    const item = await this.purchaseOrdersService.addPurchaseOrderItem(orderId, createItemDto, userId);
    
    this.logger.log(`Purchase order item added successfully: ${item.id}`);
    return createdResponse(item, API_MESSAGES.PURCHASE_ORDER_ITEM_ADDED);
  }

  @ApiOperation({
    summary: 'Update purchase order item',
    description: 'Update an existing purchase order item. Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'itemId',
    description: 'Purchase order item UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase order item updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Purchase order item not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Patch('items/:itemId')
  @UseGuards(ManagerGuard)
  async updatePurchaseOrderItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateItemDto: UpdatePurchaseOrderItemDto,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Updating purchase order item: ${itemId} by user: ${userId}`);
    
    const item = await this.purchaseOrdersService.updatePurchaseOrderItem(itemId, updateItemDto, userId);
    
    this.logger.log(`Purchase order item updated successfully: ${item.id}`);
    return successResponse(item, API_MESSAGES.PURCHASE_ORDER_ITEM_UPDATED);
  }

  @ApiOperation({
    summary: 'Delete purchase order item',
    description: 'Soft delete a purchase order item. Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'itemId',
    description: 'Purchase order item UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase order item deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Purchase order item not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Delete('items/:itemId')
  @UseGuards(ManagerGuard)
  async deletePurchaseOrderItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Deleting purchase order item: ${itemId} by user: ${userId}`);
    
    const result = await this.purchaseOrdersService.deletePurchaseOrderItem(itemId, userId);
    
    this.logger.log(`Purchase order item deleted successfully: ${itemId}`);
    return successResponse(result, result.message);
  }

  //#region ==================== STATISTICS ====================

  @ApiOperation({
    summary: 'Get purchase order statistics',
    description: 'Retrieve purchase order statistics including counts by status. Requires MANAGER role or above.',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase order statistics retrieved successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Get('stats/overview')
  @UseGuards(ManagerGuard)
  async getPurchaseOrderStats() {
    this.logger.log('Getting purchase order statistics');
    
    const stats = await this.purchaseOrdersService.getPurchaseOrderStats();
    
    this.logger.log('Purchase order statistics retrieved successfully');
    return successResponse(stats, 'Purchase order statistics retrieved successfully');
  }
}
