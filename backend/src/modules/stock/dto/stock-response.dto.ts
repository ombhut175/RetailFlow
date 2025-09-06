import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsUUID, IsEnum, IsDate, IsBoolean } from 'class-validator';
import { StockTransactionType, StockReferenceType } from './create-stock-transaction.dto';

export class ProductInfoDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
  })
  name: string;

  @ApiProperty({
    description: 'Product SKU',
    example: 'IPH15P-128-BLK',
  })
  sku: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '1234567890123',
  })
  barcode?: string;

  @ApiProperty({
    description: 'Minimum stock level',
    example: 10,
  })
  minimum_stock_level: number;
}

export class StockResponseDto {
  @ApiProperty({
    description: 'Stock record ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  product_id: string;

  @ApiProperty({
    description: 'Available quantity',
    example: 100,
  })
  quantity_available: number;

  @ApiProperty({
    description: 'Reserved quantity',
    example: 10,
  })
  quantity_reserved: number;

  @ApiPropertyOptional({
    description: 'Product information',
    type: ProductInfoDto,
  })
  product?: ProductInfoDto;

  @ApiProperty({
    description: 'Created by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  created_by: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  created_at: Date;

  @ApiPropertyOptional({
    description: 'Updated by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  updated_by?: string;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
    example: '2024-01-15T11:30:00.000Z',
  })
  updated_at?: Date;
}

export class StockSummaryDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  product_id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
  })
  product_name: string;

  @ApiProperty({
    description: 'Product SKU',
    example: 'IPH15P-128-BLK',
  })
  product_sku: string;

  @ApiProperty({
    description: 'Available quantity',
    example: 100,
  })
  quantity_available: number;

  @ApiProperty({
    description: 'Reserved quantity',
    example: 10,
  })
  quantity_reserved: number;

  @ApiProperty({
    description: 'Total quantity (available + reserved)',
    example: 110,
  })
  total_quantity: number;

  @ApiProperty({
    description: 'Minimum stock level',
    example: 10,
  })
  minimum_stock_level: number;

  @ApiProperty({
    description: 'Whether stock is below minimum level',
    example: false,
  })
  is_low_stock: boolean;
}

export class StockTransactionResponseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  product_id: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: StockTransactionType,
    example: StockTransactionType.IN,
  })
  transaction_type: StockTransactionType;

  @ApiProperty({
    description: 'Quantity change',
    example: 50,
  })
  quantity: number;

  @ApiProperty({
    description: 'Reference type',
    enum: StockReferenceType,
    example: StockReferenceType.PURCHASE,
  })
  reference_type: StockReferenceType;

  @ApiPropertyOptional({
    description: 'Reference ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  reference_id?: string;

  @ApiPropertyOptional({
    description: 'Transaction notes',
    example: 'Received from supplier ABC',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Product information',
    type: ProductInfoDto,
  })
  product?: ProductInfoDto;

  @ApiProperty({
    description: 'Created by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  created_by: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  created_at: Date;
}

export class StockFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID('4')
  product_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by low stock status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  low_stock?: boolean;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

export class StockTransactionFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID('4')
  product_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by transaction type',
    enum: StockTransactionType,
    example: StockTransactionType.IN,
  })
  @IsOptional()
  @IsEnum(StockTransactionType)
  transaction_type?: StockTransactionType;

  @ApiPropertyOptional({
    description: 'Filter by reference type',
    enum: StockReferenceType,
    example: StockReferenceType.PURCHASE,
  })
  @IsOptional()
  @IsEnum(StockReferenceType)
  reference_type?: StockReferenceType;

  @ApiPropertyOptional({
    description: 'Filter by reference ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID('4')
  reference_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by created by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID('4')
  created_by?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_date?: Date;

  @ApiPropertyOptional({
    description: 'Filter by end date',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_date?: Date;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}