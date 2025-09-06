import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class SupplierResponseDto {
  @ApiProperty({
    description: 'Supplier unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Supplier name',
    example: 'Tech Supply Corp',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Contact person name',
    example: 'John Smith',
  })
  @Expose()
  contact_person?: string | null;

  @ApiPropertyOptional({
    description: 'Supplier email address',
    example: 'contact@techsupply.com',
  })
  @Expose()
  email?: string | null;

  @ApiPropertyOptional({
    description: 'Supplier phone number',
    example: '+1-555-0123',
  })
  @Expose()
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'Supplier address',
    example: '123 Business St, City, State 12345',
  })
  @Expose()
  address?: string | null;

  @ApiProperty({
    description: 'Whether the supplier is active',
    example: true,
  })
  @Expose()
  is_active: boolean;

  @ApiProperty({
    description: 'User who created the supplier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  created_by: string;

  @ApiProperty({
    description: 'Supplier creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  created_at: Date;

  @ApiPropertyOptional({
    description: 'User who last updated the supplier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  updated_by?: string | null;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
    example: '2024-01-16T14:20:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  updated_at?: Date | null;
}
