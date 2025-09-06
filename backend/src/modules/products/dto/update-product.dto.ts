import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  // All properties from CreateProductDto are now optional
  // This follows NestJS best practices for update DTOs
}