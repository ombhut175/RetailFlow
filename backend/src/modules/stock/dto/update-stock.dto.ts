import { 
  IsOptional, 
  IsNumber, 
  IsUUID, 
  Min, 
  IsInt,
  IsString,
  IsNotEmpty
} from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateStockDto {
  @ApiPropertyOptional({
    description: 'Available quantity in stock',
    example: 150,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Quantity available must be a number' })
  @IsInt({ message: 'Quantity available must be an integer' })
  @Min(0, { message: 'Quantity available cannot be negative' })
  @Type(() => Number)
  quantity_available?: number;

  @ApiPropertyOptional({
    description: 'Reserved quantity (for pending orders)',
    example: 20,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Quantity reserved must be a number' })
  @IsInt({ message: 'Quantity reserved must be an integer' })
  @Min(0, { message: 'Quantity reserved cannot be negative' })
  @Type(() => Number)
  quantity_reserved?: number;

  @ApiProperty({
    description: 'ID of the user updating the stock record',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Updated by must be a string' })
  @IsNotEmpty({ message: 'Updated by is required' })
  @IsUUID('4', { message: 'Updated by must be a valid UUID' })
  updated_by: string;
}