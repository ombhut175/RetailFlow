import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { SuppliersRepository } from '../../core/database/repositories/suppliers.repository';
import { DatabaseModule } from '../../core/database/database.module';
import { SupabaseModule } from '../../core/supabase/supabase.module';

@Module({
  imports: [DatabaseModule, SupabaseModule],
  controllers: [SuppliersController],
  providers: [
    SuppliersService,
    SuppliersRepository,
  ],
  exports: [
    SuppliersService,
    SuppliersRepository,
  ],
})
export class SuppliersModule {}
