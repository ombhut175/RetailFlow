import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from '../../core/database/repositories/products.repository';
import { CategoriesRepository } from '../../core/database/repositories/categories.repository';
import { DatabaseModule } from '../../core/database/database.module';
import { CategoriesModule } from '../categories/categories.module';
import { SupabaseModule } from '../../core/supabase/supabase.module';

@Module({
  imports: [
    DatabaseModule,
    CategoriesModule, // Import CategoriesModule for category validation
    SupabaseModule, // Required for AuthGuard dependency injection
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    CategoriesRepository, // Needed for category validation in ProductsService
  ],
  exports: [
    ProductsService,
    ProductsRepository,
  ],
})
export class ProductsModule {}