import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { posts } from '../schema/posts';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';

export interface CreatePostDto {
  title: string;
  body: string;
}

export interface UpdatePostDto {
  title?: string;
  body?: string;
}

export interface PostEntity {
  id: string;
  title: string;
  body: string;
  created_by: string;
  created_at: Date;
  updated_by?: string;
  updated_at?: Date;
  deleted_by?: string;
  deleted_at?: Date;
}

@Injectable()
export class PostsRepository extends BaseRepository<PostEntity> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  async create(postData: CreatePostDto, actorId: string): Promise<PostEntity> {
    this.logger.log('Creating post', { title: postData.title, actorId });

    const result = await this.db
      .insert(posts)
      .values({
        title: postData.title,
        body: postData.body,
        created_by: actorId,
      })
      .returning();

    return result[0] as PostEntity;
  }

  async findById(id: string, includeDeleted = false): Promise<PostEntity | null> {
    const condition = includeDeleted ? eq((posts as any).id, id) : (eq((posts as any).id, id) as any).and((posts as any).deleted_at.isNull());
    const result = await this.findOne(posts, condition);
    return result;
  }

  async findAll(includeDeleted = false): Promise<PostEntity[]> {
    let query = this.db.select().from(posts);
    if (!includeDeleted) {
      query = (query as any).where((posts as any).deleted_at.isNull());
    }
    const result = await query;
    return result as PostEntity[];
  }

  async update(id: string, updateData: UpdatePostDto, actorId: string): Promise<PostEntity> {
    const result = await this.db
      .update(posts)
      .set({
        ...updateData,
        updated_by: actorId,
        updated_at: new Date(),
      })
      .where(eq((posts as any).id, id))
      .returning();

    if (!result.length) throw new Error('Post not found');
    return result[0] as PostEntity;
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    await this.db
      .update(posts)
      .set({ deleted_by: actorId, deleted_at: new Date() })
      .where(eq((posts as any).id, id));
  }

  async hardDelete(id: string): Promise<void> {
    await this.db.delete(posts).where(eq((posts as any).id, id));
  }
}
