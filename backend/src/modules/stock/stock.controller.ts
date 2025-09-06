import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StockService } from './stock.service';
import {
  CreateStockDto,
  UpdateStockDto,
  AdjustStockDto,
  ReserveStockDto,
  ReleaseStockDto,
  CreateStockTransactionDto,
  StockResponseDto,
  StockSummaryDto,
  StockTransactionResponseDto,
  StockFiltersDto,
  StockTransactionFiltersDto,
} from './dto';

@ApiTags('Stock Management')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create stock record for a product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Stock record created successfully',
    type: StockResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Stock already exists for this product',
  })
  async createStock(@Body() createStockDto: CreateStockDto): Promise<StockResponseDto> {
    return this.stockService.createStock(createStockDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stock records with optional filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock records retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/StockSummaryDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async findAll(@Query() filters: StockFiltersDto) {
    return this.stockService.findAll(filters);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock levels' })
  @ApiQuery({
    name: 'threshold',
    required: false,
    description: 'Custom threshold for low stock (defaults to product minimum_stock_level)',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Low stock items retrieved successfully',
    type: [StockSummaryDto],
  })
  async getLowStockItems(@Query('threshold') threshold?: number): Promise<StockSummaryDto[]> {
    return this.stockService.getLowStockItems(threshold);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get stock record by product ID' })
  @ApiParam({
    name: 'productId',
    description: 'Product UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock record retrieved successfully',
    type: StockResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Stock not found for this product',
  })
  async findByProductId(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<StockResponseDto> {
    return this.stockService.findByProductId(productId);
  }

  @Put('product/:productId')
  @ApiOperation({ summary: 'Update stock record' })
  @ApiParam({
    name: 'productId',
    description: 'Product UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock record updated successfully',
    type: StockResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Stock not found for this product',
  })
  async updateStock(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<StockResponseDto> {
    return this.stockService.updateStock(productId, updateStockDto);
  }

  @Patch('product/:productId/adjust')
  @ApiOperation({ summary: 'Adjust stock quantity (increase or decrease)' })
  @ApiParam({
    name: 'productId',
    description: 'Product UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock adjusted successfully',
    type: StockResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Insufficient stock or invalid adjustment',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Stock not found for this product',
  })
  async adjustStock(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() adjustStockDto: AdjustStockDto,
  ): Promise<StockResponseDto> {
    return this.stockService.adjustStock(productId, adjustStockDto);
  }

  @Patch('product/:productId/reserve')
  @ApiOperation({ summary: 'Reserve stock quantity' })
  @ApiParam({
    name: 'productId',
    description: 'Product UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock reserved successfully',
    type: StockResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Insufficient available stock',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Stock not found for this product',
  })
  async reserveStock(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() reserveStockDto: ReserveStockDto,
  ): Promise<StockResponseDto> {
    return this.stockService.reserveStock(productId, reserveStockDto);
  }

  @Patch('product/:productId/release')
  @ApiOperation({ summary: 'Release reserved stock quantity' })
  @ApiParam({
    name: 'productId',
    description: 'Product UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock released successfully',
    type: StockResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Insufficient reserved stock',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Stock not found for this product',
  })
  async releaseStock(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() releaseStockDto: ReleaseStockDto,
  ): Promise<StockResponseDto> {
    return this.stockService.releaseStock(productId, releaseStockDto);
  }

  // Stock Transactions
  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a stock transaction' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Stock transaction created successfully',
    type: StockTransactionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or insufficient stock',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async createTransaction(
    @Body() createTransactionDto: CreateStockTransactionDto,
  ): Promise<StockTransactionResponseDto> {
    return this.stockService.createTransaction(createTransactionDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get all stock transactions with optional filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/StockTransactionResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async findTransactions(@Query() filters: StockTransactionFiltersDto) {
    return this.stockService.findTransactions(filters);
  }

  @Get('transactions/product/:productId')
  @ApiOperation({ summary: 'Get stock transactions by product ID' })
  @ApiParam({
    name: 'productId',
    description: 'Product UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product stock transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/StockTransactionResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async findTransactionsByProductId(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.stockService.findTransactionsByProductId(productId, { page, limit });
  }
}