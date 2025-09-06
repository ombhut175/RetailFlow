import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SupplierResponseDto } from './supplier-response.dto';

export class SupplierListResponseDto {
  @ApiProperty({
    description: 'Array of suppliers',
    type: [SupplierResponseDto],
  })
  @Expose()
  data: SupplierResponseDto[];

  @ApiProperty({
    description: 'Total number of suppliers',
    example: 25,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  @Expose()
  page: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  @Expose()
  totalPages: number;

  @ApiProperty({
    description: 'Number of suppliers per page',
    example: 10,
  })
  @Expose()
  limit: number;
}
