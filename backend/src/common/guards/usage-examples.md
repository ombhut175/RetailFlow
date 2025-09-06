# Role-Based Guards and Decorators Usage Guide

This guide demonstrates how to use the newly implemented role-based authentication and authorization system.

## Overview

The system consists of several components:
- **Self-Contained Guards**: Handle both Supabase authentication AND role-based authorization in one step
- **Decorators**: Extract user and role information from requests
- **Repository**: Manage user roles and permissions in the database

## Key Architecture Changes

**🔥 Important**: All role-based guards now handle authentication internally using Supabase. You **DO NOT** need to use `AuthGuard` anymore when using role-based guards.

## Guards Available

### 1. Basic Authentication Only (if you need just auth without roles)
```typescript
import { AuthGuard } from '@common/guards/auth.guard';

@Controller('api')
export class ApiController {
  @Get('profile')
  @UseGuards(AuthGuard)  // Just authentication, no role check
  async getProfile(@CurrentUser() user: any) {
    return { id: user.id, email: user.email };
  }
}
```

### 2. Self-Contained Role-Based Guards (Recommended)

#### AdminGuard - ADMIN only (handles auth + role check)
```typescript
import { AdminGuard } from '@common/guards';

@Controller('admin')
export class AdminController {
  @Get('users')
  @UseGuards(AdminGuard)  // Handles both authentication AND admin role check
  async getAllUsers(@CurrentUserWithRole() user: any) {
    // user.id, user.email, user.role are all available
    return this.usersService.findAll();
  }
}
```

#### ManagerGuard - MANAGER+ (ADMIN, MANAGER)
```typescript
import { ManagerGuard } from '@common/guards';

@Controller('management')
export class ManagementController {
  @Get('reports')
  @UseGuards(ManagerGuard)  // Handles auth + manager-level role check
  async getReports(@CurrentUserWithRole() user: any) {
    // Both ADMIN and MANAGER can access this
    return this.reportsService.findAll();
  }
}
```

#### StaffGuard - Any role (ADMIN, MANAGER, STAFF)
```typescript
import { StaffGuard } from '@common/guards';

@Controller('dashboard')
export class DashboardController {
  @Get()
  @UseGuards(StaffGuard)  // Handles auth + any role check
  async getDashboard(@CurrentUserWithRole() user: any) {
    return {
      message: `Welcome ${user.role.role}`,
      permissions: user.role.permissions
    };
  }
}
```

### 3. Flexible Role Guards with Decorators (Self-Contained)

#### Using @MinimumRole decorator
```typescript
import { RolesGuard } from '@common/guards';
import { MinimumRole } from '@common/decorators';

@Controller('inventory')
export class InventoryController {
  @Get()
  @MinimumRole('STAFF')  // STAFF, MANAGER, or ADMIN can access
  @UseGuards(RolesGuard)  // Handles auth + role hierarchy check
  async getInventory(@CurrentUserWithRole() user: any) {
    return this.inventoryService.findAll();
  }

  @Post('adjust')
  @MinimumRole('MANAGER')  // Only MANAGER or ADMIN can access
  @UseGuards(RolesGuard)  // Handles auth + role hierarchy check
  async adjustStock(@Body() data: any, @CurrentUserWithRole() user: any) {
    return this.inventoryService.adjust(data, user.id);
  }
}
```

#### Using @Roles decorator
```typescript
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';

@Controller('products')
export class ProductsController {
  @Get()
  @Roles('STAFF', 'MANAGER', 'ADMIN')  // Specific roles allowed
  @UseGuards(RolesGuard)  // Handles auth + specific role check
  async getProducts(@CurrentUserWithRole() user: any) {
    return this.productsService.findAll();
  }

  @Delete(':id')
  @Roles('ADMIN')  // Only ADMIN can delete
  @UseGuards(RolesGuard)  // Handles auth + admin-only check
  async deleteProduct(@Param('id') id: string, @CurrentUserWithRole() user: any) {
    return this.productsService.delete(id, user.id);
  }
}
```

### 4. Permission-Based Guards

#### Using @RequirePermissions decorator
```typescript
import { AuthGuard, PermissionsGuard } from '@common/guards';
import { RequirePermissions, RequireAnyPermission } from '@common/decorators';

@Controller('warehouse')
export class WarehouseController {
  @Get('stock')
  @RequireAnyPermission('VIEW_INVENTORY', 'MANAGE_INVENTORY')
  @UseGuards(AuthGuard, PermissionsGuard)
  async getStock() {
    return this.warehouseService.getStock();
  }

  @Post('bulk-update')
  @RequirePermissions('MANAGE_INVENTORY', 'BULK_OPERATIONS')  // Needs ALL permissions
  @UseGuards(AuthGuard, PermissionsGuard)
  async bulkUpdate(@Body() data: any[]) {
    return this.warehouseService.bulkUpdate(data);
  }
}
```

### 5. Quick Access Decorators

```typescript
import { AuthGuard, RolesGuard } from '@common/guards';
import { AdminOnly, ManagerOnly, StaffOnly } from '@common/decorators';

@Controller('system')
export class SystemController {
  @Get('settings')
  @AdminOnly()  // Equivalent to @MinimumRole('ADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  async getSettings() {
    return this.systemService.getSettings();
  }

  @Get('reports')
  @ManagerOnly()  // Equivalent to @MinimumRole('MANAGER')
  @UseGuards(AuthGuard, RolesGuard)
  async getReports() {
    return this.reportsService.findAll();
  }

  @Get('profile')
  @StaffOnly()  // Equivalent to @MinimumRole('STAFF')
  @UseGuards(AuthGuard, RolesGuard)
  async getProfile() {
    return this.userService.getProfile();
  }
}
```

## Decorators for Data Extraction

### User Information Decorators

```typescript
import { CurrentUser, CurrentUserWithRole, CurrentRole, CurrentRoleName, CurrentPermissions } from '@common/decorators';

@Controller('user-info')
export class UserInfoController {
  @Get('basic')
  @UseGuards(AuthGuard)
  async getBasicInfo(@CurrentUser() user: any) {
    return { id: user.id, email: user.email };
  }

  @Get('with-role')
  @UseGuards(AuthGuard, StaffGuard)
  async getWithRole(@CurrentUserWithRole() user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role.role,
      permissions: user.role.permissions
    };
  }

  @Get('role-only')
  @UseGuards(AuthGuard, StaffGuard)
  async getRoleInfo(@CurrentRole() role: any) {
    return role; // { role: 'ADMIN', permissions: [...], is_role_active: true }
  }

  @Get('role-name')
  @UseGuards(AuthGuard, StaffGuard)
  async getRoleName(@CurrentRoleName() roleName: string) {
    return { roleName }; // { roleName: 'ADMIN' }
  }

  @Get('permissions')
  @UseGuards(AuthGuard, StaffGuard)
  async getPermissions(@CurrentPermissions() permissions: string[]) {
    return { permissions }; // { permissions: ['MANAGE_USERS', 'DELETE_PRODUCTS'] }
  }
}
```

## Guard Combination Strategies

### Strategy 1: Simple Role-Based (Recommended for most cases)
```typescript
@Controller('products')
export class ProductsController {
  @Get()
  @UseGuards(AuthGuard, StaffGuard)  // Any authenticated user with role
  async listProducts() {
    return this.productsService.findAll();
  }

  @Put(':id')
  @UseGuards(AuthGuard, ManagerGuard)  // Manager or Admin only
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)  // Admin only
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
```

### Strategy 2: Flexible Role-Based with Decorators
```typescript
@Controller('inventory')
export class InventoryController {
  @Get()
  @MinimumRole('STAFF')
  @UseGuards(AuthGuard, RolesGuard)
  async getInventory(@CurrentRoleName() role: string) {
    // Different behavior based on role
    if (role === 'ADMIN') {
      return this.inventoryService.findAllWithDetails();
    }
    return this.inventoryService.findAll();
  }

  @Post('adjust')
  @Roles('MANAGER', 'ADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  async adjustInventory(@Body() data: any) {
    return this.inventoryService.adjust(data);
  }
}
```

### Strategy 3: Permission-Based (For complex scenarios)
```typescript
@Controller('reports')
export class ReportsController {
  @Get('sales')
  @RequireAnyPermission('VIEW_SALES_REPORTS', 'MANAGE_REPORTS')
  @UseGuards(AuthGuard, PermissionsGuard)
  async getSalesReports() {
    return this.reportsService.getSalesReports();
  }

  @Post('generate')
  @RequirePermissions('GENERATE_REPORTS', 'MANAGE_SYSTEM')
  @UseGuards(AuthGuard, PermissionsGuard)
  async generateReport(@Body() config: any) {
    return this.reportsService.generate(config);
  }
}
```

## Best Practices

### 1. Always use AuthGuard first
```typescript
// ✅ Correct - AuthGuard first, then role-based guard
@UseGuards(AuthGuard, AdminGuard)

// ❌ Wrong - Role guard without authentication
@UseGuards(AdminGuard)
```

### 2. Choose the right strategy
- **Simple role-based**: Use `AdminGuard`, `ManagerGuard`, `StaffGuard` for straightforward scenarios
- **Flexible role-based**: Use `RolesGuard` with decorators for complex role logic
- **Permission-based**: Use `PermissionsGuard` for granular access control

### 3. Handle role information properly
```typescript
@Get('dashboard')
@UseGuards(AuthGuard, StaffGuard)
async getDashboard(@CurrentUserWithRole() user: any) {
  // Role information is guaranteed to be available
  const { role, permissions } = user.role;
  
  return this.dashboardService.getCustomizedDashboard(role, permissions);
}
```

### 4. Error handling
All guards throw `ForbiddenException` for unauthorized access and log detailed information for debugging.

## Role Hierarchy

The system uses the following role hierarchy:
- **ADMIN** > **MANAGER** > **STAFF**

When using `@MinimumRole('MANAGER')`, both ADMIN and MANAGER roles are allowed.
When using `@Roles('MANAGER')`, only MANAGER role is allowed (exact match).

## Database Setup

Before using the role-based system, ensure:
1. Database migrations are applied
2. Users have roles assigned in the `user_roles` table
3. Roles have appropriate permissions configured

## Example Role Assignment

```typescript
// In your user service or seed data
await this.userRolesRepository.assignRole({
  user_id: 'user-uuid',
  role: 'ADMIN',
  permissions: ['MANAGE_USERS', 'DELETE_PRODUCTS', 'SYSTEM_ADMIN'],
  assigned_by: 'admin-uuid',
  created_by: 'admin-uuid',
});
```