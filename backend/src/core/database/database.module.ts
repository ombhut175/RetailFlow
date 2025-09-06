import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';
import { 
  UsersRepository, 
  UserRolesRepository, 
  HealthCheckingRepository,
  CategoriesRepository,
  ProductsRepository,
  SuppliersRepository,
  PurchaseOrdersRepository,
  StockRepository,
  StockTransactionsRepository
} from './repositories';

@Module({
  imports: [ConfigModule],
  providers: [
    DrizzleService,
    UsersRepository,
    UserRolesRepository,
    HealthCheckingRepository,
    CategoriesRepository,
    ProductsRepository,
    SuppliersRepository,
    PurchaseOrdersRepository,
    StockRepository,
    StockTransactionsRepository,
  ],
  exports: [
    DrizzleService,
    UsersRepository,
    UserRolesRepository,
    HealthCheckingRepository,
    CategoriesRepository,
    ProductsRepository,
    SuppliersRepository,
    PurchaseOrdersRepository,
    StockRepository,
    StockTransactionsRepository,
  ],
})
export class DatabaseModule {}
