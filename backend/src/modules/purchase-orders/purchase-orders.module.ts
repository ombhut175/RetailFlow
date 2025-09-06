import { Module } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { DatabaseModule } from '../../core/database/database.module';
import { SupabaseModule } from '../../core/supabase/supabase.module';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [DatabaseModule, SupabaseModule, SuppliersModule],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
