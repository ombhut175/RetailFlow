import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const MINIMUM_ROLE_KEY = 'minimum_role';

/**
 * Decorator to specify required roles for route access
 * Used with RolesGuard to enforce role-based access control
 * 
 * @param roles - Array of roles that can access the route
 * 
 * @example
 * @Controller('admin')
 * export class AdminController {
 *   @Get('users')
 *   @Roles('ADMIN', 'MANAGER')
 *   @UseGuards(AuthGuard, RolesGuard)
 *   async getUsers() {
 *     return this.usersService.findAll();
 *   }
 * }
 */
export const Roles = (...roles: ('ADMIN' | 'MANAGER' | 'STAFF')[]) => 
  SetMetadata(ROLES_KEY, roles);

/**
 * Decorator to specify minimum role required for route access
 * Uses role hierarchy: ADMIN > MANAGER > STAFF
 * 
 * @param role - Minimum role required (users with higher roles can also access)
 * 
 * @example
 * @Controller('management')
 * export class ManagementController {
 *   @Get('reports')
 *   @MinimumRole('MANAGER')
 *   @UseGuards(AuthGuard, RolesGuard)
 *   async getReports() {
 *     // Both ADMIN and MANAGER can access this
 *     return this.reportsService.findAll();
 *   }
 * }
 */
export const MinimumRole = (role: 'ADMIN' | 'MANAGER' | 'STAFF') => 
  SetMetadata(MINIMUM_ROLE_KEY, role);

/**
 * Decorator to specify required permissions for route access
 * Used with PermissionsGuard to enforce permission-based access control
 * 
 * @param permissions - Array of permissions required to access the route
 * 
 * @example
 * @Controller('products')
 * export class ProductsController {
 *   @Delete(':id')
 *   @RequirePermissions('DELETE_PRODUCT', 'MANAGE_INVENTORY')
 *   @UseGuards(AuthGuard, PermissionsGuard)
 *   async deleteProduct(@Param('id') id: string) {
 *     return this.productsService.delete(id);
 *   }
 * }
 */
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to require any of the specified permissions (OR logic)
 * User needs at least one of the specified permissions
 * 
 * @param permissions - Array of permissions (user needs at least one)
 * 
 * @example
 * @Controller('inventory')
 * export class InventoryController {
 *   @Get()
 *   @RequireAnyPermission('VIEW_INVENTORY', 'MANAGE_INVENTORY')
 *   @UseGuards(AuthGuard, PermissionsGuard)
 *   async getInventory() {
 *     // User needs either VIEW_INVENTORY or MANAGE_INVENTORY permission
 *     return this.inventoryService.findAll();
 *   }
 * }
 */
export const RequireAnyPermission = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, { permissions, mode: 'ANY' });

/**
 * Decorator to require all of the specified permissions (AND logic)
 * User needs all specified permissions
 * 
 * @param permissions - Array of permissions (user needs all)
 * 
 * @example
 * @Controller('admin')
 * export class AdminController {
 *   @Post('bulk-delete')
 *   @RequireAllPermissions('DELETE_PRODUCTS', 'BULK_OPERATIONS', 'ADMIN_ACCESS')
 *   @UseGuards(AuthGuard, PermissionsGuard)
 *   async bulkDelete(@Body() ids: string[]) {
 *     // User needs all three permissions
 *     return this.productsService.bulkDelete(ids);
 *   }
 * }
 */
export const RequireAllPermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, { permissions, mode: 'ALL' });

// Quick access decorators for common roles

/**
 * Decorator for ADMIN-only routes
 * Equivalent to @MinimumRole('ADMIN')
 */
export const AdminOnly = () => MinimumRole('ADMIN');

/**
 * Decorator for MANAGER+ routes (ADMIN, MANAGER)
 * Equivalent to @MinimumRole('MANAGER')
 */
export const ManagerOnly = () => MinimumRole('MANAGER');

/**
 * Decorator for authenticated users with any role (ADMIN, MANAGER, STAFF)
 * Equivalent to @MinimumRole('STAFF')
 */
export const StaffOnly = () => MinimumRole('STAFF');