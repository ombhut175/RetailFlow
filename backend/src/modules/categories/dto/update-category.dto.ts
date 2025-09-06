import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  // All properties from CreateCategoryDto are now optional
  // This follows NestJS best practices for update DTOs
}