import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PurchaseOrderResponseDto } from './purchase-order-response.dto';

export class PurchaseOrderListResponseDto {
  @ApiProperty({
    description: 'Array of purchase orders',
    type: [PurchaseOrderResponseDto],
  })
  @Expose()
  data: PurchaseOrderResponseDto[];

  @ApiProperty({
    description: 'Total number of purchase orders',
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
    description: 'Number of purchase orders per page',
    example: 10,
  })
  @Expose()
  limit: number;
}
