import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class ProductCategoryDto {
  @ApiProperty({
    description: 'Category unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Electronic devices and accessories',
  })
  @Expose()
  description: string | null;
}

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit)',
    example: 'IPH15P-128-BLK',
  })
  @Expose()
  sku: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '1234567890123',
  })
  @Expose()
  barcode: string | null;

  @ApiPropertyOptional({
    description: 'Category ID this product belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  category_id: string | null;

  @ApiPropertyOptional({
    description: 'Category information',
    type: ProductCategoryDto,
  })
  @Expose()
  @Type(() => ProductCategoryDto)
  category: ProductCategoryDto | null;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Latest iPhone with advanced camera system and A17 Pro chip',
  })
  @Expose()
  description: string | null;

  @ApiProperty({
    description: 'Product unit price (selling price)',
    example: '999.99',
  })
  @Expose()
  unit_price: string;

  @ApiPropertyOptional({
    description: 'Product cost price (purchase/manufacturing cost)',
    example: '750.00',
  })
  @Expose()
  cost_price: string | null;

  @ApiProperty({
    description: 'Minimum stock level for low stock alerts',
    example: 10,
  })
  @Expose()
  minimum_stock_level: number;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
  })
  @Expose()
  is_active: boolean;

  @ApiProperty({
    description: 'User ID who created this product',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  created_by: string;

  @ApiProperty({
    description: 'Product creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  @Expose()
  created_at: Date;

  @ApiPropertyOptional({
    description: 'User ID who last updated this product',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  updated_by: string | null;

  @ApiPropertyOptional({
    description: 'Product last update timestamp',
    example: '2024-01-15T14:30:00.000Z',
    format: 'date-time',
  })
  @Expose()
  updated_at: Date | null;
}

export class ProductListResponseDto {
  @ApiProperty({
    description: 'List of products',
    type: [ProductResponseDto],
  })
  @Expose()
  data: ProductResponseDto[];

  @ApiProperty({
    description: 'Total number of products',
    example: 150,
  })
  @Expose()
  total: number;

  @ApiPropertyOptional({
    description: 'Current page number (for paginated results)',
    example: 1,
  })
  @Expose()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page (for paginated results)',
    example: 10,
  })
  @Expose()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Total number of pages (for paginated results)',
    example: 15,
  })
  @Expose()
  totalPages?: number;
}

export class ProductFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by product name (partial match)',
    example: 'iPhone',
  })
  @Expose()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by SKU (partial match)',
    example: 'IPH15',
  })
  @Expose()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Filter by barcode (exact match)',
    example: '1234567890123',
  })
  @Expose()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @Expose()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 100.00,
  })
  @Expose()
  min_price?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 1000.00,
  })
  @Expose()
  max_price?: number;

  @ApiPropertyOptional({
    description: 'Include deleted products in results',
    example: false,
    default: false,
  })
  @Expose()
  withDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Include category information in results',
    example: true,
    default: true,
  })
  @Expose()
  withCategory?: boolean;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Expose()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Expose()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'name',
    enum: ['name', 'sku', 'unit_price', 'created_at'],
    default: 'name',
  })
  @Expose()
  sortBy?: 'name' | 'sku' | 'unit_price' | 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @Expose()
  sortOrder?: 'asc' | 'desc';
}