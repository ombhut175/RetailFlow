import { PartialType } from '@nestjs/swagger';
import { CreateSupplierDto } from './create-supplier.dto';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  // All fields from CreateSupplierDto become optional
  // Additional update-specific fields can be added here if needed
}
