import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';
import { UsersRepository } from './repositories';

@Module({
  imports: [ConfigModule],
  providers: [
    DrizzleService,
    UsersRepository,
  ],
  exports: [
    DrizzleService,
    UsersRepository,
  ],
})
export class DatabaseModule {}
