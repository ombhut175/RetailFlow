import { IsOptional, IsString, IsBoolean, IsEmail, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class SupplierFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by supplier name (partial match)',
    example: 'Tech',
  })
  @IsOptional()
  @IsString({ message: 'Name filter must be a string' })
  @MaxLength(100, { message: 'Name filter cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by email address (partial match)',
    example: 'contact@',
  })
  @IsOptional()
  @IsString({ message: 'Email filter must be a string' })
  @MaxLength(200, { message: 'Email filter cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by phone number (partial match)',
    example: '555',
  })
  @IsOptional()
  @IsString({ message: 'Phone filter must be a string' })
  @MaxLength(50, { message: 'Phone filter cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active filter must be a boolean' })
  @Type(() => Boolean)
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Include deleted suppliers',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'withDeleted must be a boolean' })
  @Type(() => Boolean)
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  withDeleted?: boolean;
}
