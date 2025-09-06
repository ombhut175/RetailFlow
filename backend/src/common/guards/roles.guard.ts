import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { ROLES_KEY, MINIMUM_ROLE_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { UserRolesRepository } from '../../core/database/repositories/user-roles.repository';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { COOKIES } from '../constants/string-const';

/**
 * RolesGuard that handles both authentication and role-based authorization
 * Validates Supabase token and checks user roles in one step
 * Supports both specific role checking and minimum role hierarchy
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private userRolesRepository: UserRolesRepository,
    private supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = randomUUID();

    this.logger.log('Authentication and role authorization attempt started', {
      operation: 'canActivate',
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });

    try {
      // Step 1: Extract and validate Supabase token (same as AuthGuard)
      const token = this.extractTokenFromRequest(request);
      
      if (!token) {
        this.logger.warn('No authorization token found', {
          operation: 'extractToken',
          requestId,
          headers: {
            authorization: request.headers.authorization ? 'present' : 'missing',
            cookie: request.headers.cookie ? 'present' : 'missing',
          },
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
          timestamp: new Date().toISOString(),
        });
        throw new UnauthorizedException('Invalid or expired token');
      }

      const userId = user.id;

      // Step 3: Get role metadata from decorator
      const requiredRoles = this.reflector.getAllAndOverride<('ADMIN' | 'MANAGER' | 'STAFF')[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      const minimumRole = this.reflector.getAllAndOverride<'ADMIN' | 'MANAGER' | 'STAFF'>(
        MINIMUM_ROLE_KEY,
        [context.getHandler(), context.getClass()],
      );

      // If no role requirements are set, just authenticate and attach user info
      if (!requiredRoles && !minimumRole) {
        // Attach basic user info to request (same as AuthGuard)
        (request as any).user = {
          id: user.id,
          email: user.email,
          supabaseUser: user,
        };

        this.logger.log('Authentication successful, no role requirements', {
          operation: 'checkRoleRequirements',
          requestId,
          userId: user.id,
          email: user.email,
          authTime: `${authTime}ms`,
        });
        return true;
      }

      // Step 4: Fetch user role from database
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

      // Step 6: Check role requirements
      let hasAccess = false;

      // Check minimum role requirement (hierarchy)
      if (minimumRole) {
        hasAccess = await this.userRolesRepository.userHasMinimumRole(userId, minimumRole);
        
        this.logger.log('Minimum role check performed', {
          operation: 'checkMinimumRole',
          requestId,
          userId,
          email: user.email,
          userRole: userWithRole.role,
          requiredMinimumRole: minimumRole,
          hasAccess,
          authTime: `${authTime}ms`,
          dbTime: `${dbTime}ms`,
        });
      }

      // Check specific roles requirement (exact match)
      if (requiredRoles && !hasAccess) {
        hasAccess = requiredRoles.includes(userWithRole.role);
        
        this.logger.log('Specific roles check performed', {
          operation: 'checkSpecificRoles',
          requestId,
          userId,
          email: user.email,
          userRole: userWithRole.role,
          requiredRoles,
          hasAccess,
          authTime: `${authTime}ms`,
          dbTime: `${dbTime}ms`,
        });
      }

      if (!hasAccess) {
        this.logger.warn('Authorization failed - insufficient role permissions', {
          operation: 'checkRoleAccess',
          requestId,
          userId,
          email: user.email,
          userRole: userWithRole.role,
          requiredRoles,
          minimumRole,
          authTime: `${authTime}ms`,
          dbTime: `${dbTime}ms`,
        });
        throw new ForbiddenException('Access denied: Insufficient role permissions');
      }

      this.logger.log('Authentication and role authorization successful', {
        operation: 'canActivate',
        requestId,
        userId,
        email: user.email,
        userRole: userWithRole.role,
        requiredRoles,
        minimumRole,
        authTime: `${authTime}ms`,
        dbTime: `${dbTime}ms`,
        totalTime: `${Date.now() - (Date.now() - authTime - dbTime)}ms`,
        timestamp: new Date().toISOString(),
      });

      return true;

    } catch (error) {
      this.logger.error('Authentication or role authorization failed', {
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
      
      throw new ForbiddenException('Authentication and role authorization failed');
    }
  }

  /**
   * Extracts JWT token from Authorization header or cookies (same as AuthGuard)
   * @param request Express request object
   * @returns JWT token string or null if not found
   */
  private extractTokenFromRequest(request: Request): string | null {
    // Check Authorization header first (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Fallback to auth_token cookie (set by login endpoint)
    const cookies = request.cookies;
    if (cookies?.[COOKIES.AUTH_TOKEN]) {
      return cookies[COOKIES.AUTH_TOKEN];
    }

    return null;
  }
}