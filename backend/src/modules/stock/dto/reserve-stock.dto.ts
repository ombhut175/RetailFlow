import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsUUID, 
  IsInt,
  Min,
  MaxLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class ReserveStockDto {
  @ApiProperty({
    description: 'Quantity to reserve',
    example: 10,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Reason for the reservation',
    example: 'Reserved for order #12345',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @ApiProperty({
    description: 'ID of the user making the reservation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Updated by must be a string' })
  @IsNotEmpty({ message: 'Updated by is required' })
  @IsUUID('4', { message: 'Updated by must be a valid UUID' })
  updated_by: string;
}

export class ReleaseStockDto {
  @ApiProperty({
    description: 'Quantity to release from reservation',
    example: 5,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Reason for releasing the reservation',
    example: 'Order cancelled',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @ApiProperty({
    description: 'ID of the user releasing the reservation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Updated by must be a string' })
  @IsNotEmpty({ message: 'Updated by is required' })
  @IsUUID('4', { message: 'Updated by must be a valid UUID' })
  updated_by: string;
}