import { Controller, Post, Body, UseGuards, Logger, Param, Get, Query, Put, Delete } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard, CurrentUser } from '../../common';
import { successResponse } from '../../common/helpers/api-response.helper';

@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@CurrentUser('id') actorId: string, @Body() body: any) {
    const post = await this.postsService.createPost(body, actorId);
    return successResponse(post, 'Post created');
  }

  @Get()
  async list(@Query('withDeleted') withDeleted?: string) {
    const includeDeleted = withDeleted === 'true';
    const posts = await this.postsService.listPosts(includeDeleted);
    return successResponse(posts, 'Posts listed');
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const post = await this.postsService.getPost(id);
    return successResponse(post, 'Post retrieved');
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @CurrentUser('id') actorId: string, @Body() body: any) {
    const updated = await this.postsService.updatePost(id, body, actorId);
    return successResponse(updated, 'Post updated');
  }

  // Soft delete
  @UseGuards(AuthGuard)
  @Delete(':id')
  async softDelete(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    await this.postsService.softDeletePost(id, actorId);
    return successResponse(null, 'Post soft-deleted');
  }

  // Hard delete / purge
  @UseGuards(AuthGuard)
  @Delete(':id/purge')
  async hardDelete(@Param('id') id: string) {
    await this.postsService.hardDeletePost(id);
    return successResponse(null, 'Post permanently deleted');
  }
}
