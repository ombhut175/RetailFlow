import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { users } from '../schema/users';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';
import { MESSAGES } from '../../../common/constants/string-const';

export interface CreateUserDto {
  id?: string; // UUID id (optional, will be auto-generated if not provided)
  email: string;
  isEmailVerified?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  isEmailVerified?: boolean;
}

export interface UserEntity {
  id: string; // UUID
  email: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersRepository extends BaseRepository<UserEntity> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  //#region ==================== CRUD OPERATIONS ====================

  async create(userData: CreateUserDto): Promise<UserEntity> {
    const result = await this.db
      .insert(users)
      .values({
        id: userData.id, // Use provided UUID or let DB generate one
        email: userData.email,
        isEmailVerified: userData.isEmailVerified || false,
      })
      .returning();

    return result[0] as UserEntity;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.findOne(users, eq(users.id, id));
  }

  async findByIdOrThrow(id: string): Promise<UserEntity> {
    return super.findByIdOrThrow(users, id, MESSAGES.USER_NOT_FOUND);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne(users, eq(users.email, email));
  }

  async findByEmailOrThrow(email: string): Promise<UserEntity> {
    return this.findOneOrThrow(users, eq(users.email, email), MESSAGES.USER_NOT_FOUND);
  }

  async update(id: string, userData: UpdateUserDto): Promise<UserEntity> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (userData.email !== undefined) {
      updateData.email = userData.email;
    }

    if (userData.isEmailVerified !== undefined) {
      updateData.isEmailVerified = userData.isEmailVerified;
    }

    const result = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!result.length) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    return result[0] as UserEntity;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!result.length) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }
  }

  //#endregion

  //#region ==================== VERIFICATION OPERATIONS ====================

  async markEmailAsVerified(email: string): Promise<UserEntity> {
    const result = await this.db
      .update(users)
      .set({
        isEmailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email))
      .returning();

    if (!result.length) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    return result[0] as UserEntity;
  }

  async isEmailVerified(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user?.isEmailVerified || false;
  }

  //#endregion

  //#region ==================== UTILITY OPERATIONS ====================

  async emailExists(email: string): Promise<boolean> {
    return this.exists(users, eq(users.email, email));
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return this.db.select().from(users);
  }

  async getUsersCount(): Promise<number> {
    return this.count(users);
  }

  //#endregion
}