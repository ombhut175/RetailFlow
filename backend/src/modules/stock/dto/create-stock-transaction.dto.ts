import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsUUID, 
  IsEnum,
  IsInt,
  MaxLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export enum StockTransactionType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum StockReferenceType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN'
}

export class CreateStockTransactionDto {
  @ApiProperty({
    description: 'Product ID for the stock transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Product ID must be a string' })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  product_id: string;

  @ApiProperty({
    description: 'Type of stock transaction',
    enum: StockTransactionType,
    example: StockTransactionType.IN,
  })
  @IsEnum(StockTransactionType, { message: 'Transaction type must be IN, OUT, or ADJUSTMENT' })
  transaction_type: StockTransactionType;

  @ApiProperty({
    description: 'Quantity change (positive for IN, negative for OUT)',
    example: 50,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: 'Reference type for the transaction',
    enum: StockReferenceType,
    example: StockReferenceType.PURCHASE,
  })
  @IsEnum(StockReferenceType, { message: 'Reference type must be PURCHASE, SALE, ADJUSTMENT, or RETURN' })
  reference_type: StockReferenceType;

  @ApiPropertyOptional({
    description: 'Reference ID (e.g., purchase order ID, sale ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString({ message: 'Reference ID must be a string' })
  @IsUUID('4', { message: 'Reference ID must be a valid UUID' })
  reference_id?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the transaction',
    example: 'Received from supplier ABC',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @ApiProperty({
    description: 'ID of the user creating the transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Created by must be a string' })
  @IsNotEmpty({ message: 'Created by is required' })
  @IsUUID('4', { message: 'Created by must be a valid UUID' })
  created_by: string;
}