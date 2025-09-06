import { Injectable, Logger } from '@nestjs/common';
import { PostsRepository, CreatePostDto, UpdatePostDto } from '../../core/database/repositories/posts.repository';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(private readonly postsRepo: PostsRepository) {}

  async createPost(createDto: CreatePostDto, actorId: string) {
    this.logger.log('Service createPost', { actorId, title: createDto.title });
    return this.postsRepo.create(createDto, actorId);
  }

  async updatePost(id: string, updateDto: UpdatePostDto, actorId: string) {
    this.logger.log('Service updatePost', { id, actorId });
    return this.postsRepo.update(id, updateDto, actorId);
  }

  async softDeletePost(id: string, actorId: string) {
    this.logger.log('Service softDeletePost', { id, actorId });
    return this.postsRepo.softDelete(id, actorId);
  }

  async hardDeletePost(id: string) {
    this.logger.log('Service hardDeletePost', { id });
    return this.postsRepo.hardDelete(id);
  }

  async getPost(id: string, includeDeleted = false) {
    return this.postsRepo.findById(id, includeDeleted);
  }

  async listPosts(includeDeleted = false) {
    return this.postsRepo.findAll(includeDeleted);
  }
}
