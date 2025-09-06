import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Supplier name',
    example: 'Tech Supply Corp',
    maxLength: 100,
  })
  @IsString({ message: 'Supplier name must be a string' })
  @IsNotEmpty({ message: 'Supplier name is required' })
  @MaxLength(100, { message: 'Supplier name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    description: 'Contact person name',
    example: 'John Smith',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Contact person must be a string' })
  @MaxLength(100, { message: 'Contact person cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  contact_person?: string;

  @ApiPropertyOptional({
    description: 'Supplier email address',
    example: 'contact@techsupply.com',
    maxLength: 200,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(200, { message: 'Email cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @ApiPropertyOptional({
    description: 'Supplier phone number',
    example: '+1-555-0123',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @MaxLength(50, { message: 'Phone number cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiPropertyOptional({
    description: 'Supplier address',
    example: '123 Business St, City, State 12345',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(500, { message: 'Address cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  address?: string;

  @ApiPropertyOptional({
    description: 'Whether the supplier is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean value' })
  is_active?: boolean;
}
