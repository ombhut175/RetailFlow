import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from '../../core/database/repositories/posts.repository';
import { DrizzleService } from '../../core/database/drizzle.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, DrizzleService],
})
export class PostsModule {}
