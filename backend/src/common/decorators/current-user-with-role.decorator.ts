import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

/**
 * Decorator to extract current authenticated user with role information from request
 * Must be used with AuthGuard and one of the role-based guards (RolesGuard, AdminGuard, ManagerGuard, StaffGuard)
 * 
 * @example
 * @Controller('users')
 * export class UsersController {
 *   @Get('profile')
 *   @UseGuards(AuthGuard, StaffGuard)
 *   async getProfile(@CurrentUserWithRole() user: any) {
 *     return { 
 *       id: user.id, 
 *       email: user.email, 
 *       role: user.role?.role,
 *       permissions: user.role?.permissions 
 *     };
 *   }
 * 
 *   @Get('profile/role')
 *   @UseGuards(AuthGuard, StaffGuard)
 *   async getUserRole(@CurrentUserWithRole('role') roleInfo: any) {
 *     return roleInfo; // { role: 'ADMIN', permissions: [...], is_role_active: true }
 *   }
 * 
 *   @Get('profile/role-name')
 *   @UseGuards(AuthGuard, StaffGuard)
 *   async getUserRoleName(@CurrentUserWithRole('role.role') roleName: string) {
 *     return { roleName }; // { roleName: 'ADMIN' }
 *   }
 * }
 */
export const CurrentUserWithRole = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new Error('CurrentUserWithRole decorator used without AuthGuard. Apply @UseGuards(AuthGuard) to the route.');
    }

    if (!user.role) {
      throw new Error('CurrentUserWithRole decorator used without role-based guard. Apply a role-based guard (AdminGuard, ManagerGuard, StaffGuard, or RolesGuard) to the route.');
    }

    // Return specific property if requested
    if (data) {
      // Support nested property access like 'role.role' or 'role.permissions'
      const props = data.split('.');
      let result: any = user;
      
      for (const prop of props) {
        if (result && typeof result === 'object' && prop in result) {
          result = result[prop];
        } else {
          return undefined;
        }
      }
      
      return result;
    }

    // Return full user object with role information
    return user;
  },
);

/**
 * Decorator to extract only the role information from the authenticated user
 * Shorthand for @CurrentUserWithRole('role')
 */
export const CurrentRole = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new Error('CurrentRole decorator used without AuthGuard. Apply @UseGuards(AuthGuard) to the route.');
    }

    if (!user.role) {
      throw new Error('CurrentRole decorator used without role-based guard. Apply a role-based guard to the route.');
    }

    // Return specific role property if requested
    if (data) {
      const roleInfo = user.role;
      return roleInfo[data as keyof typeof roleInfo];
    }

    // Return full role object
    return user.role;
  },
);

/**
 * Decorator to extract the role name ('ADMIN', 'MANAGER', 'STAFF')
 * Shorthand for @CurrentUserWithRole('role.role')
 */
export const CurrentRoleName = createParamDecorator(
  (data: undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new Error('CurrentRoleName decorator used without AuthGuard. Apply @UseGuards(AuthGuard) to the route.');
    }

    if (!user.role) {
      throw new Error('CurrentRoleName decorator used without role-based guard. Apply a role-based guard to the route.');
    }

    return user.role.role;
  },
);

/**
 * Decorator to extract the user's permissions array
 * Shorthand for @CurrentUserWithRole('role.permissions')
 */
export const CurrentPermissions = createParamDecorator(
  (data: undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new Error('CurrentPermissions decorator used without AuthGuard. Apply @UseGuards(AuthGuard) to the route.');
    }

    if (!user.role) {
      throw new Error('CurrentPermissions decorator used without role-based guard. Apply a role-based guard to the route.');
    }

    return user.role.permissions || [];
  },
);