import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './core/supabase/supabase.module';
import { DatabaseModule } from './core/database/database.module';
import { AiModule as CoreAiModule } from './core/ai/ai.module';
import { AiModule } from './modules/ai/ai.module';
import { TestModule } from './modules/test/test.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { StockModule } from './modules/stock/stock.module';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ScheduleModule.forRoot(),
    SupabaseModule,
    DatabaseModule,
    CoreAiModule,
    AiModule,
    TestModule,
    AuthModule,
    HealthCheckModule,
    CategoriesModule,
    ProductsModule,
    UsersModule,
    SuppliersModule,
    PurchaseOrdersModule,
    StockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
