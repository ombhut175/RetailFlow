import { IsOptional, IsString, IsEnum, IsDateString, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export class PurchaseOrderFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by supplier ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Supplier ID must be a valid UUID' })
  supplier_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by purchase order status',
    enum: PurchaseOrderStatus,
    example: PurchaseOrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus, { message: 'Status must be a valid purchase order status' })
  status?: PurchaseOrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by order number (partial match)',
    example: 'PO-2024',
  })
  @IsOptional()
  @IsString({ message: 'Order number filter must be a string' })
  @MaxLength(50, { message: 'Order number filter cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  order_number?: string;

  @ApiPropertyOptional({
    description: 'Filter by order date from (inclusive)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Order date from must be a valid date string' })
  order_date_from?: string;

  @ApiPropertyOptional({
    description: 'Filter by order date to (inclusive)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Order date to must be a valid date string' })
  order_date_to?: string;

  @ApiPropertyOptional({
    description: 'Include soft deleted purchase orders (Admin only)',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  withDeleted?: boolean;
}
