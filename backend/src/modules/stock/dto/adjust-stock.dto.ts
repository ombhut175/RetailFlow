import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsUUID, 
  IsInt,
  MaxLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class AdjustStockDto {
  @ApiProperty({
    description: 'Quantity change (positive to increase, negative to decrease)',
    example: -5,
  })
  @IsNumber({}, { message: 'Quantity change must be a number' })
  @IsInt({ message: 'Quantity change must be an integer' })
  @Type(() => Number)
  quantity_change: number;

  @ApiPropertyOptional({
    description: 'Reason for the stock adjustment',
    example: 'Damaged items removed from inventory',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @ApiProperty({
    description: 'ID of the user making the adjustment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Updated by must be a string' })
  @IsNotEmpty({ message: 'Updated by is required' })
  @IsUUID('4', { message: 'Updated by must be a valid UUID' })
  updated_by: string;
}