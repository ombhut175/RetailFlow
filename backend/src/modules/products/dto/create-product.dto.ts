import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  IsUUID, 
  MaxLength, 
  Min, 
  IsDecimal,
  Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
    maxLength: 200,
  })
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(200, { message: 'Product name cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit) - must be unique',
    example: 'IPH15P-128-BLK',
    maxLength: 50,
  })
  @IsString({ message: 'SKU must be a string' })
  @IsNotEmpty({ message: 'SKU is required' })
  @MaxLength(50, { message: 'SKU cannot exceed 50 characters' })
  @Matches(/^[A-Z0-9-_]+$/i, { 
    message: 'SKU can only contain letters, numbers, hyphens, and underscores' 
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  sku: string;

  @ApiPropertyOptional({
    description: 'Product barcode - must be unique if provided',
    example: '1234567890123',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Barcode must be a string' })
  @MaxLength(50, { message: 'Barcode cannot exceed 50 characters' })
  @Matches(/^[0-9A-Z-]+$/i, { 
    message: 'Barcode can only contain letters, numbers, and hyphens' 
  })
  @Transform(({ value }) => value?.trim())
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Category ID this product belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Category ID must be a valid UUID' })
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Latest iPhone with advanced camera system and A17 Pro chip',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Product description must be a string' })
  @MaxLength(1000, { message: 'Product description cannot exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Product unit price (selling price)',
    example: 999.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Unit price must be a number with up to 2 decimal places' })
  @Min(0, { message: 'Unit price must be greater than or equal to 0' })
  @Type(() => Number)
  unit_price: number;

  @ApiPropertyOptional({
    description: 'Product cost price (purchase/manufacturing cost)',
    example: 750.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Cost price must be a number with up to 2 decimal places' })
  @Min(0, { message: 'Cost price must be greater than or equal to 0' })
  @Type(() => Number)
  cost_price?: number;

  @ApiPropertyOptional({
    description: 'Minimum stock level for low stock alerts',
    example: 10,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum stock level must be a number' })
  @Min(0, { message: 'Minimum stock level must be greater than or equal to 0' })
  @Type(() => Number)
  minimum_stock_level?: number;

  @ApiPropertyOptional({
    description: 'Whether the product is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean value' })
  is_active?: boolean;
}