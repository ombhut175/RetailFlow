/**
 * Example test cases for role-based guards
 * This file shows how to test the guards in your application
 * Move these tests to your actual test files (*.spec.ts)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { AdminGuard } from './admin.guard';
import { UserRolesRepository } from '../../core/database/repositories/user-roles.repository';

describe('Role-Based Guards', () => {
  let rolesGuard: RolesGuard;
  let adminGuard: AdminGuard;
  let userRolesRepository: UserRolesRepository;
  let reflector: Reflector;

  const mockUserRolesRepository = {
    findUserWithRole: jest.fn(),
    userHasMinimumRole: jest.fn(),
    isAdmin: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  };

  let mockRequest: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        AdminGuard,
        {
          provide: UserRolesRepository,
          useValue: mockUserRolesRepository,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    adminGuard = module.get<AdminGuard>(AdminGuard);
    userRolesRepository = module.get<UserRolesRepository>(UserRolesRepository);
    reflector = module.get<Reflector>(Reflector);

    // Reset mocks
    jest.clearAllMocks();

    // Default mock request with authenticated user
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        supabaseUser: {},
      },
    };
  });

  describe('RolesGuard', () => {
    it('should allow access when no role requirements are set', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const result = await rolesGuard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });

    it('should deny access when user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);

      await expect(rolesGuard.canActivate(mockExecutionContext as any))
        .rejects.toThrow(ForbiddenException);
    });

    it('should allow access for ADMIN user with minimum role MANAGER', async () => {
      mockReflector.getAllAndOverride
        .mockReturnValueOnce(undefined) // requiredRoles
        .mockReturnValueOnce('MANAGER'); // minimumRole

      mockUserRolesRepository.findUserWithRole.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'ADMIN',
        permissions: ['MANAGE_USERS'],
        is_role_active: true,
      });

      mockUserRolesRepository.userHasMinimumRole.mockResolvedValue(true);

      const result = await rolesGuard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
      expect(mockRequest.user.role).toEqual({
        role: 'ADMIN',
        permissions: ['MANAGE_USERS'],
        is_role_active: true,
      });
    });

    it('should deny access for STAFF user with minimum role MANAGER', async () => {
      mockReflector.getAllAndOverride
        .mockReturnValueOnce(undefined) // requiredRoles
        .mockReturnValueOnce('MANAGER'); // minimumRole

      mockUserRolesRepository.findUserWithRole.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'STAFF',
        permissions: [],
        is_role_active: true,
      });

      mockUserRolesRepository.userHasMinimumRole.mockResolvedValue(false);

      await expect(rolesGuard.canActivate(mockExecutionContext as any))
        .rejects.toThrow('Access denied: Insufficient role permissions');
    });

    it('should allow access for exact role match', async () => {
      mockReflector.getAllAndOverride
        .mockReturnValueOnce(['MANAGER']) // requiredRoles
        .mockReturnValueOnce(undefined); // minimumRole

      mockUserRolesRepository.findUserWithRole.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'MANAGER',
        permissions: ['MANAGE_INVENTORY'],
        is_role_active: true,
      });

      const result = await rolesGuard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });

    it('should deny access when user has no role assigned', async () => {
      mockReflector.getAllAndOverride
        .mockReturnValueOnce(['STAFF']) // requiredRoles
        .mockReturnValueOnce(undefined); // minimumRole

      mockUserRolesRepository.findUserWithRole.mockResolvedValue(null);

      await expect(rolesGuard.canActivate(mockExecutionContext as any))
        .rejects.toThrow('Access denied: No role assigned');
    });

    it('should deny access when user role is inactive', async () => {
      mockReflector.getAllAndOverride
        .mockReturnValueOnce(['STAFF']) // requiredRoles
        .mockReturnValueOnce(undefined); // minimumRole

      mockUserRolesRepository.findUserWithRole.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'STAFF',
        permissions: [],
        is_role_active: false, // Inactive role
      });

      await expect(rolesGuard.canActivate(mockExecutionContext as any))
        .rejects.toThrow('Access denied: Role is inactive');
    });
  });

  describe('AdminGuard', () => {
    it('should allow access for ADMIN user', async () => {
      mockUserRolesRepository.isAdmin.mockResolvedValue(true);
      mockUserRolesRepository.findUserWithRole.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'ADMIN',
        permissions: ['SYSTEM_ADMIN'],
        is_role_active: true,
      });

      const result = await adminGuard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
      expect(mockRequest.user.role.role).toBe('ADMIN');
    });

    it('should deny access for non-ADMIN user', async () => {
      mockUserRolesRepository.isAdmin.mockResolvedValue(false);
      mockUserRolesRepository.findUserWithRole.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'MANAGER',
        permissions: ['MANAGE_INVENTORY'],
        is_role_active: true,
      });

      await expect(adminGuard.canActivate(mockExecutionContext as any))
        .rejects.toThrow('Access denied: Admin privileges required');
    });

    it('should deny access when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await expect(adminGuard.canActivate(mockExecutionContext as any))
        .rejects.toThrow('User must be authenticated for admin access');
    });
  });
});

/**
 * Example integration test showing how to test endpoints with guards
 */
/*
describe('Products Controller (Integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Your main app module
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup test user and get auth token
    authToken = await setupTestUserAndGetToken(app);
  });

  it('should allow ADMIN to delete products', async () => {
    // Assign ADMIN role to test user
    await assignRoleToTestUser('ADMIN');

    return request(app.getHttpServer())
      .delete('/api/products/test-product-id')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('should deny STAFF from deleting products', async () => {
    // Assign STAFF role to test user
    await assignRoleToTestUser('STAFF');

    return request(app.getHttpServer())
      .delete('/api/products/test-product-id')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403)
      .expect(res => {
        expect(res.body.message).toContain('Admin privileges required');
      });
  });

  it('should allow MANAGER to view products', async () => {
    // Assign MANAGER role to test user
    await assignRoleToTestUser('MANAGER');

    return request(app.getHttpServer())
      .get('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
*/