import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUsersDto, UserResponseDto, UserListResponseDto } from './dto';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUserWithRole } from '../../common/decorators/current-user-with-role.decorator';
import { successResponse } from '../../common/helpers/api-response.helper';
import { StandardApiResponseDto } from '../auth/dto/auth-responses.dto';

@ApiTags('Admin - User Management')
@Controller('admin/users')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Create New User',
    description: 'Create a new user with role assignment. Only accessible by admin users.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: StandardApiResponseDto<UserResponseDto>,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Admin privileges required',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUserWithRole() currentUser: any,
  ) {
    this.logger.log(`Admin ${currentUser.email} creating user: ${createUserDto.email}`);
    
    const user = await this.usersService.createUser(createUserDto, currentUser.id);
    
    return successResponse(user, 'User created successfully');
  }

  @ApiOperation({
    summary: 'Get All Users',
    description: 'Retrieve all users with pagination, filtering, and sorting options. Only accessible by admin users.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of users per page',
    example: 10,
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by user role',
    enum: ['ADMIN', 'MANAGER', 'STAFF'],
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Search by email (partial match)',
    example: 'john',
  })
  @ApiQuery({
    name: 'isEmailVerified',
    required: false,
    description: 'Filter by email verification status',
    type: Boolean,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort field',
    enum: ['email', 'createdAt', 'role'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: StandardApiResponseDto<UserListResponseDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Admin privileges required',
  })
  @Get()
  async getAllUsers(
    @Query() queryDto: QueryUsersDto,
    @CurrentUserWithRole() currentUser: any,
  ) {
    this.logger.log(`Admin ${currentUser.email} fetching users with filters: ${JSON.stringify(queryDto)}`);
    
    const users = await this.usersService.getAllUsers(queryDto);
    
    return successResponse(users, 'Users retrieved successfully');
  }

  @ApiOperation({
    summary: 'Get User by ID',
    description: 'Retrieve a specific user by their ID. Only accessible by admin users.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: StandardApiResponseDto<UserResponseDto>,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Admin privileges required',
  })
  @Get(':id')
  async getUserById(
    @Param('id') id: string,
    @CurrentUserWithRole() currentUser: any,
  ) {
    this.logger.log(`Admin ${currentUser.email} fetching user: ${id}`);
    
    const user = await this.usersService.getUserById(id);
    
    return successResponse(user, 'User retrieved successfully');
  }

  @ApiOperation({
    summary: 'Update User',
    description: 'Update user information and role. Only accessible by admin users.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: StandardApiResponseDto<UserResponseDto>,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Admin privileges required',
  })
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUserWithRole() currentUser: any,
  ) {
    this.logger.log(`Admin ${currentUser.email} updating user: ${id}`);
    
    const user = await this.usersService.updateUser(id, updateUserDto, currentUser.id);
    
    return successResponse(user, 'User updated successfully');
  }

  @ApiOperation({
    summary: 'Delete User',
    description: 'Delete a user and their role. Only accessible by admin users. Cannot delete own account.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: StandardApiResponseDto<{ message: string }>,
  })
  @ApiBadRequestResponse({
    description: 'Cannot delete own account',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Admin privileges required',
  })
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUserWithRole() currentUser: any,
  ) {
    this.logger.log(`Admin ${currentUser.email} deleting user: ${id}`);
    
    await this.usersService.deleteUser(id, currentUser.id);
    
    return successResponse({ message: 'User deleted successfully' }, 'User deleted successfully');
  }

  @ApiOperation({
    summary: 'Get Users by Role',
    description: 'Retrieve all users with a specific role. Only accessible by admin users.',
  })
  @ApiParam({
    name: 'role',
    description: 'User role',
    enum: ['ADMIN', 'MANAGER', 'STAFF'],
    example: 'STAFF',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: StandardApiResponseDto<UserResponseDto[]>,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Admin privileges required',
  })
  @Get('role/:role')
  async getUsersByRole(
    @Param('role') role: 'ADMIN' | 'MANAGER' | 'STAFF',
    @CurrentUserWithRole() currentUser: any,
  ) {
    this.logger.log(`Admin ${currentUser.email} fetching users with role: ${role}`);
    
    const users = await this.usersService.getUsersByRole(role);
    
    return successResponse(users, `Users with role ${role} retrieved successfully`);
  }
}