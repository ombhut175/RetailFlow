import { 
  Injectable, 
  Logger, 
  BadRequestException, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { ProductsRepository, PaginatedResult } from '../../core/database/repositories/products.repository';
import { CategoriesRepository } from '../../core/database/repositories/categories.repository';
import { MESSAGES, API_MESSAGES } from '../../common/constants/string-const';
import { CreateProductDto, UpdateProductDto, ProductResponseDto, ProductListResponseDto, ProductFiltersDto } from './dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  //#region ==================== CRUD OPERATIONS ====================

  async create(createProductDto: CreateProductDto, createdBy: string): Promise<ProductResponseDto> {
    this.logger.log(`Creating product: ${createProductDto.name} (SKU: ${createProductDto.sku})`);
    
    try {
      // Validate SKU uniqueness
      const existingProductBySku = await this.productsRepository.findBySku(createProductDto.sku);
      if (existingProductBySku) {
        this.logger.warn(`Product SKU already exists: ${createProductDto.sku}`);
        throw new ConflictException(MESSAGES.PRODUCT_SKU_EXISTS);
      }

      // Validate barcode uniqueness if provided
      if (createProductDto.barcode) {
        const existingProductByBarcode = await this.productsRepository.findByBarcode(createProductDto.barcode);
        if (existingProductByBarcode) {
          this.logger.warn(`Product barcode already exists: ${createProductDto.barcode}`);
          throw new ConflictException(MESSAGES.PRODUCT_BARCODE_EXISTS);
        }
      }

      // Validate category exists and is active if provided
      if (createProductDto.category_id) {
        const category = await this.categoriesRepository.findById(createProductDto.category_id);
        if (!category) {
          this.logger.warn(`Category not found: ${createProductDto.category_id}`);
          throw new BadRequestException(MESSAGES.CATEGORY_NOT_FOUND);
        }
        if (!category.is_active) {
          this.logger.warn(`Category is not active: ${createProductDto.category_id}`);
          throw new BadRequestException('Cannot assign product to inactive category');
        }
      }

      // Create the product
      const productData = {
        ...createProductDto,
        created_by: createdBy,
      };

      const createdProduct = await this.productsRepository.create(productData);
      
      this.logger.log(`Product created successfully: ${createdProduct.name} (ID: ${createdProduct.id})`);
      
      // Get product with category information
      const productWithCategory = await this.productsRepository.findByIdWithCategory(createdProduct.id);
      
      return plainToClass(ProductResponseDto, productWithCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Failed to create product: ${createProductDto.name}`, error.stack);
      
      // Handle database constraint errors
      if (error.message?.includes('unique constraint')) {
        if (error.message.includes('sku')) {
          throw new ConflictException(MESSAGES.PRODUCT_SKU_EXISTS);
        }
        if (error.message.includes('barcode')) {
          throw new ConflictException(MESSAGES.PRODUCT_BARCODE_EXISTS);
        }
      }
      
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(filters: ProductFiltersDto = {}): Promise<ProductListResponseDto | ProductResponseDto[]> {
    this.logger.log('Fetching products with filters', { filters });
    
    try {
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        ...searchFilters
      } = filters;

      // Determine if pagination is requested
      const usePagination = page !== undefined || limit !== undefined;
      
      let result;
      
      if (usePagination) {
        // Use pagination
        const paginationOptions = {
          page: page || 1,
          limit: limit || 10,
          sortBy: sortBy || 'name',
          sortOrder: sortOrder || 'asc',
        };
        
        result = await this.productsRepository.findAll(searchFilters, paginationOptions) as PaginatedResult<any>;
        
        this.logger.log(`Retrieved ${result.data.length} products (page ${result.page}/${result.totalPages})`);
        
        return {
          data: result.data.map(product => 
            plainToClass(ProductResponseDto, product, {
              excludeExtraneousValues: true,
            })
          ),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        };
      } else {
        // No pagination
        result = await this.productsRepository.findAll(searchFilters) as any[];
        
        this.logger.log(`Retrieved ${result.length} products`);
        
        return result.map(product => 
          plainToClass(ProductResponseDto, product, {
            excludeExtraneousValues: true,
          })
        );
      }
    } catch (error) {
      this.logger.error('Failed to fetch products', error.stack);
      throw new BadRequestException('Failed to fetch products');
    }
  }

  async findOne(id: string, withDeleted = false): Promise<ProductResponseDto> {
    this.logger.log(`Finding product by ID: ${id}`);
    
    try {
      const product = await this.productsRepository.findByIdWithCategory(id, withDeleted);
      
      if (!product) {
        this.logger.warn(`Product not found: ${id}`);
        throw new NotFoundException(MESSAGES.PRODUCT_NOT_FOUND);
      }
      
      this.logger.log(`Product found: ${product.name} (ID: ${id})`);
      
      return plainToClass(ProductResponseDto, product, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to find product: ${id}`, error.stack);
      throw new BadRequestException('Failed to find product');
    }
  }

  async findBySku(sku: string, withDeleted = false): Promise<ProductResponseDto> {
    this.logger.log(`Finding product by SKU: ${sku}`);
    
    try {
      const product = await this.productsRepository.findBySku(sku, withDeleted);
      
      if (!product) {
        this.logger.warn(`Product not found with SKU: ${sku}`);
        throw new NotFoundException(MESSAGES.PRODUCT_NOT_FOUND);
      }
      
      // Get product with category information
      const productWithCategory = await this.productsRepository.findByIdWithCategory(product.id, withDeleted);
      
      this.logger.log(`Product found: ${product.name} (SKU: ${sku})`);
      
      return plainToClass(ProductResponseDto, productWithCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to find product by SKU: ${sku}`, error.stack);
      throw new BadRequestException('Failed to find product');
    }
  }

  async findByBarcode(barcode: string, withDeleted = false): Promise<ProductResponseDto> {
    this.logger.log(`Finding product by barcode: ${barcode}`);
    
    try {
      const product = await this.productsRepository.findByBarcode(barcode, withDeleted);
      
      if (!product) {
        this.logger.warn(`Product not found with barcode: ${barcode}`);
        throw new NotFoundException(MESSAGES.PRODUCT_NOT_FOUND);
      }
      
      // Get product with category information
      const productWithCategory = await this.productsRepository.findByIdWithCategory(product.id, withDeleted);
      
      this.logger.log(`Product found: ${product.name} (barcode: ${barcode})`);
      
      return plainToClass(ProductResponseDto, productWithCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to find product by barcode: ${barcode}`, error.stack);
      throw new BadRequestException('Failed to find product');
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, updatedBy: string): Promise<ProductResponseDto> {
    this.logger.log(`Updating product: ${id}`);
    
    try {
      // Check if product exists
      await this.productsRepository.findProductByIdOrThrow(id);
      
      // Validate SKU uniqueness if being updated
      if (updateProductDto.sku) {
        const existingProductBySku = await this.productsRepository.findBySku(updateProductDto.sku);
        if (existingProductBySku && existingProductBySku.id !== id) {
          this.logger.warn(`Product SKU already exists: ${updateProductDto.sku}`);
          throw new ConflictException(MESSAGES.PRODUCT_SKU_EXISTS);
        }
      }

      // Validate barcode uniqueness if being updated
      if (updateProductDto.barcode) {
        const existingProductByBarcode = await this.productsRepository.findByBarcode(updateProductDto.barcode);
        if (existingProductByBarcode && existingProductByBarcode.id !== id) {
          this.logger.warn(`Product barcode already exists: ${updateProductDto.barcode}`);
          throw new ConflictException(MESSAGES.PRODUCT_BARCODE_EXISTS);
        }
      }

      // Validate category exists and is active if being updated
      if (updateProductDto.category_id) {
        const category = await this.categoriesRepository.findById(updateProductDto.category_id);
        if (!category) {
          this.logger.warn(`Category not found: ${updateProductDto.category_id}`);
          throw new BadRequestException(MESSAGES.CATEGORY_NOT_FOUND);
        }
        if (!category.is_active) {
          this.logger.warn(`Category is not active: ${updateProductDto.category_id}`);
          throw new BadRequestException('Cannot assign product to inactive category');
        }
      }

      // Update the product
      const updateData = {
        ...updateProductDto,
        updated_by: updatedBy,
      };

      const updatedProduct = await this.productsRepository.update(id, updateData);
      
      this.logger.log(`Product updated successfully: ${id}`);
      
      // Get product with category information
      const productWithCategory = await this.productsRepository.findByIdWithCategory(updatedProduct.id);
      
      return plainToClass(ProductResponseDto, productWithCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Failed to update product: ${id}`, error.stack);
      
      // Handle database constraint errors
      if (error.message?.includes('unique constraint')) {
        if (error.message.includes('sku')) {
          throw new ConflictException(MESSAGES.PRODUCT_SKU_EXISTS);
        }
        if (error.message.includes('barcode')) {
          throw new ConflictException(MESSAGES.PRODUCT_BARCODE_EXISTS);
        }
      }
      
      throw new BadRequestException('Failed to update product');
    }
  }

  async remove(id: string, deletedBy: string): Promise<void> {
    this.logger.log(`Soft deleting product: ${id}`);
    
    try {
      // Check if product exists
      await this.productsRepository.findProductByIdOrThrow(id);
      
      // TODO: Check if product has stock or is referenced in orders
      // This should be implemented when stock and orders services are ready
      
      await this.productsRepository.softDelete(id, deletedBy);
      
      this.logger.log(`Product soft deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Failed to soft delete product: ${id}`, error.stack);
      throw new BadRequestException('Failed to delete product');
    }
  }

  async hardDelete(id: string): Promise<void> {
    this.logger.log(`Hard deleting product: ${id}`);
    
    try {
      // Check if product exists (including soft deleted)
      await this.productsRepository.findProductByIdOrThrow(id, true);
      
      // TODO: Check if product has stock or is referenced in orders
      // This should be implemented when stock and orders services are ready
      
      await this.productsRepository.hardDelete(id);
      
      this.logger.log(`Product hard deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Failed to hard delete product: ${id}`, error.stack);
      throw new BadRequestException('Failed to permanently delete product');
    }
  }

  async restore(id: string): Promise<ProductResponseDto> {
    this.logger.log(`Restoring product: ${id}`);
    
    try {
      const restoredProduct = await this.productsRepository.restore(id);
      
      this.logger.log(`Product restored successfully: ${id}`);
      
      // Get product with category information
      const productWithCategory = await this.productsRepository.findByIdWithCategory(restoredProduct.id);
      
      return plainToClass(ProductResponseDto, productWithCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error.message === MESSAGES.PRODUCT_NOT_FOUND) {
        this.logger.warn(`Product not found for restoration: ${id}`);
        throw new NotFoundException(MESSAGES.PRODUCT_NOT_FOUND);
      }
      
      this.logger.error(`Failed to restore product: ${id}`, error.stack);
      throw new BadRequestException('Failed to restore product');
    }
  }

  //#endregion

  //#region ==================== UTILITY OPERATIONS ====================

  async getActiveProducts(): Promise<ProductResponseDto[]> {
    this.logger.log('Fetching active products');
    
    try {
      const products = await this.productsRepository.getActiveProducts();
      
      this.logger.log(`Retrieved ${products.length} active products`);
      
      return products.map(product => 
        plainToClass(ProductResponseDto, product, {
          excludeExtraneousValues: true,
        })
      );
    } catch (error) {
      this.logger.error('Failed to fetch active products', error.stack);
      throw new BadRequestException('Failed to fetch active products');
    }
  }

  async getProductsByCategory(categoryId: string): Promise<ProductResponseDto[]> {
    this.logger.log(`Fetching products by category: ${categoryId}`);
    
    try {
      // Validate category exists
      const category = await this.categoriesRepository.findById(categoryId);
      if (!category) {
        this.logger.warn(`Category not found: ${categoryId}`);
        throw new NotFoundException(MESSAGES.CATEGORY_NOT_FOUND);
      }
      
      const products = await this.productsRepository.getProductsByCategory(categoryId);
      
      this.logger.log(`Retrieved ${products.length} products for category: ${categoryId}`);
      
      return products.map(product => 
        plainToClass(ProductResponseDto, product, {
          excludeExtraneousValues: true,
        })
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to fetch products by category: ${categoryId}`, error.stack);
      throw new BadRequestException('Failed to fetch products by category');
    }
  }

  async getProductsCount(withDeleted = false): Promise<number> {
    this.logger.log('Getting products count');
    
    try {
      const count = await this.productsRepository.getProductsCount(withDeleted);
      
      this.logger.log(`Products count: ${count}`);
      
      return count;
    } catch (error) {
      this.logger.error('Failed to get products count', error.stack);
      throw new BadRequestException('Failed to get products count');
    }
  }

  async searchProducts(searchTerm: string, limit = 10): Promise<ProductResponseDto[]> {
    this.logger.log(`Searching products with term: ${searchTerm}`);
    
    try {
      const products = await this.productsRepository.searchProducts(searchTerm, limit);
      
      this.logger.log(`Found ${products.length} products matching search term: ${searchTerm}`);
      
      return products.map(product => 
        plainToClass(ProductResponseDto, product, {
          excludeExtraneousValues: true,
        })
      );
    } catch (error) {
      this.logger.error(`Failed to search products with term: ${searchTerm}`, error.stack);
      throw new BadRequestException('Failed to search products');
    }
  }

  async validateProductExists(id: string): Promise<boolean> {
    this.logger.log(`Validating product exists: ${id}`);
    
    try {
      const product = await this.productsRepository.findById(id);
      const exists = !!product;
      
      this.logger.log(`Product exists validation for ${id}: ${exists}`);
      
      return exists;
    } catch (error) {
      this.logger.error(`Failed to validate product exists: ${id}`, error.stack);
      return false;
    }
  }

  async validateProductActive(id: string): Promise<boolean> {
    this.logger.log(`Validating product is active: ${id}`);
    
    try {
      const product = await this.productsRepository.findById(id);
      const isActive = product?.is_active || false;
      
      this.logger.log(`Product active validation for ${id}: ${isActive}`);
      
      return isActive;
    } catch (error) {
      this.logger.error(`Failed to validate product is active: ${id}`, error.stack);
      return false;
    }
  }

  async hasCategoryProducts(categoryId: string): Promise<boolean> {
    this.logger.log(`Checking if category has products: ${categoryId}`);
    
    try {
      const products = await this.productsRepository.getProductsByCategory(categoryId);
      const hasProducts = products.length > 0;
      
      this.logger.log(`Category ${categoryId} has products: ${hasProducts}`);
      
      return hasProducts;
    } catch (error) {
      this.logger.error(`Failed to check if category has products: ${categoryId}`, error.stack);
      return false;
    }
  }

  //#endregion

  //#region ==================== VALIDATION HELPERS ====================

  private async validateSku(sku: string, excludeId?: string): Promise<void> {
    const exists = await this.productsRepository.skuExists(sku, excludeId);
    if (exists) {
      throw new ConflictException(MESSAGES.PRODUCT_SKU_EXISTS);
    }
  }

  private async validateBarcode(barcode: string, excludeId?: string): Promise<void> {
    const exists = await this.productsRepository.barcodeExists(barcode, excludeId);
    if (exists) {
      throw new ConflictException(MESSAGES.PRODUCT_BARCODE_EXISTS);
    }
  }

  //#endregion
}