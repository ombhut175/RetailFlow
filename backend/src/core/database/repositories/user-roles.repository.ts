import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { userRoles, roleEnum } from '../schema/user-roles';
import { users } from '../schema/users';
import { eq, and, isNull } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';
import { MESSAGES } from '../../../common/constants/string-const';

export interface CreateUserRoleDto {
  user_id: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  permissions?: string[];
  assigned_by: string;
  created_by: string;
}

export interface UpdateUserRoleDto {
  role?: 'ADMIN' | 'MANAGER' | 'STAFF';
  permissions?: string[];
  is_active?: boolean;
  updated_by: string;
}

export interface UserRoleEntity {
  id: string;
  user_id: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  permissions: string[] | null;
  is_active: boolean;
  assigned_by: string;
  created_by: string;
  created_at: Date;
  updated_by: string | null;
  updated_at: Date | null;
  deleted_by: string | null;
  deleted_at: Date | null;
}

export interface UserWithRoleEntity {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  permissions: string[] | null;
  is_role_active: boolean;
}

@Injectable()
export class UserRolesRepository extends BaseRepository<UserRoleEntity> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  //#region ==================== ROLE MANAGEMENT ====================

  async assignRole(roleData: CreateUserRoleDto): Promise<UserRoleEntity> {
    this.logger.log(`Assigning role ${roleData.role} to user: ${roleData.user_id}`);
    
    try {
      const result = await this.db
        .insert(userRoles)
        .values({
          user_id: roleData.user_id,
          role: roleData.role,
          permissions: roleData.permissions || [],
          assigned_by: roleData.assigned_by,
          created_by: roleData.created_by,
        })
        .returning();

      this.logger.log(`Role assigned successfully: ${roleData.role} to user ${roleData.user_id}`);
      return result[0] as UserRoleEntity;
    } catch (error) {
      this.logger.error(`Failed to assign role: ${roleData.role} to user ${roleData.user_id}`, error.stack);
      throw error;
    }
  }

  async updateUserRole(userId: string, roleData: UpdateUserRoleDto): Promise<UserRoleEntity> {
    this.logger.log(`Updating role for user: ${userId}`);
    
    try {
      const updateData: any = {
        updated_by: roleData.updated_by,
        updated_at: new Date(),
      };

      if (roleData.role !== undefined) {
        updateData.role = roleData.role;
      }

      if (roleData.permissions !== undefined) {
        updateData.permissions = roleData.permissions;
      }

      if (roleData.is_active !== undefined) {
        updateData.is_active = roleData.is_active;
      }

      const result = await this.db
        .update(userRoles)
        .set(updateData)
        .where(and(
          eq(userRoles.user_id, userId),
          isNull(userRoles.deleted_at)
        ))
        .returning();

      if (!result.length) {
        this.logger.warn(`User role not found for update: ${userId}`);
        throw new Error('User role not found');
      }

      this.logger.log(`User role updated successfully: ${userId}`);
      return result[0] as UserRoleEntity;
    } catch (error) {
      this.logger.error(`Failed to update user role: ${userId}`, error.stack);
      throw error;
    }
  }

  async removeUserRole(userId: string, deletedBy: string): Promise<void> {
    this.logger.log(`Removing role for user: ${userId}`);
    
    try {
      const result = await this.db
        .update(userRoles)
        .set({
          is_active: false,
          deleted_by: deletedBy,
          deleted_at: new Date(),
        })
        .where(and(
          eq(userRoles.user_id, userId),
          isNull(userRoles.deleted_at)
        ))
        .returning();

      if (!result.length) {
        this.logger.warn(`User role not found for deletion: ${userId}`);
        throw new Error('User role not found');
      }
      
      this.logger.log(`User role removed successfully: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to remove user role: ${userId}`, error.stack);
      throw error;
    }
  }

  //#endregion

  //#region ==================== QUERY OPERATIONS ====================

  async findUserRole(userId: string): Promise<UserRoleEntity | null> {
    this.logger.log(`Finding role for user: ${userId}`);
    
    try {
      const result = await this.db
        .select()
        .from(userRoles)
        .where(and(
          eq(userRoles.user_id, userId),
          eq(userRoles.is_active, true),
          isNull(userRoles.deleted_at)
        ))
        .limit(1);

      if (result.length > 0) {
        this.logger.log(`Role found for user ${userId}: ${result[0].role}`);
        return result[0] as UserRoleEntity;
      } else {
        this.logger.log(`No active role found for user: ${userId}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to find user role: ${userId}`, error.stack);
      throw error;
    }
  }

  async findUserWithRole(userId: string): Promise<UserWithRoleEntity | null> {
    this.logger.log(`Finding user with role: ${userId}`);
    
    try {
      const result = await this.db
        .select({
          id: users.id,
          email: users.email,
          role: userRoles.role,
          permissions: userRoles.permissions,
          is_role_active: userRoles.is_active,
        })
        .from(users)
        .leftJoin(
          userRoles,
          and(
            eq(users.id, userRoles.user_id),
            eq(userRoles.is_active, true),
            isNull(userRoles.deleted_at)
          )
        )
        .where(eq(users.id, userId))
        .limit(1);

      if (result.length > 0) {
        const user = result[0];
        // If user has no role, they have no permissions
        if (!user.role) {
          this.logger.log(`User found without role: ${userId}`);
          return null;
        }

        this.logger.log(`User with role found: ${userId} (${user.role})`);
        return user as UserWithRoleEntity;
      } else {
        this.logger.log(`User not found: ${userId}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to find user with role: ${userId}`, error.stack);
      throw error;
    }
  }

  async getUsersByRole(role: 'ADMIN' | 'MANAGER' | 'STAFF'): Promise<UserWithRoleEntity[]> {
    this.logger.log(`Finding users with role: ${role}`);
    
    try {
      const result = await this.db
        .select({
          id: users.id,
          email: users.email,
          role: userRoles.role,
          permissions: userRoles.permissions,
          is_role_active: userRoles.is_active,
        })
        .from(userRoles)
        .innerJoin(users, eq(userRoles.user_id, users.id))
        .where(and(
          eq(userRoles.role, role),
          eq(userRoles.is_active, true),
          isNull(userRoles.deleted_at)
        ));

      this.logger.log(`Found ${result.length} users with role: ${role}`);
      return result as UserWithRoleEntity[];
    } catch (error) {
      this.logger.error(`Failed to find users by role: ${role}`, error.stack);
      throw error;
    }
  }

  //#endregion

  //#region ==================== PERMISSION OPERATIONS ====================

  async userHasPermission(userId: string, permission: string): Promise<boolean> {
    this.logger.log(`Checking permission '${permission}' for user: ${userId}`);
    
    try {
      const userRole = await this.findUserRole(userId);
      
      if (!userRole) {
        this.logger.log(`User ${userId} has no role, permission denied`);
        return false;
      }

      const hasPermission = userRole.permissions?.includes(permission) || false;
      this.logger.log(`Permission '${permission}' for user ${userId}: ${hasPermission}`);
      return hasPermission;
    } catch (error) {
      this.logger.error(`Failed to check permission for user: ${userId}`, error.stack);
      return false;
    }
  }

  async userHasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    this.logger.log(`Checking any of permissions [${permissions.join(', ')}] for user: ${userId}`);
    
    try {
      const userRole = await this.findUserRole(userId);
      
      if (!userRole) {
        this.logger.log(`User ${userId} has no role, permission denied`);
        return false;
      }

      const userPermissions = userRole.permissions || [];
      const hasAnyPermission = permissions.some(permission => 
        userPermissions.includes(permission)
      );

      this.logger.log(`Any permission check for user ${userId}: ${hasAnyPermission}`);
      return hasAnyPermission;
    } catch (error) {
      this.logger.error(`Failed to check any permission for user: ${userId}`, error.stack);
      return false;
    }
  }

  async userHasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    this.logger.log(`Checking all permissions [${permissions.join(', ')}] for user: ${userId}`);
    
    try {
      const userRole = await this.findUserRole(userId);
      
      if (!userRole) {
        this.logger.log(`User ${userId} has no role, permission denied`);
        return false;
      }

      const userPermissions = userRole.permissions || [];
      const hasAllPermissions = permissions.every(permission => 
        userPermissions.includes(permission)
      );

      this.logger.log(`All permissions check for user ${userId}: ${hasAllPermissions}`);
      return hasAllPermissions;
    } catch (error) {
      this.logger.error(`Failed to check all permissions for user: ${userId}`, error.stack);
      return false;
    }
  }

  //#endregion

  //#region ==================== UTILITY OPERATIONS ====================

  /**
   * Check if user has role equal or higher in hierarchy
   * Hierarchy: ADMIN > MANAGER > STAFF
   */
  async userHasMinimumRole(userId: string, minimumRole: 'ADMIN' | 'MANAGER' | 'STAFF'): Promise<boolean> {
    this.logger.log(`Checking minimum role '${minimumRole}' for user: ${userId}`);
    
    try {
      const userRole = await this.findUserRole(userId);
      
      if (!userRole) {
        this.logger.log(`User ${userId} has no role, minimum role check failed`);
        return false;
      }

      const roleHierarchy: Record<string, number> = {
        'STAFF': 1,
        'MANAGER': 2,
        'ADMIN': 3,
      };

      const userLevel = roleHierarchy[userRole.role];
      const requiredLevel = roleHierarchy[minimumRole];

      const hasMinimumRole = userLevel >= requiredLevel;
      this.logger.log(`Minimum role '${minimumRole}' check for user ${userId}: ${hasMinimumRole} (user role: ${userRole.role})`);
      return hasMinimumRole;
    } catch (error) {
      this.logger.error(`Failed to check minimum role for user: ${userId}`, error.stack);
      return false;
    }
  }

  async isAdmin(userId: string): Promise<boolean> {
    return this.userHasMinimumRole(userId, 'ADMIN');
  }

  async isManagerOrAbove(userId: string): Promise<boolean> {
    return this.userHasMinimumRole(userId, 'MANAGER');
  }

  async isStaffOrAbove(userId: string): Promise<boolean> {
    return this.userHasMinimumRole(userId, 'STAFF');
  }

  //#endregion
}