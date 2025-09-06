import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class PurchaseOrderItemResponseDto {
  @ApiProperty({
    description: 'Purchase order item unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Purchase order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  purchase_order_id: string;

  @ApiProperty({
    description: 'Product information',
  })
  @Expose()
  product: {
    id: string;
    name: string;
    sku: string;
    unit_price: string;
  };

  @ApiProperty({
    description: 'Quantity ordered',
    example: 100,
  })
  @Expose()
  quantity_ordered: number;

  @ApiProperty({
    description: 'Quantity received',
    example: 50,
  })
  @Expose()
  quantity_received: number;

  @ApiProperty({
    description: 'Unit cost',
    example: '29.99',
  })
  @Expose()
  unit_cost: string;

  @ApiProperty({
    description: 'Total cost for this line item',
    example: '2999.00',
  })
  @Expose()
  total_cost: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  created_at: Date;
}

export class PurchaseOrderResponseDto {
  @ApiProperty({
    description: 'Purchase order unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Supplier information',
  })
  @Expose()
  supplier: {
    id: string;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
  };

  @ApiProperty({
    description: 'Purchase order number',
    example: 'PO-2024-001',
  })
  @Expose()
  order_number: string;

  @ApiProperty({
    description: 'Purchase order status',
    example: 'PENDING',
  })
  @Expose()
  status: string;

  @ApiPropertyOptional({
    description: 'Order date',
    example: '2024-01-15',
  })
  @Expose()
  order_date?: string | null;

  @ApiPropertyOptional({
    description: 'Expected delivery date',
    example: '2024-01-25',
  })
  @Expose()
  expected_delivery_date?: string | null;

  @ApiPropertyOptional({
    description: 'Total amount',
    example: '2999.00',
  })
  @Expose()
  total_amount?: string | null;

  @ApiPropertyOptional({
    description: 'Notes',
    example: 'Urgent order - needed for production',
  })
  @Expose()
  notes?: string | null;

  @ApiPropertyOptional({
    description: 'Purchase order items',
    type: [PurchaseOrderItemResponseDto],
  })
  @Expose()
  items?: PurchaseOrderItemResponseDto[];

  @ApiProperty({
    description: 'User who created the purchase order',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  created_by: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  created_at: Date;

  @ApiPropertyOptional({
    description: 'User who last updated the purchase order',
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
