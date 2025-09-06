import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from '../../core/database/repositories/categories.repository';
import { DatabaseModule } from '../../core/database/database.module';
import { SupabaseModule } from '../../core/supabase/supabase.module';

@Module({
  imports: [DatabaseModule, SupabaseModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CategoriesRepository,
  ],
  exports: [
    CategoriesService,
    CategoriesRepository,
  ],
})
export class CategoriesModule {}