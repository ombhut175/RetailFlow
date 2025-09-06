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
  ParseIntPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
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
import { SuppliersService } from './suppliers.service';
import { 
  CreateSupplierDto, 
  UpdateSupplierDto, 
  SupplierResponseDto, 
  SupplierListResponseDto,
  SupplierFiltersDto 
} from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ManagerGuard } from '../../common/guards/manager.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse, createdResponse } from '../../common/helpers/api-response.helper';
import { API_MESSAGES } from '../../common/constants/string-const';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(AuthGuard) // All endpoints require authentication
@ApiBearerAuth()
export class SuppliersController {
  private readonly logger = new Logger(SuppliersController.name);

  constructor(private readonly suppliersService: SuppliersService) {}

  //#region ==================== CREATE OPERATIONS ====================

  @ApiOperation({
    summary: 'Create a new supplier',
    description: 'Create a new supplier with contact information. Requires MANAGER or ADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Supplier created successfully',
    type: SupplierResponseDto,
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Supplier created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Tech Supply Corp',
          contact_person: 'John Smith',
          email: 'contact@techsupply.com',
          phone: '+1-555-0123',
          address: '123 Business St, City, State 12345',
          is_active: true,
          created_by: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_by: null,
          updated_at: null,
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Supplier name or email already exists',
    schema: {
      example: {
        statusCode: 409,
        success: false,
        message: 'Supplier name already exists',
        error: 'Conflict',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ManagerGuard) // Requires MANAGER or ADMIN role
  async createSupplier(
    @Body() createSupplierDto: CreateSupplierDto,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Creating supplier: ${createSupplierDto.name} by user: ${userId}`);
    
    const supplier = await this.suppliersService.createSupplier(createSupplierDto, userId);
    
    this.logger.log(`Supplier created successfully: ${supplier.id}`);
    return createdResponse(supplier, API_MESSAGES.SUPPLIER_CREATED);
  }

  //#region ==================== READ OPERATIONS ====================

  @ApiOperation({
    summary: 'Get all suppliers',
    description: 'Retrieve a paginated list of suppliers with optional filtering. Requires STAFF role or above.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starting from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (1-100)',
    example: 10,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by supplier name (partial match)',
    example: 'Tech',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Filter by email address (partial match)',
    example: 'contact@',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    type: String,
    description: 'Filter by phone number (partial match)',
    example: '555',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft deleted suppliers (Admin only)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Suppliers retrieved successfully',
    type: SupplierListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Suppliers fetched successfully',
        data: {
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Tech Supply Corp',
              contact_person: 'John Smith',
              email: 'contact@techsupply.com',
              phone: '+1-555-0123',
              address: '123 Business St, City, State 12345',
              is_active: true,
              created_by: '123e4567-e89b-12d3-a456-426614174000',
              created_at: '2024-01-15T10:30:00.000Z',
              updated_by: null,
              updated_at: null,
            },
          ],
          total: 25,
          page: 1,
          totalPages: 3,
          limit: 10,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Staff role required' })
  @Get()
  @UseGuards(StaffGuard) // Requires STAFF, MANAGER, or ADMIN role
  async findAllSuppliers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query() filters: SupplierFiltersDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Finding suppliers - page: ${page}, limit: ${limit}`);

    // Validate pagination
    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    // Only admins can see deleted suppliers
    if (filters.withDeleted && user.role !== 'ADMIN') {
      filters.withDeleted = false;
    }

    const result = await this.suppliersService.findAllSuppliers(filters, page, limit);
    
    this.logger.log(`Found ${result.data.length} suppliers`);
    return successResponse({
      ...result,
      limit,
    }, API_MESSAGES.SUPPLIERS_FETCHED);
  }

  @ApiOperation({
    summary: 'Get supplier by ID',
    description: 'Retrieve a specific supplier by their ID. Requires STAFF role or above.',
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier retrieved successfully',
    type: SupplierResponseDto,
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Supplier retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Tech Supply Corp',
          contact_person: 'John Smith',
          email: 'contact@techsupply.com',
          phone: '+1-555-0123',
          address: '123 Business St, City, State 12345',
          is_active: true,
          created_by: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_by: null,
          updated_at: null,
        },
      },
    },
  })
  @ApiNotFoundResponse({ 
    description: 'Supplier not found',
    schema: {
      example: {
        statusCode: 404,
        success: false,
        message: 'Supplier not found',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Staff role required' })
  @Get(':id')
  @UseGuards(StaffGuard) // Requires STAFF, MANAGER, or ADMIN role
  async findSupplierById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Finding supplier by ID: ${id}`);
    
    const supplier = await this.suppliersService.findSupplierById(id);
    
    this.logger.log(`Supplier found: ${supplier.name}`);
    return successResponse(supplier, 'Supplier retrieved successfully');
  }

  @ApiOperation({
    summary: 'Search suppliers',
    description: 'Search suppliers by name, contact person, email, or phone. Requires STAFF role or above.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query (minimum 2 characters)',
    example: 'Tech',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of results (1-50)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Suppliers search completed successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Suppliers search completed',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Tech Supply Corp',
            contact_person: 'John Smith',
            email: 'contact@techsupply.com',
            phone: '+1-555-0123',
            is_active: true,
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Staff role required' })
  @Get('search/query')
  @UseGuards(StaffGuard) // Requires STAFF, MANAGER, or ADMIN role
  async searchSuppliers(
    @Query('q') searchTerm: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    this.logger.log(`Searching suppliers with term: ${searchTerm}`);

    // Validate limit
    if (limit < 1) limit = 1;
    if (limit > 50) limit = 50;

    const suppliers = await this.suppliersService.searchSuppliers(searchTerm, limit);
    
    this.logger.log(`Found ${suppliers.length} suppliers matching: ${searchTerm}`);
    return successResponse(suppliers, 'Suppliers search completed');
  }

  @ApiOperation({
    summary: 'Get active suppliers',
    description: 'Retrieve all active suppliers. Requires STAFF role or above.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active suppliers retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Active suppliers retrieved successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Tech Supply Corp',
            contact_person: 'John Smith',
            email: 'contact@techsupply.com',
            phone: '+1-555-0123',
            is_active: true,
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Staff role required' })
  @Get('active/list')
  @UseGuards(StaffGuard) // Requires STAFF, MANAGER, or ADMIN role
  async findActiveSuppliers() {
    this.logger.log('Finding all active suppliers');
    
    const suppliers = await this.suppliersService.findActiveSuppliers();
    
    this.logger.log(`Found ${suppliers.length} active suppliers`);
    return successResponse(suppliers, 'Active suppliers retrieved successfully');
  }

  //#region ==================== UPDATE OPERATIONS ====================

  @ApiOperation({
    summary: 'Update a supplier',
    description: 'Update supplier information by ID. Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated successfully',
    type: SupplierResponseDto,
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Supplier updated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Tech Supply Corp Updated',
          contact_person: 'John Smith',
          email: 'contact@techsupply.com',
          phone: '+1-555-0123',
          address: '123 Business St, City, State 12345',
          is_active: true,
          created_by: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_by: '123e4567-e89b-12d3-a456-426614174000',
          updated_at: '2024-01-16T14:20:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  @ApiConflictResponse({ description: 'Supplier name or email already exists' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Patch(':id')
  @UseGuards(ManagerGuard) // Requires MANAGER or ADMIN role
  async updateSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Updating supplier: ${id} by user: ${userId}`);
    
    const supplier = await this.suppliersService.updateSupplier(id, updateSupplierDto, userId);
    
    this.logger.log(`Supplier updated successfully: ${supplier.id}`);
    return successResponse(supplier, API_MESSAGES.SUPPLIER_UPDATED);
  }

  //#region ==================== DELETE OPERATIONS ====================

  @ApiOperation({
    summary: 'Delete a supplier',
    description: 'Soft delete a supplier by ID. Requires MANAGER or ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Supplier deleted successfully',
        data: {
          message: 'Supplier deleted successfully',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Delete(':id')
  @UseGuards(ManagerGuard) // Requires MANAGER or ADMIN role
  async deleteSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Deleting supplier: ${id} by user: ${userId}`);
    
    const result = await this.suppliersService.deleteSupplier(id, userId);
    
    this.logger.log(`Supplier deleted successfully: ${id}`);
    return successResponse(result, result.message);
  }

  @ApiOperation({
    summary: 'Restore a deleted supplier',
    description: 'Restore a soft-deleted supplier by ID. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier restored successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Supplier restored successfully',
        data: {
          message: 'Supplier restored successfully',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @Post(':id/restore')
  @UseGuards(AdminGuard) // Requires ADMIN role only
  async restoreSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    this.logger.log(`Restoring supplier: ${id} by user: ${userId}`);
    
    const result = await this.suppliersService.restoreSupplier(id, userId);
    
    this.logger.log(`Supplier restored successfully: ${id}`);
    return successResponse(result, result.message);
  }

  //#region ==================== STATISTICS ====================

  @ApiOperation({
    summary: 'Get supplier statistics',
    description: 'Retrieve supplier statistics including counts by status. Requires MANAGER role or above.',
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier statistics retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Supplier statistics retrieved successfully',
        data: {
          total: 50,
          active: 45,
          inactive: 3,
          deleted: 2,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Manager role required' })
  @Get('stats/overview')
  @UseGuards(ManagerGuard) // Requires MANAGER or ADMIN role
  async getSupplierStats() {
    this.logger.log('Getting supplier statistics');
    
    const stats = await this.suppliersService.getSupplierStats();
    
    this.logger.log('Supplier statistics retrieved successfully');
    return successResponse(stats, 'Supplier statistics retrieved successfully');
  }
}
