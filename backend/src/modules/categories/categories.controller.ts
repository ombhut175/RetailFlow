import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto, CategoryListResponseDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { ManagerGuard } from '../../common/guards/manager.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse, createdResponse } from '../../common/helpers/api-response.helper';
import { API_MESSAGES } from '../../common/constants/string-const';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(AuthGuard) // All endpoints require authentication
@ApiBearerAuth()
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  //#region ==================== CREATE OPERATIONS ====================

  @ApiOperation({
    summary: 'Create a new category',
    description: 'Create a new product category. Requires MANAGER or ADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Category created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          is_active: true,
          created_by: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_by: null,
          updated_at: null,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: ['Category name is required', 'Category name cannot exceed 100 characters'],
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/api/categories',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - MANAGER or ADMIN role required',
  })
  @ApiConflictResponse({
    description: 'Category name already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Category name already exists',
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/api/categories',
      },
    },
  })
  @Post()
  @UseGuards(ManagerGuard) // MANAGER+ access (MANAGER, ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Creating category: ${createCategoryDto.name} by user: ${userId}`);
    
    const category = await this.categoriesService.create(createCategoryDto, userId);
    
    this.logger.log(`Category created successfully: ${category.id}`);
    
    return createdResponse(category, API_MESSAGES.CATEGORY_CREATED);
  }

  //#endregion

  //#region ==================== READ OPERATIONS ====================

  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieve all categories with optional filtering. Accessible to all authenticated users.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by category name (partial match)',
    example: 'Electronics',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    description: 'Filter by active status',
    example: true,
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    description: 'Include soft-deleted categories (ADMIN only)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: CategoryListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Categories fetched successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Electronics',
            description: 'Electronic devices and accessories',
            is_active: true,
            created_by: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_by: null,
            updated_at: null,
          },
        ],
        total: 1,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @Get()
  @UseGuards(StaffGuard) // All authenticated users (STAFF, MANAGER, ADMIN)
  async findAll(
    @Query('name') name?: string,
    @Query('is_active') is_active?: boolean,
    @Query('withDeleted') withDeleted?: boolean,
  ) {
    this.logger.log('Fetching all categories with filters', { name, is_active, withDeleted });
    
    const filters = {
      ...(name && { name }),
      ...(is_active !== undefined && { is_active }),
      ...(withDeleted !== undefined && { withDeleted }),
    };
    
    const categories = await this.categoriesService.findAll(filters);
    
    this.logger.log(`Retrieved ${categories.length} categories`);
    
    return successResponse(
      {
        data: categories,
        total: categories.length,
      },
      API_MESSAGES.CATEGORIES_FETCHED
    );
  }

  @ApiOperation({
    summary: 'Get active categories only',
    description: 'Retrieve only active categories. Accessible to all authenticated users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @Get('active')
  @UseGuards(StaffGuard) // All authenticated users
  async getActiveCategories() {
    this.logger.log('Fetching active categories');
    
    const categories = await this.categoriesService.getActiveCategories();
    
    this.logger.log(`Retrieved ${categories.length} active categories`);
    
    return successResponse(categories, 'Active categories retrieved successfully');
  }

  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieve a specific category by its ID. Accessible to all authenticated users.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    description: 'Include soft-deleted category (ADMIN only)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Category not found',
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/api/categories/123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  @Get(':id')
  @UseGuards(StaffGuard) // All authenticated users
  async findOne(
    @Param('id') id: string,
    @Query('withDeleted') withDeleted?: boolean,
  ) {
    this.logger.log(`Fetching category: ${id}`);
    
    const category = await this.categoriesService.findOne(id, withDeleted);
    
    this.logger.log(`Category retrieved: ${category.id}`);
    
    return successResponse(category, 'Category retrieved successfully');
  }

  @ApiOperation({
    summary: 'Search categories',
    description: 'Search categories by name. Accessible to all authenticated users.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search term for category name',
    example: 'Electronics',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories search completed successfully',
    type: [CategoryResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @Get('search')
  @UseGuards(StaffGuard) // All authenticated users
  async searchCategories(@Query('q') searchTerm: string) {
    this.logger.log(`Searching categories with term: ${searchTerm}`);
    
    const categories = await this.categoriesService.searchCategories(searchTerm);
    
    this.logger.log(`Found ${categories.length} categories matching search term`);
    
    return successResponse(categories, 'Categories search completed successfully');
  }

  //#endregion

  //#region ==================== UPDATE OPERATIONS ====================

  @ApiOperation({
    summary: 'Update a category',
    description: 'Update an existing category. Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - MANAGER or ADMIN role required',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @ApiConflictResponse({
    description: 'Category name already exists',
  })
  @Patch(':id')
  @UseGuards(ManagerGuard) // MANAGER+ access
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Updating category: ${id} by user: ${userId}`);
    
    const category = await this.categoriesService.update(id, updateCategoryDto, userId);
    
    this.logger.log(`Category updated successfully: ${id}`);
    
    return successResponse(category, API_MESSAGES.CATEGORY_UPDATED);
  }

  @ApiOperation({
    summary: 'Restore a soft-deleted category',
    description: 'Restore a previously soft-deleted category. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category restored successfully',
    type: CategoryResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - ADMIN role required',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @Patch(':id/restore')
  @UseGuards(AdminGuard) // ADMIN only
  async restore(@Param('id') id: string) {
    this.logger.log(`Restoring category: ${id}`);
    
    const category = await this.categoriesService.restore(id);
    
    this.logger.log(`Category restored successfully: ${id}`);
    
    return successResponse(category, 'Category restored successfully');
  }

  //#endregion

  //#region ==================== DELETE OPERATIONS ====================

  @ApiOperation({
    summary: 'Soft delete a category',
    description: 'Soft delete a category (mark as deleted). Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Category deleted successfully',
        data: null,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - MANAGER or ADMIN role required',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @Delete(':id')
  @UseGuards(ManagerGuard) // MANAGER+ access
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Soft deleting category: ${id} by user: ${userId}`);
    
    await this.categoriesService.remove(id, userId);
    
    this.logger.log(`Category soft deleted successfully: ${id}`);
    
    return successResponse(null, API_MESSAGES.CATEGORY_DELETED);
  }

  @ApiOperation({
    summary: 'Permanently delete a category',
    description: 'Permanently delete a category from the database. Requires ADMIN role. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category permanently deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Category permanently deleted successfully',
        data: null,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - ADMIN role required',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @Delete(':id/purge')
  @UseGuards(AdminGuard) // ADMIN only
  @HttpCode(HttpStatus.OK)
  async hardDelete(@Param('id') id: string) {
    this.logger.log(`Hard deleting category: ${id}`);
    
    await this.categoriesService.hardDelete(id);
    
    this.logger.log(`Category hard deleted successfully: ${id}`);
    
    return successResponse(null, 'Category permanently deleted successfully');
  }

  //#endregion

  //#region ==================== UTILITY OPERATIONS ====================

  @ApiOperation({
    summary: 'Get categories count',
    description: 'Get the total count of categories. Accessible to all authenticated users.',
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    description: 'Include soft-deleted categories in count (ADMIN only)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Categories count retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Categories count retrieved successfully',
        data: {
          count: 25,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @Get('stats/count')
  @UseGuards(StaffGuard) // All authenticated users
  async getCategoriesCount(@Query('withDeleted') withDeleted?: boolean) {
    this.logger.log('Getting categories count', { withDeleted });
    
    const count = await this.categoriesService.getCategoriesCount(withDeleted);
    
    this.logger.log(`Categories count: ${count}`);
    
    return successResponse(
      { count },
      'Categories count retrieved successfully'
    );
  }

  //#endregion
}