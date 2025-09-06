import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsUUID, 
  Min, 
  IsInt
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateStockDto {
  @ApiProperty({
    description: 'Product ID for which stock is being created',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Product ID must be a string' })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  product_id: string;

  @ApiProperty({
    description: 'Available quantity in stock',
    example: 100,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Quantity available must be a number' })
  @IsInt({ message: 'Quantity available must be an integer' })
  @Min(0, { message: 'Quantity available cannot be negative' })
  @Type(() => Number)
  quantity_available: number;

  @ApiPropertyOptional({
    description: 'Reserved quantity (for pending orders)',
    example: 10,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Quantity reserved must be a number' })
  @IsInt({ message: 'Quantity reserved must be an integer' })
  @Min(0, { message: 'Quantity reserved cannot be negative' })
  @Type(() => Number)
  quantity_reserved?: number;

  @ApiProperty({
    description: 'ID of the user creating the stock record',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Created by must be a string' })
  @IsNotEmpty({ message: 'Created by is required' })
  @IsUUID('4', { message: 'Created by must be a valid UUID' })
  created_by: string;
}