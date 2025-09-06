import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Electronic devices and accessories',
  })
  @Expose()
  description: string | null;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
  })
  @Expose()
  is_active: boolean;

  @ApiProperty({
    description: 'User ID who created this category',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  created_by: string;

  @ApiProperty({
    description: 'Category creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  @Expose()
  created_at: Date;

  @ApiPropertyOptional({
    description: 'User ID who last updated this category',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  updated_by: string | null;

  @ApiPropertyOptional({
    description: 'Category last update timestamp',
    example: '2024-01-15T14:30:00.000Z',
    format: 'date-time',
  })
  @Expose()
  updated_at: Date | null;
}

export class CategoryListResponseDto {
  @ApiProperty({
    description: 'List of categories',
    type: [CategoryResponseDto],
  })
  @Expose()
  data: CategoryResponseDto[];

  @ApiProperty({
    description: 'Total number of categories',
    example: 25,
  })
  @Expose()
  total: number;
}