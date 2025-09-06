import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePurchaseOrderDto, CreatePurchaseOrderItemDto } from './create-purchase-order.dto';

export class UpdatePurchaseOrderItemDto extends PartialType(CreatePurchaseOrderItemDto) {
  // All fields from CreatePurchaseOrderItemDto become optional
}

export class UpdatePurchaseOrderDto extends PartialType(
  OmitType(CreatePurchaseOrderDto, ['items'])
) {
  // All fields from CreatePurchaseOrderDto become optional except items
  // Items are managed through separate endpoints
}
