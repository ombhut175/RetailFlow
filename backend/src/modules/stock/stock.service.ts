import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { StockRepository } from '../../core/database/repositories/stock.repository';
import { StockTransactionsRepository } from '../../core/database/repositories/stock-transactions.repository';
import { ProductsRepository } from '../../core/database/repositories/products.repository';
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
  StockTransactionType,
  StockReferenceType
} from './dto';

@Injectable()
export class StockService {
  constructor(
    private readonly stockRepository: StockRepository,
    private readonly stockTransactionsRepository: StockTransactionsRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async createStock(createStockDto: CreateStockDto): Promise<StockResponseDto> {
    // Check if product exists
    const product = await this.productsRepository.findById(createStockDto.product_id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${createStockDto.product_id} not found`);
    }

    // Check if stock already exists for this product
    const existingStock = await this.stockRepository.findByProductId(createStockDto.product_id);
    if (existingStock) {
      throw new ConflictException(`Stock already exists for product ${createStockDto.product_id}`);
    }

    const stock = await this.stockRepository.create(createStockDto);

    // Create initial stock transaction if quantity > 0
    if (createStockDto.quantity_available > 0) {
      const transactionDto: CreateStockTransactionDto = {
        product_id: createStockDto.product_id,
        transaction_type: StockTransactionType.IN,
        quantity: createStockDto.quantity_available,
        reference_type: StockReferenceType.ADJUSTMENT,
        notes: 'Initial stock creation',
        created_by: createStockDto.created_by,
      };
      await this.stockTransactionsRepository.create(transactionDto);
    }

    return this.mapToStockResponse(stock);
  }

  async findAll(filters: StockFiltersDto = {}): Promise<{
    data: StockSummaryDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, ...filterOptions } = filters;
    
    // Get all stock records with products
    const allStocks = await this.stockRepository.findAll();
    
    // Apply filters
    let filteredStocks = allStocks;
    if (filterOptions.product_id) {
      filteredStocks = filteredStocks.filter(stock => stock.product_id === filterOptions.product_id);
    }
    if (filterOptions.low_stock !== undefined) {
      filteredStocks = filteredStocks.filter(stock => {
        const totalQuantity = stock.quantity_available + stock.quantity_reserved;
        const minimumLevel = stock.product?.minimum_stock_level || 0;
        const isLowStock = totalQuantity <= minimumLevel;
        return filterOptions.low_stock ? isLowStock : !isLowStock;
      });
    }

    // Apply pagination
    const total = filteredStocks.length;
    const offset = (page - 1) * limit;
    const paginatedStocks = filteredStocks.slice(offset, offset + limit);

    const data = paginatedStocks.map((stock: any) => this.mapToStockSummary(stock));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByProductId(productId: string): Promise<StockResponseDto> {
    const stock = await this.stockRepository.findByProductId(productId);
    if (!stock) {
      throw new NotFoundException(`Stock not found for product ${productId}`);
    }
    return this.mapToStockResponse(stock);
  }

  async updateStock(productId: string, updateStockDto: UpdateStockDto): Promise<StockResponseDto> {
    const existingStock = await this.stockRepository.findByProductId(productId);
    if (!existingStock) {
      throw new NotFoundException(`Stock not found for product ${productId}`);
    }

    const updatedStock = await this.stockRepository.update(productId, updateStockDto);
    return this.mapToStockResponse(updatedStock);
  }

  async adjustStock(productId: string, adjustStockDto: AdjustStockDto): Promise<StockResponseDto> {
    const existingStock = await this.stockRepository.findByProductId(productId);
    if (!existingStock) {
      throw new NotFoundException(`Stock not found for product ${productId}`);
    }

    const newQuantity = existingStock.quantity_available + adjustStockDto.quantity_change;
    if (newQuantity < 0) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${existingStock.quantity_available}, Requested change: ${adjustStockDto.quantity_change}`
      );
    }

    // Update stock quantity
    const updatedStock = await this.stockRepository.update(productId, {
      quantity_available: newQuantity,
      updated_by: adjustStockDto.updated_by,
    });

    // Create stock transaction
    const transactionDto: CreateStockTransactionDto = {
      product_id: productId,
      transaction_type: adjustStockDto.quantity_change > 0 ? StockTransactionType.IN : StockTransactionType.OUT,
      quantity: Math.abs(adjustStockDto.quantity_change),
      reference_type: StockReferenceType.ADJUSTMENT,
      notes: adjustStockDto.notes || 'Stock adjustment',
      created_by: adjustStockDto.updated_by,
    };
    await this.stockTransactionsRepository.create(transactionDto);

    return this.mapToStockResponse(updatedStock);
  }

  async reserveStock(productId: string, reserveStockDto: ReserveStockDto): Promise<StockResponseDto> {
    const existingStock = await this.stockRepository.findByProductId(productId);
    if (!existingStock) {
      throw new NotFoundException(`Stock not found for product ${productId}`);
    }

    if (existingStock.quantity_available < reserveStockDto.quantity) {
      throw new BadRequestException(
        `Insufficient available stock. Available: ${existingStock.quantity_available}, Requested: ${reserveStockDto.quantity}`
      );
    }

    // Move quantity from available to reserved
    const updatedStock = await this.stockRepository.update(productId, {
      quantity_available: existingStock.quantity_available - reserveStockDto.quantity,
      quantity_reserved: existingStock.quantity_reserved + reserveStockDto.quantity,
      updated_by: reserveStockDto.updated_by,
    });

    // Create stock transaction
    const transactionDto: CreateStockTransactionDto = {
      product_id: productId,
      transaction_type: StockTransactionType.OUT,
      quantity: reserveStockDto.quantity,
      reference_type: StockReferenceType.ADJUSTMENT,
      notes: reserveStockDto.notes || 'Stock reservation',
      created_by: reserveStockDto.updated_by,
    };
    await this.stockTransactionsRepository.create(transactionDto);

    return this.mapToStockResponse(updatedStock);
  }

  async releaseStock(productId: string, releaseStockDto: ReleaseStockDto): Promise<StockResponseDto> {
    const existingStock = await this.stockRepository.findByProductId(productId);
    if (!existingStock) {
      throw new NotFoundException(`Stock not found for product ${productId}`);
    }

    if (existingStock.quantity_reserved < releaseStockDto.quantity) {
      throw new BadRequestException(
        `Insufficient reserved stock. Reserved: ${existingStock.quantity_reserved}, Requested: ${releaseStockDto.quantity}`
      );
    }

    // Move quantity from reserved back to available
    const updatedStock = await this.stockRepository.update(productId, {
      quantity_available: existingStock.quantity_available + releaseStockDto.quantity,
      quantity_reserved: existingStock.quantity_reserved - releaseStockDto.quantity,
      updated_by: releaseStockDto.updated_by,
    });

    // Create stock transaction
    const transactionDto: CreateStockTransactionDto = {
      product_id: productId,
      transaction_type: StockTransactionType.IN,
      quantity: releaseStockDto.quantity,
      reference_type: StockReferenceType.ADJUSTMENT,
      notes: releaseStockDto.notes || 'Stock release from reservation',
      created_by: releaseStockDto.updated_by,
    };
    await this.stockTransactionsRepository.create(transactionDto);

    return this.mapToStockResponse(updatedStock);
  }

  async createTransaction(createTransactionDto: CreateStockTransactionDto): Promise<StockTransactionResponseDto> {
    // Check if product exists
    const product = await this.productsRepository.findById(createTransactionDto.product_id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${createTransactionDto.product_id} not found`);
    }

    // Get current stock
    let stock = await this.stockRepository.findByProductId(createTransactionDto.product_id);
    
    // Create stock record if it doesn't exist
    if (!stock) {
      const createStockDto: CreateStockDto = {
        product_id: createTransactionDto.product_id,
        quantity_available: 0,
        quantity_reserved: 0,
        created_by: createTransactionDto.created_by,
      };
      stock = await this.stockRepository.create(createStockDto);
    }

    // Update stock based on transaction type
    if (createTransactionDto.transaction_type === StockTransactionType.IN) {
      await this.stockRepository.update(createTransactionDto.product_id, {
        quantity_available: stock.quantity_available + createTransactionDto.quantity,
        updated_by: createTransactionDto.created_by,
      });
    } else if (createTransactionDto.transaction_type === StockTransactionType.OUT) {
      if (stock.quantity_available < createTransactionDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${stock.quantity_available}, Requested: ${createTransactionDto.quantity}`
        );
      }
      await this.stockRepository.update(createTransactionDto.product_id, {
        quantity_available: stock.quantity_available - createTransactionDto.quantity,
        updated_by: createTransactionDto.created_by,
      });
    }

    const transaction = await this.stockTransactionsRepository.create(createTransactionDto);
    return this.mapToTransactionResponse(transaction);
  }

  async findTransactions(filters: StockTransactionFiltersDto = {}): Promise<{
    data: StockTransactionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, start_date, end_date, ...filterOptions } = filters;
    
    // Convert filter format
    const repositoryFilters = {
      product_id: filterOptions.product_id,
      transaction_type: filterOptions.transaction_type,
      reference_id: filterOptions.reference_id,
      reference_type: filterOptions.reference_type,
      created_by: filterOptions.created_by,
      date_from: start_date,
      date_to: end_date,
    };
    
    const allTransactions = await this.stockTransactionsRepository.findWithFilters(repositoryFilters);
    
    // Apply pagination
    const total = allTransactions.length;
    const offset = (page - 1) * limit;
    const paginatedTransactions = allTransactions.slice(offset, offset + limit);

    const data = paginatedTransactions.map((transaction: any) => this.mapToTransactionResponse(transaction));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findTransactionsByProductId(productId: string, options: { page?: number; limit?: number } = {}): Promise<{
    data: StockTransactionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20 } = options;
    
    const allTransactions = await this.stockTransactionsRepository.findByProductId(productId, {
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
    
    // Apply pagination
    const total = allTransactions.length;
    const offset = (page - 1) * limit;
    const paginatedTransactions = allTransactions.slice(offset, offset + limit);

    const data = paginatedTransactions.map((transaction: any) => this.mapToTransactionResponse(transaction));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getLowStockItems(threshold?: number): Promise<StockSummaryDto[]> {
    const stocks = await this.stockRepository.getLowStockProducts();
    return stocks.map((stock: any) => ({
      product_id: stock.product_id,
      product_name: stock.product_name,
      product_sku: stock.product_sku,
      quantity_available: stock.quantity_available,
      quantity_reserved: stock.quantity_reserved,
      total_quantity: stock.total_quantity,
      minimum_stock_level: stock.minimum_stock_level,
      is_low_stock: stock.is_low_stock,
    }));
  }

  private mapToStockResponse(stock: any): StockResponseDto {
    return {
      id: stock.id,
      product_id: stock.product_id,
      quantity_available: stock.quantity_available,
      quantity_reserved: stock.quantity_reserved,
      product: stock.product ? {
        id: stock.product.id,
        name: stock.product.name,
        sku: stock.product.sku,
        barcode: stock.product.barcode,
        minimum_stock_level: stock.product.minimum_stock_level,
      } : undefined,
      created_by: stock.created_by,
      created_at: stock.created_at,
      updated_by: stock.updated_by,
      updated_at: stock.updated_at,
    };
  }

  private mapToStockSummary(stock: any): StockSummaryDto {
    const totalQuantity = stock.quantity_available + stock.quantity_reserved;
    const minimumLevel = stock.product?.minimum_stock_level || 0;
    
    return {
      product_id: stock.product_id,
      product_name: stock.product?.name || 'Unknown Product',
      product_sku: stock.product?.sku || 'N/A',
      quantity_available: stock.quantity_available,
      quantity_reserved: stock.quantity_reserved,
      total_quantity: totalQuantity,
      minimum_stock_level: minimumLevel,
      is_low_stock: totalQuantity <= minimumLevel,
    };
  }

  private mapToTransactionResponse(transaction: any): StockTransactionResponseDto {
    return {
      id: transaction.id,
      product_id: transaction.product_id,
      transaction_type: transaction.transaction_type,
      quantity: transaction.quantity,
      reference_type: transaction.reference_type,
      reference_id: transaction.reference_id,
      notes: transaction.notes,
      product: transaction.product ? {
        id: transaction.product.id,
        name: transaction.product.name,
        sku: transaction.product.sku,
        barcode: transaction.product.barcode,
        minimum_stock_level: transaction.product.minimum_stock_level,
      } : undefined,
      created_by: transaction.created_by,
      created_at: transaction.created_at,
    };
  }
}