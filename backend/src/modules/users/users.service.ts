import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { UsersRepository } from '../../core/database/repositories/users.repository';
import { UserRolesRepository } from '../../core/database/repositories/user-roles.repository';
import { CreateUserDto, UpdateUserDto, QueryUsersDto, UserResponseDto, UserListResponseDto } from './dto';
import { users } from '../../core/database/schema/users';
import { userRoles } from '../../core/database/schema/user-roles';
import { eq, and, isNull, ilike, desc, asc, count } from 'drizzle-orm';
import { DrizzleService } from '../../core/database/drizzle.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private usersRepository: UsersRepository,
    private userRolesRepository: UserRolesRepository,
    private drizzleService: DrizzleService,
  ) {}

  async createUser(createUserDto: CreateUserDto, createdBy: string): Promise<UserResponseDto> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);

    // Check if email already exists
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      // Create user
      const user = await this.usersRepository.create({
        email: createUserDto.email,
        isEmailVerified: createUserDto.isEmailVerified || false,
      });

      // Assign role
      const userRole = await this.userRolesRepository.assignRole({
        user_id: user.id,
        role: createUserDto.role,
        permissions: createUserDto.permissions || [],
        assigned_by: createdBy,
        created_by: createdBy,
      });

      this.logger.log(`User created successfully: ${user.email} with role: ${createUserDto.role}`);

      return this.formatUserResponse(user, userRole);
    } catch (error) {
      this.logger.error(`Failed to create user: ${createUserDto.email}`, error.stack);
      throw error;
    }
  }

  async getAllUsers(queryDto: QueryUsersDto): Promise<UserListResponseDto> {
    this.logger.log(`Fetching users with filters: ${JSON.stringify(queryDto)}`);

    const { page = 1, limit = 10, role, email, isEmailVerified, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;
    const offset = (page - 1) * limit;

    try {
      const db = this.drizzleService.getDatabase();

      // Build where conditions
      const whereConditions = [];
      
      if (email) {
        whereConditions.push(ilike(users.email, `%${email}%`));
      }
      
      if (isEmailVerified !== undefined) {
        whereConditions.push(eq(users.isEmailVerified, isEmailVerified));
      }

      if (role) {
        whereConditions.push(eq(userRoles.role, role));
        whereConditions.push(eq(userRoles.is_active, true));
        whereConditions.push(isNull(userRoles.deleted_at));
      }

      // Build sort condition
      let orderBy;
      const sortDirection = sortOrder === 'asc' ? asc : desc;
      
      switch (sortBy) {
        case 'email':
          orderBy = sortDirection(users.email);
          break;
        case 'role':
          orderBy = sortDirection(userRoles.role);
          break;
        case 'createdAt':
        default:
          orderBy = sortDirection(users.createdAt);
          break;
      }

      // Get users with roles
      const usersQuery = db
        .select({
          id: users.id,
          email: users.email,
          isEmailVerified: users.isEmailVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          roleId: userRoles.id,
          role: userRoles.role,
          permissions: userRoles.permissions,
          is_role_active: userRoles.is_active,
          assigned_by: userRoles.assigned_by,
          role_created_at: userRoles.created_at,
          role_updated_at: userRoles.updated_at,
        })
        .from(users)
        .leftJoin(
          userRoles,
          and(
            eq(users.id, userRoles.user_id),
            eq(userRoles.is_active, true),
            isNull(userRoles.deleted_at)
          )
        );

      if (whereConditions.length > 0) {
        usersQuery.where(and(...whereConditions));
      }

      const usersList = await usersQuery
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      // Get total count
      const countQuery = db
        .select({ count: count() })
        .from(users)
        .leftJoin(
          userRoles,
          and(
            eq(users.id, userRoles.user_id),
            eq(userRoles.is_active, true),
            isNull(userRoles.deleted_at)
          )
        );

      if (whereConditions.length > 0) {
        countQuery.where(and(...whereConditions));
      }

      const [{ count: totalCount }] = await countQuery;

      const formattedUsers = usersList.map((user: any) => ({
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        role: user.role ? {
          id: user.roleId,
          role: user.role,
          permissions: user.permissions || [],
          is_active: user.is_role_active,
          assigned_by: user.assigned_by,
          created_at: user.role_created_at?.toISOString(),
          updated_at: user.role_updated_at?.toISOString() || null,
        } : null,
      }));

      const totalPages = Math.ceil(totalCount / limit);

      this.logger.log(`Retrieved ${usersList.length} users (page ${page}/${totalPages})`);

      return {
        users: formattedUsers,
        total: totalCount,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Failed to fetch users', error.stack);
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    this.logger.log(`Fetching user by ID: ${id}`);

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userRole = await this.userRolesRepository.findUserRole(id);

    return this.formatUserResponse(user, userRole);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, updatedBy: string): Promise<UserResponseDto> {
    this.logger.log(`Updating user: ${id}`);

    // Check if user exists
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.usersRepository.findByEmail(updateUserDto.email);
      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    try {
      // Update user basic info
      const userUpdateData: any = {};
      if (updateUserDto.email !== undefined) {
        userUpdateData.email = updateUserDto.email;
      }
      if (updateUserDto.isEmailVerified !== undefined) {
        userUpdateData.isEmailVerified = updateUserDto.isEmailVerified;
      }

      let updatedUser = existingUser;
      if (Object.keys(userUpdateData).length > 0) {
        updatedUser = await this.usersRepository.update(id, userUpdateData);
      }

      // Update role if provided
      let userRole = await this.userRolesRepository.findUserRole(id);
      
      if (updateUserDto.role !== undefined || updateUserDto.permissions !== undefined || updateUserDto.isRoleActive !== undefined) {
        if (!userRole) {
          // Create new role if user doesn't have one
          if (updateUserDto.role) {
            userRole = await this.userRolesRepository.assignRole({
              user_id: id,
              role: updateUserDto.role,
              permissions: updateUserDto.permissions || [],
              assigned_by: updatedBy,
              created_by: updatedBy,
            });
          }
        } else {
          // Update existing role
          const roleUpdateData: any = {
            updated_by: updatedBy,
          };

          if (updateUserDto.role !== undefined) {
            roleUpdateData.role = updateUserDto.role;
          }
          if (updateUserDto.permissions !== undefined) {
            roleUpdateData.permissions = updateUserDto.permissions;
          }
          if (updateUserDto.isRoleActive !== undefined) {
            roleUpdateData.is_active = updateUserDto.isRoleActive;
          }

          userRole = await this.userRolesRepository.updateUserRole(id, roleUpdateData);
        }
      }

      this.logger.log(`User updated successfully: ${id}`);

      return this.formatUserResponse(updatedUser, userRole);
    } catch (error) {
      this.logger.error(`Failed to update user: ${id}`, error.stack);
      throw error;
    }
  }

  async deleteUser(id: string, deletedBy: string): Promise<void> {
    this.logger.log(`Deleting user: ${id}`);

    // Check if user exists
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Prevent admin from deleting themselves
    if (id === deletedBy) {
      throw new BadRequestException('You cannot delete your own account');
    }

    try {
      // Soft delete user role first
      const userRole = await this.userRolesRepository.findUserRole(id);
      if (userRole) {
        await this.userRolesRepository.removeUserRole(id, deletedBy);
      }

      // Delete user
      await this.usersRepository.delete(id);

      this.logger.log(`User deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete user: ${id}`, error.stack);
      throw error;
    }
  }

  async getUsersByRole(role: 'ADMIN' | 'MANAGER' | 'STAFF'): Promise<UserResponseDto[]> {
    this.logger.log(`Fetching users with role: ${role}`);

    try {
      const usersWithRole = await this.userRolesRepository.getUsersByRole(role);
      
      const userResponses = await Promise.all(
        usersWithRole.map(async (userWithRole) => {
          const user = await this.usersRepository.findById(userWithRole.id);
          const userRole = await this.userRolesRepository.findUserRole(userWithRole.id);
          return this.formatUserResponse(user!, userRole);
        })
      );

      this.logger.log(`Retrieved ${userResponses.length} users with role: ${role}`);
      return userResponses;
    } catch (error) {
      this.logger.error(`Failed to fetch users by role: ${role}`, error.stack);
      throw error;
    }
  }

  private formatUserResponse(user: any, userRole: any = null): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      role: userRole ? {
        id: userRole.id,
        role: userRole.role,
        permissions: userRole.permissions || [],
        is_active: userRole.is_active,
        assigned_by: userRole.assigned_by,
        created_at: userRole.created_at.toISOString(),
        updated_at: userRole.updated_at?.toISOString() || null,
      } : null,
    };
  }
}