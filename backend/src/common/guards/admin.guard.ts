import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { UserRolesRepository } from '../../core/database/repositories/user-roles.repository';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { COOKIES } from '../constants/string-const';

/**
 * AdminGuard for ADMIN-only access
 * Handles both authentication via Supabase and admin role checking
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(
    private userRolesRepository: UserRolesRepository,
    private supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = randomUUID();

    this.logger.log('Authentication and admin authorization attempt started', {
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

      // Step 3: Check if user is admin
      const startDbTime = Date.now();
      const isAdmin = await this.userRolesRepository.isAdmin(userId);
      
      if (!isAdmin) {
        // Get user role for detailed logging
        const userWithRole = await this.userRolesRepository.findUserWithRole(userId);
        const dbTime = Date.now() - startDbTime;
        
        this.logger.warn('Admin access denied', {
          operation: 'checkAdminRole',
          requestId,
          userId,
          email: user.email,
          userRole: userWithRole?.role || 'NO_ROLE',
          requiredRole: 'ADMIN',
          authTime: `${authTime}ms`,
          dbTime: `${dbTime}ms`,
        });
        throw new ForbiddenException('Access denied: Admin privileges required');
      }

      // Step 4: Fetch and attach full user and role information to request
      const userWithRole = await this.userRolesRepository.findUserWithRole(userId);
      const dbTime = Date.now() - startDbTime;
      
      if (!userWithRole) {
        this.logger.error('User role not found after admin check', {
          operation: 'fetchUserRole',
          requestId,
          userId,
          email: user.email,
        });
        throw new ForbiddenException('Access denied: Role information not found');
      }

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

      this.logger.log('Authentication and admin authorization successful', {
        operation: 'canActivate',
        requestId,
        userId,
        email: user.email,
        userRole: userWithRole.role,
        authTime: `${authTime}ms`,
        dbTime: `${dbTime}ms`,
        totalTime: `${authTime + dbTime}ms`,
        timestamp: new Date().toISOString(),
      });

      return true;

    } catch (error) {
      this.logger.error('Authentication or admin authorization failed', {
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
      
      throw new ForbiddenException('Authentication and admin authorization failed');
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