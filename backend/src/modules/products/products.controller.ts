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
  ParseFloatPipe,
  ParseBoolPipe,
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
import { ProductsService } from './products.service';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ProductResponseDto, 
  ProductListResponseDto,
  ProductFiltersDto 
} from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { ManagerGuard } from '../../common/guards/manager.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse, createdResponse } from '../../common/helpers/api-response.helper';
import { API_MESSAGES } from '../../common/constants/string-const';

@ApiTags('Products')
@Controller('products')
@UseGuards(AuthGuard) // All endpoints require authentication
@ApiBearerAuth()
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  //#region ==================== CREATE OPERATIONS ====================

  @ApiOperation({
    summary: 'Create a new product',
    description: 'Create a new product with SKU, pricing, and category information. Requires MANAGER or ADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Product created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'iPhone 15 Pro',
          sku: 'IPH15P-128-BLK',
          barcode: '1234567890123',
          category_id: '123e4567-e89b-12d3-a456-426614174000',
          category: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Electronics',
            description: 'Electronic devices and accessories',
          },
          description: 'Latest iPhone with advanced camera system',
          unit_price: '999.99',
          cost_price: '750.00',
          minimum_stock_level: 10,
          is_active: true,
          created_by: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_by: null,
          updated_at: null,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, validation errors, or category not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - MANAGER or ADMIN role required',
  })
  @ApiConflictResponse({
    description: 'Product SKU or barcode already exists',
  })
  @Post()
  @UseGuards(ManagerGuard) // MANAGER+ access
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Creating product: ${createProductDto.name} (SKU: ${createProductDto.sku}) by user: ${userId}`);
    
    const product = await this.productsService.create(createProductDto, userId);
    
    this.logger.log(`Product created successfully: ${product.id}`);
    
    return createdResponse(product, API_MESSAGES.PRODUCT_CREATED);
  }

  //#endregion

  //#region ==================== READ OPERATIONS ====================

  @ApiOperation({
    summary: 'Get all products with advanced filtering and pagination',
    description: 'Retrieve products with comprehensive filtering, search, sorting, and pagination options. Accessible to all authenticated users.',
  })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by product name (partial match)', example: 'iPhone' })
  @ApiQuery({ name: 'sku', required: false, description: 'Filter by SKU (partial match)', example: 'IPH15' })
  @ApiQuery({ name: 'barcode', required: false, description: 'Filter by barcode (exact match)', example: '1234567890123' })
  @ApiQuery({ name: 'category_id', required: false, description: 'Filter by category ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiQuery({ name: 'is_active', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'min_price', required: false, description: 'Minimum price filter', example: 100.00 })
  @ApiQuery({ name: 'max_price', required: false, description: 'Maximum price filter', example: 1000.00 })
  @ApiQuery({ name: 'withDeleted', required: false, description: 'Include soft-deleted products (ADMIN only)', example: false })
  @ApiQuery({ name: 'withCategory', required: false, description: 'Include category information', example: true })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (1-100)', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field', enum: ['name', 'sku', 'unit_price', 'created_at'], example: 'name' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order', enum: ['asc', 'desc'], example: 'asc' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: ProductListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @Get()
  @UseGuards(StaffGuard) // All authenticated users
  async findAll(
    @Query('name') name?: string,
    @Query('sku') sku?: string,
    @Query('barcode') barcode?: string,
    @Query('category_id') category_id?: string,
    @Query('is_active', new DefaultValuePipe(undefined)) is_active?: boolean,
    @Query('min_price', new DefaultValuePipe(undefined)) min_price?: number,
    @Query('max_price', new DefaultValuePipe(undefined)) max_price?: number,
    @Query('withDeleted', new DefaultValuePipe(false), ParseBoolPipe) withDeleted?: boolean,
    @Query('withCategory', new DefaultValuePipe(true), ParseBoolPipe) withCategory?: boolean,
    @Query('page', new DefaultValuePipe(undefined)) page?: number,
    @Query('limit', new DefaultValuePipe(undefined)) limit?: number,
    @Query('sortBy', new DefaultValuePipe('name')) sortBy?: 'name' | 'sku' | 'unit_price' | 'created_at',
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    this.logger.log('Fetching products with filters', {
      name, sku, barcode, category_id, is_active, min_price, max_price,
      withDeleted, withCategory, page, limit, sortBy, sortOrder
    });
    
    const filters: ProductFiltersDto = {
      ...(name && { name }),
      ...(sku && { sku }),
      ...(barcode && { barcode }),
      ...(category_id && { category_id }),
      ...(is_active !== undefined && { is_active }),
      ...(min_price !== undefined && { min_price }),
      ...(max_price !== undefined && { max_price }),
      withDeleted,
      withCategory,
      ...(page && { page }),
      ...(limit && { limit }),
      sortBy,
      sortOrder,
    };
    
    const result = await this.productsService.findAll(filters);
    
    // Handle both paginated and non-paginated results
    if (Array.isArray(result)) {
      this.logger.log(`Retrieved ${result.length} products`);
      return successResponse(result, API_MESSAGES.PRODUCTS_FETCHED);
    } else {
      this.logger.log(`Retrieved ${result.data.length} products (page ${result.page}/${result.totalPages})`);
      return successResponse(result, API_MESSAGES.PRODUCTS_FETCHED);
    }
  }

  @ApiOperation({
    summary: 'Get active products only',
    description: 'Retrieve only active products. Accessible to all authenticated users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active products retrieved successfully',
    type: [ProductResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @Get('active')
  @UseGuards(StaffGuard) // All authenticated users
  async getActiveProducts() {
    this.logger.log('Fetching active products');
    
    const products = await this.productsService.getActiveProducts();
    
    this.logger.log(`Retrieved ${products.length} active products`);
    
    return successResponse(products, 'Active products retrieved successfully');
  }

  @ApiOperation({
    summary: 'Search products',
    description: 'Search products by name, SKU, or description. Accessible to all authenticated users.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search term for product name, SKU, or description',
    example: 'iPhone',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results to return',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Products search completed successfully',
    type: [ProductResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @Get('search')
  @UseGuards(StaffGuard) // All authenticated users
  async searchProducts(
    @Query('q') searchTerm: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    this.logger.log(`Searching products with term: ${searchTerm}`);
    
    const products = await this.productsService.searchProducts(searchTerm, limit);
    
    this.logger.log(`Found ${products.length} products matching search term`);
    
    return successResponse(products, 'Products search completed successfully');
  }

  @ApiOperation({
    summary: 'Get products by category',
    description: 'Retrieve all products belonging to a specific category. Accessible to all authenticated users.',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @Get('category/:categoryId')
  @UseGuards(StaffGuard) // All authenticated users
  async getProductsByCategory(@Param('categoryId') categoryId: string) {
    this.logger.log(`Fetching products by category: ${categoryId}`);
    
    const products = await this.productsService.getProductsByCategory(categoryId);
    
    this.logger.log(`Retrieved ${products.length} products for category: ${categoryId}`);
    
    return successResponse(products, 'Products retrieved successfully');
  }

  @ApiOperation({
    summary: 'Get product by SKU',
    description: 'Retrieve a specific product by its SKU. Accessible to all authenticated users.',
  })
  @ApiParam({
    name: 'sku',
    description: 'Product SKU',
    example: 'IPH15P-128-BLK',
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    description: 'Include soft-deleted product (ADMIN only)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @Get('sku/:sku')
  @UseGuards(StaffGuard) // All authenticated users
  async findBySku(
    @Param('sku') sku: string,
    @Query('withDeleted', new DefaultValuePipe(false), ParseBoolPipe) withDeleted?: boolean,
  ) {
    this.logger.log(`Fetching product by SKU: ${sku}`);
    
    const product = await this.productsService.findBySku(sku, withDeleted);
    
    this.logger.log(`Product retrieved by SKU: ${product.id}`);
    
    return successResponse(product, 'Product retrieved successfully');
  }

  @ApiOperation({
    summary: 'Get product by barcode',
    description: 'Retrieve a specific product by its barcode. Accessible to all authenticated users.',
  })
  @ApiParam({
    name: 'barcode',
    description: 'Product barcode',
    example: '1234567890123',
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    description: 'Include soft-deleted product (ADMIN only)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @Get('barcode/:barcode')
  @UseGuards(StaffGuard) // All authenticated users
  async findByBarcode(
    @Param('barcode') barcode: string,
    @Query('withDeleted', new DefaultValuePipe(false), ParseBoolPipe) withDeleted?: boolean,
  ) {
    this.logger.log(`Fetching product by barcode: ${barcode}`);
    
    const product = await this.productsService.findByBarcode(barcode, withDeleted);
    
    this.logger.log(`Product retrieved by barcode: ${product.id}`);
    
    return successResponse(product, 'Product retrieved successfully');
  }

  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieve a specific product by its ID. Accessible to all authenticated users.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    description: 'Include soft-deleted product (ADMIN only)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @Get(':id')
  @UseGuards(StaffGuard) // All authenticated users
  async findOne(
    @Param('id') id: string,
    @Query('withDeleted', new DefaultValuePipe(false), ParseBoolPipe) withDeleted?: boolean,
  ) {
    this.logger.log(`Fetching product: ${id}`);
    
    const product = await this.productsService.findOne(id, withDeleted);
    
    this.logger.log(`Product retrieved: ${product.id}`);
    
    return successResponse(product, 'Product retrieved successfully');
  }

  //#endregion

  //#region ==================== UPDATE OPERATIONS ====================

  @ApiOperation({
    summary: 'Update a product',
    description: 'Update an existing product. Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, validation errors, or category not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - MANAGER or ADMIN role required',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiConflictResponse({
    description: 'Product SKU or barcode already exists',
  })
  @Patch(':id')
  @UseGuards(ManagerGuard) // MANAGER+ access
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Updating product: ${id} by user: ${userId}`);
    
    const product = await this.productsService.update(id, updateProductDto, userId);
    
    this.logger.log(`Product updated successfully: ${id}`);
    
    return successResponse(product, API_MESSAGES.PRODUCT_UPDATED);
  }

  @ApiOperation({
    summary: 'Restore a soft-deleted product',
    description: 'Restore a previously soft-deleted product. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product restored successfully',
    type: ProductResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - ADMIN role required',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @Patch(':id/restore')
  @UseGuards(AdminGuard) // ADMIN only
  async restore(@Param('id') id: string) {
    this.logger.log(`Restoring product: ${id}`);
    
    const product = await this.productsService.restore(id);
    
    this.logger.log(`Product restored successfully: ${id}`);
    
    return successResponse(product, 'Product restored successfully');
  }

  //#endregion

  //#region ==================== DELETE OPERATIONS ====================

  @ApiOperation({
    summary: 'Soft delete a product',
    description: 'Soft delete a product (mark as deleted). Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Product deleted successfully',
        data: null,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - MANAGER or ADMIN role required',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @Delete(':id')
  @UseGuards(ManagerGuard) // MANAGER+ access
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Soft deleting product: ${id} by user: ${userId}`);
    
    await this.productsService.remove(id, userId);
    
    this.logger.log(`Product soft deleted successfully: ${id}`);
    
    return successResponse(null, API_MESSAGES.PRODUCT_DELETED);
  }

  @ApiOperation({
    summary: 'Permanently delete a product',
    description: 'Permanently delete a product from the database. Requires ADMIN role. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product permanently deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Product permanently deleted successfully',
        data: null,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - ADMIN role required',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @Delete(':id/purge')
  @UseGuards(AdminGuard) // ADMIN only
  @HttpCode(HttpStatus.OK)
  async hardDelete(@Param('id') id: string) {
    this.logger.log(`Hard deleting product: ${id}`);
    
    await this.productsService.hardDelete(id);
    
    this.logger.log(`Product hard deleted successfully: ${id}`);
    
    return successResponse(null, 'Product permanently deleted successfully');
  }

  //#endregion

  //#region ==================== UTILITY OPERATIONS ====================

  @ApiOperation({
    summary: 'Get products count',
    description: 'Get the total count of products. Accessible to all authenticated users.',
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    description: 'Include soft-deleted products in count (ADMIN only)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Products count retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Products count retrieved successfully',
        data: {
          count: 150,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @Get('stats/count')
  @UseGuards(StaffGuard) // All authenticated users
  async getProductsCount(
    @Query('withDeleted', new DefaultValuePipe(false), ParseBoolPipe) withDeleted?: boolean,
  ) {
    this.logger.log('Getting products count', { withDeleted });
    
    const count = await this.productsService.getProductsCount(withDeleted);
    
    this.logger.log(`Products count: ${count}`);
    
    return successResponse(
      { count },
      'Products count retrieved successfully'
    );
  }

  //#endregion
}