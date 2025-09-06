import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { PERMISSIONS_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { UserRolesRepository } from '../../core/database/repositories/user-roles.repository';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { COOKIES } from '../constants/string-const';

/**
 * PermissionsGuard that handles authentication and permission-based access control
 * Validates Supabase token and checks user permissions in one step
 * Supports both ANY (OR) and ALL (AND) permission checking modes
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private userRolesRepository: UserRolesRepository,
    private supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = randomUUID();

    this.logger.log('Authentication and permission authorization attempt started', {
      operation: 'canActivate',
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });

    try {
      // Step 1: Extract and validate Supabase token
      const token = this.extractTokenFromRequest(request);
      
      if (!token) {
        this.logger.warn('No authorization token found', {
          operation: 'extractToken',
          requestId,
        });
        throw new UnauthorizedException('No authorization token provided');
      }

      // Step 2: Get user from Supabase using token
      const startAuthTime = Date.now();
      const { data: { user }, error } = await this.supabaseService.getClient()
        .auth.getUser(token);
      const authTime = Date.now() - startAuthTime;

      if (error || !user) {
        this.logger.error('Token validation failed', {
          operation: 'getUser',
          requestId,
          error: error?.message || 'User not found',
          authTime: `${authTime}ms`,
        });
        throw new UnauthorizedException('Invalid or expired token');
      }

      const userId = user.id;

      // Step 3: Get permission metadata from decorator
      const permissionData = this.reflector.getAllAndOverride<string[] | { permissions: string[], mode: 'ANY' | 'ALL' }>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

      // If no permission requirements are set, just authenticate and attach user info
      if (!permissionData) {
        // Attach basic user info to request (same as AuthGuard)
        (request as any).user = {
          id: user.id,
          email: user.email,
          supabaseUser: user,
        };

        this.logger.log('Authentication successful, no permission requirements', {
          operation: 'checkPermissionRequirements',
          requestId,
          userId: user.id,
          email: user.email,
          authTime: `${authTime}ms`,
        });
        return true;
      }

      // Parse permission data
      let requiredPermissions: string[];
      let mode: 'ANY' | 'ALL' = 'ALL'; // Default to ALL (AND logic)

      if (Array.isArray(permissionData)) {
        // Simple array of permissions (default to ALL mode)
        requiredPermissions = permissionData;
      } else {
        // Complex object with mode
        requiredPermissions = permissionData.permissions;
        mode = permissionData.mode;
      }

      if (!requiredPermissions?.length) {
        // Attach basic user info to request
        (request as any).user = {
          id: user.id,
          email: user.email,
          supabaseUser: user,
        };

        this.logger.log('Authentication successful, no permissions specified', {
          operation: 'parsePermissions',
          requestId,
          userId: user.id,
          email: user.email,
          authTime: `${authTime}ms`,
        });
        return true;
      }

      // Step 4: Fetch user role and permissions from database
      const startDbTime = Date.now();
      const userWithRole = await this.userRolesRepository.findUserWithRole(userId);
      const dbTime = Date.now() - startDbTime;

      if (!userWithRole?.role) {
        this.logger.warn('User has no role assigned', {
          operation: 'fetchUserRole',
          requestId,
          userId,
          email: user.email,
          authTime: `${authTime}ms`,
          dbTime: `${dbTime}ms`,
        });
        throw new ForbiddenException('Access denied: No role assigned');
      }

      // Check if role is active
      if (!userWithRole.is_role_active) {
        this.logger.warn('User role is inactive', {
          operation: 'checkRoleStatus',
          requestId,
          userId,
          email: user.email,
          role: userWithRole.role,
          authTime: `${authTime}ms`,
          dbTime: `${dbTime}ms`,
        });
        throw new ForbiddenException('Access denied: Role is inactive');
      }

      // Step 5: Attach both authentication and role information to request
      (request as any).user = {
        id: user.id,
        email: user.email,
        supabaseUser: user,
        role: {
          role: userWithRole.role,
          permissions: userWithRole.permissions,
          is_role_active: userWithRole.is_role_active,
        },
      };

      // Step 6: Check permissions based on mode
      let hasAccess = false;

      if (mode === 'ANY') {
        // User needs at least one of the specified permissions (OR logic)
        hasAccess = await this.userRolesRepository.userHasAnyPermission(userId, requiredPermissions);
        
        this.logger.log('ANY permissions check performed', {
          operation: 'checkAnyPermissions',
          requestId,
          userId,
          email: user.email,
          userRole: userWithRole.role,
          userPermissions: userWithRole.permissions,
          requiredPermissions,
          hasAccess,
          mode,
          authTime: `${authTime}ms`,
          dbTime: `${dbTime}ms`,
        });
      } else {
        // User needs all specified permissions (AND logic)
        hasAccess = await this.userRolesRepository.userHasAllPermissions(userId, requiredPermissions);
        
        this.logger.log('ALL permissions check performed', {
          operation: 'checkAllPermissions',
          requestId,
          userId,
          email: user.email,
          userRole: userWithRole.role,
          userPermissions: userWithRole.permissions,
          requiredPermissions,
          hasAccess,
          mode,
          authTime: `${authTime}ms`,
          dbTime: `${dbTime}ms`,
        });
      }

      if (!hasAccess) {
        this.logger.warn('Permission authorization failed - insufficient permissions', {
          operation: 'checkPermissionAccess',
          requestId,
          userId,
          email: user.email,
          userRole: userWithRole.role,
          userPermissions: userWithRole.permissions,
          requiredPermissions,
          mode,
          authTime: `${authTime}ms`,
          dbTime: `${dbTime}ms`,
        });
        throw new ForbiddenException(`Access denied: Insufficient permissions (required: ${mode} of [${requiredPermissions.join(', ')}])`);
      }

      this.logger.log('Authentication and permission authorization successful', {
        operation: 'canActivate',
        requestId,
        userId,
        email: user.email,
        userRole: userWithRole.role,
        userPermissions: userWithRole.permissions,
        requiredPermissions,
        mode,
        authTime: `${authTime}ms`,
        dbTime: `${dbTime}ms`,
        totalTime: `${authTime + dbTime}ms`,
        timestamp: new Date().toISOString(),
      });

      return true;

    } catch (error) {
      this.logger.error('Authentication or permission authorization failed', {
        operation: 'canActivate',
        requestId,
        method: request.method,
        url: request.url,
        error: {
          message: error.message,
          name: error.constructor.name,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        timestamp: new Date().toISOString(),
      });

      // Re-throw known exceptions, wrap unknown ones
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      
      throw new ForbiddenException('Authentication and permission authorization failed');
    }
  }

  /**
   * Extracts JWT token from Authorization header or cookies
   */
  private extractTokenFromRequest(request: Request): string | null {
    // Check Authorization header first (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Fallback to auth_token cookie
    const cookies = request.cookies;
    if (cookies?.[COOKIES.AUTH_TOKEN]) {
      return cookies[COOKIES.AUTH_TOKEN];
    }

    return null;
  }
}