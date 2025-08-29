import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle.service';
import { NotFoundException } from '@nestjs/common';
import { MESSAGES } from '../../../common/constants/string-const';
import { eq, count } from 'drizzle-orm';

@Injectable()
export abstract class BaseRepository<T> {
  constructor(protected readonly drizzleService: DrizzleService) {}

  protected get db() {
    return this.drizzleService.getDatabase();
  }

  protected get pool() {
    return this.drizzleService.getPool();
  }

  /**
   * Find a record by ID or throw NotFoundException
   */
  protected async findByIdOrThrow(
    table: any,
    id: string | number,
    errorMessage = MESSAGES.NOT_FOUND,
  ): Promise<T> {
    const result = await this.db.select().from(table).where(eq((table as any).id, id)).limit(1);
    
    if (!result.length) {
      throw new NotFoundException(errorMessage);
    }
    
    return result[0] as T;
  }

  /**
   * Find a record by custom condition or throw NotFoundException
   */
  protected async findOneOrThrow(
    table: any,
    condition: any,
    errorMessage = MESSAGES.NOT_FOUND,
  ): Promise<T> {
    const result = await this.db.select().from(table).where(condition).limit(1);
    
    if (!result.length) {
      throw new NotFoundException(errorMessage);
    }
    
    return result[0] as T;
  }

  /**
   * Find a record by custom condition (returns null if not found)
   */
  protected async findOne(
    table: any,
    condition: any,
  ): Promise<T | null> {
    const result = await this.db.select().from(table).where(condition).limit(1);
    return result.length ? (result[0] as T) : null;
  }

  /**
   * Count records with optional where condition
   */
  protected async count(
    table: any,
    where?: any,
  ): Promise<number> {
    let query = this.db.select({ count: count() }).from(table);
    
    if (where) {
      query = (query as any).where(where);
    }
    
    const result = await query;
    return result[0]?.count || 0;
  }

  /**
   * Check if a record exists
   */
  protected async exists(
    table: any,
    condition: any,
  ): Promise<boolean> {
    const result = await this.db.select({ count: count() }).from(table).where(condition).limit(1);
    return (result[0]?.count || 0) > 0;
  }

  /**
   * Execute raw SQL query
   */
  protected async executeRaw<T = any>(query: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(query, params);
    return result.rows;
  }
}
