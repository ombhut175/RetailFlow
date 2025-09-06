import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from '../../core/database/repositories/posts.repository';
import { DrizzleService } from '../../core/database/drizzle.service';
import { SupabaseModule } from '../../core/supabase/supabase.module';

@Module({
  imports: [SupabaseModule], // Required for AuthGuard dependency injection
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, DrizzleService],
})
export class PostsModule {}
