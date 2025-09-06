import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { UserRolesRepository } from '../../core/database/repositories/user-roles.repository';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { COOKIES } from '../constants/string-const';

/**
 * ManagerGuard for MANAGER+ access (ADMIN, MANAGER)
 * Handles authentication via Supabase and manager-level role checking
 */
@Injectable()
export class ManagerGuard implements CanActivate {
  private readonly logger = new Logger(ManagerGuard.name);

  constructor(
    private userRolesRepository: UserRolesRepository,
    private supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = randomUUID();

    this.logger.log('Authentication and manager authorization attempt started', {
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

      // Step 3: Check if user has manager-level access or higher (ADMIN, MANAGER)
      const startDbTime = Date.now();
      const isManagerOrAbove = await this.userRolesRepository.isManagerOrAbove(userId);
      
      if (!isManagerOrAbove) {
        // Get user role for detailed logging
        const userWithRole = await this.userRolesRepository.findUserWithRole(userId);
        const dbTime = Date.now() - startDbTime;
        
        this.logger.warn('Manager access denied', {
          operation: 'checkManagerRole',
          requestId,
          userId,
          email: user.email,
          userRole: userWithRole?.role || 'NO_ROLE',
          requiredMinimumRole: 'MANAGER',
          allowedRoles: ['ADMIN', 'MANAGER'],
          authTime: `${authTime}ms`,
          dbTime: `${dbTime}ms`,
        });
        throw new ForbiddenException('Access denied: Manager privileges or higher required');
      }

      // Step 4: Fetch and attach full user and role information to request
      const userWithRole = await this.userRolesRepository.findUserWithRole(userId);
      const dbTime = Date.now() - startDbTime;
      
      if (!userWithRole) {
        this.logger.error('User role not found after manager check', {
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

      this.logger.log('Authentication and manager authorization successful', {
        operation: 'canActivate',
        requestId,
        userId,
        email: user.email,
        userRole: userWithRole.role,
        requiredMinimumRole: 'MANAGER',
        allowedRoles: ['ADMIN', 'MANAGER'],
        authTime: `${authTime}ms`,
        dbTime: `${dbTime}ms`,
        totalTime: `${authTime + dbTime}ms`,
        timestamp: new Date().toISOString(),
      });

      return true;

    } catch (error) {
      this.logger.error('Authentication or manager authorization failed', {
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
      
      throw new ForbiddenException('Authentication and manager authorization failed');
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