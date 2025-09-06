import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsUUID, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreatePurchaseOrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Product ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  product_id: string;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 100,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Quantity ordered must be a number' })
  @Min(1, { message: 'Quantity ordered must be at least 1' })
  @Type(() => Number)
  quantity_ordered: number;

  @ApiPropertyOptional({
    description: 'Quantity received',
    example: 0,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Quantity received must be a number' })
  @Min(0, { message: 'Quantity received cannot be negative' })
  @Type(() => Number)
  quantity_received?: number;

  @ApiProperty({
    description: 'Unit cost',
    example: 25.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Unit cost must be a number with max 2 decimal places' })
  @Min(0, { message: 'Unit cost cannot be negative' })
  @Type(() => Number)
  unit_cost: number;

  @ApiProperty({
    description: 'Total cost (calculated as quantity * unit_cost)',
    example: 2599.00,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Total cost must be a number with max 2 decimal places' })
  @Min(0, { message: 'Total cost cannot be negative' })
  @Type(() => Number)
  total_cost: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({
    description: 'Supplier ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Supplier ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Supplier ID is required' })
  supplier_id: string;

  @ApiProperty({
    description: 'Purchase order number (must be unique)',
    example: 'PO-2024-001',
    maxLength: 100,
  })
  @IsString({ message: 'Order number must be a string' })
  @IsNotEmpty({ message: 'Order number is required' })
  @Transform(({ value }) => value?.trim())
  order_number: string;

  @ApiProperty({
    description: 'Purchase order status',
    example: 'PENDING',
    enum: ['PENDING', 'CONFIRMED', 'RECEIVED', 'CANCELLED'],
  })
  @IsEnum(['PENDING', 'CONFIRMED', 'RECEIVED', 'CANCELLED'], { 
    message: 'Status must be one of: PENDING, CONFIRMED, RECEIVED, CANCELLED' 
  })
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED';

  @ApiPropertyOptional({
    description: 'Order date',
    example: '2024-01-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Order date must be a valid date string (YYYY-MM-DD)' })
  order_date?: string;

  @ApiPropertyOptional({
    description: 'Expected delivery date',
    example: '2024-01-25',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expected delivery date must be a valid date string (YYYY-MM-DD)' })
  expected_delivery_date?: string;

  @ApiPropertyOptional({
    description: 'Total amount',
    example: 2599.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Total amount must be a number with max 2 decimal places' })
  @Min(0, { message: 'Total amount cannot be negative' })
  @Type(() => Number)
  total_amount?: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Urgent delivery required',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @ApiProperty({
    description: 'Purchase order items',
    type: [CreatePurchaseOrderItemDto],
  })
  @IsArray({ message: 'Items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}
