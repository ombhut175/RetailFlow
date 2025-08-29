import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Headers,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  SignupDto,
  ForgotPasswordDto,
  StandardApiResponseDto,
  LoginResponseDataDto,
  SignupResponseDataDto,
  ForgotPasswordResponseDataDto,
  LogoutResponseDataDto,
  UserInfoDto,
  ErrorResponseDto,
} from './dto';
import { successResponse } from '../../common/helpers/api-response.helper';
import { COOKIES } from '../../common/constants/string-const';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //#region ==================== AUTHENTICATION ENDPOINTS ====================

  @ApiOperation({
    summary: 'User Login',
    description: 'Authenticate user with email and password. Returns access tokens, user information, and verification status. Creates or updates user record in public.users table.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns access tokens, user information, verification status, and public user record.',
    type: StandardApiResponseDto<LoginResponseDataDto>,
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Login successful',
        data: {
          tokens: {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            token_type: 'bearer',
            expires_in: 3600,
          },
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            email_confirmed_at: '2023-12-01T10:00:00.000Z',
            isEmailVerified: true,
            created_at: '2023-11-01T10:00:00.000Z',
            updated_at: '2023-12-01T10:00:00.000Z',
          },
          publicUser: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            isEmailVerified: true,
            createdAt: '2023-11-01T10:00:00.000Z',
            updatedAt: '2023-12-01T10:00:00.000Z',
          },
          isEmailVerified: true,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
    type: ErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid email or password format',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/api/auth/login',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials provided',
    type: ErrorResponseDto,
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/api/auth/login',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during authentication',
    type: ErrorResponseDto,
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    
    // Set never-expiring cookie with the access token
    if (result.session?.access_token) {
      response.cookie(COOKIES.AUTH_TOKEN, result.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        // No maxAge or expires means the cookie never expires (session cookie that persists)
      });
    }
    
    // Format response to match expected DTO structure
    const responseData = {
      tokens: {
        access_token: result.session?.access_token || '',
        refresh_token: result.session?.refresh_token || '',
        token_type: result.session?.token_type || 'bearer',
        expires_in: result.session?.expires_in || 3600,
      },
      user: {
        id: result.user?.id || '',
        email: result.user?.email || '',
        email_confirmed_at: result.user?.email_confirmed_at || null,
        isEmailVerified: result.isEmailVerified || false,
        created_at: result.user?.created_at || '',
        updated_at: result.user?.updated_at || '',
      },
      publicUser: result.publicUser ? {
        id: result.publicUser.id,
        email: result.publicUser.email,
        isEmailVerified: result.publicUser.isEmailVerified,
        createdAt: result.publicUser.createdAt.toISOString(),
        updatedAt: result.publicUser.updatedAt.toISOString(),
      } : null,
      isEmailVerified: result.isEmailVerified || false,
    };
    
    return successResponse(responseData, 'Login successful');
  }

  @ApiOperation({
    summary: 'User Registration',
    description: 'Create a new user account with email and password. Creates user record in public.users table with verified status as false. Sends email confirmation.',
  })
  @ApiBody({
    type: SignupDto,
    description: 'User registration details',
  })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully. User record created in public.users table with verification status false. Email confirmation sent.',
    type: StandardApiResponseDto<SignupResponseDataDto>,
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Account created successfully',
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'jane.smith@example.com',
            email_confirmed_at: null,
            isEmailVerified: false,
            created_at: '2023-12-01T10:00:00.000Z',
            updated_at: '2023-12-01T10:00:00.000Z',
          },
          publicUser: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'jane.smith@example.com',
            isEmailVerified: false,
            createdAt: '2023-12-01T10:00:00.000Z',
            updatedAt: '2023-12-01T10:00:00.000Z',
          },
          message: 'Please check your email for confirmation instructions',
          emailConfirmationRequired: true,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, validation errors, or email already exists',
    type: ErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: 'Email already registered or password too weak',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/api/auth/signup',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during account creation',
    type: ErrorResponseDto,
  })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    const result = await this.authService.signup(signupDto);
    
    // Format response to match expected DTO structure
    const responseData = {
      user: {
        id: result.user?.id || '',
        email: result.user?.email || '',
        email_confirmed_at: result.user?.email_confirmed_at || null,
        isEmailVerified: false, // Always false on signup
        created_at: result.user?.created_at || '',
        updated_at: result.user?.updated_at || '',
      },
      publicUser: result.publicUser ? {
        id: result.publicUser.id,
        email: result.publicUser.email,
        isEmailVerified: result.publicUser.isEmailVerified,
        createdAt: result.publicUser.createdAt.toISOString(),
        updatedAt: result.publicUser.updatedAt.toISOString(),
      } : null,
      message: 'Please check your email for confirmation instructions',
      emailConfirmationRequired: result.emailConfirmationRequired || true,
    };
    
    return successResponse(responseData, 'Account created successfully');
  }

  @ApiOperation({
    summary: 'Forgot Password',
    description: 'Send password reset instructions to user email address.',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Email address for password reset',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
    type: StandardApiResponseDto<ForgotPasswordResponseDataDto>,
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Password reset email sent',
        data: {
          message: 'Password reset instructions have been sent to your email',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid email format or validation errors',
    type: ErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: 'Please provide a valid email address',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/api/auth/forgot-password',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Email address not found in system',
    type: ErrorResponseDto,
    schema: {
      example: {
        statusCode: 404,
        message: 'No account found with this email address',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/api/auth/forgot-password',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during password reset',
    type: ErrorResponseDto,
  })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return successResponse(result, 'Password reset email sent');
  }

  @ApiOperation({
    summary: 'User Logout',
    description: 'Log out the current authenticated user and invalidate their session. Uses authentication cookie instead of Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
    type: StandardApiResponseDto<LogoutResponseDataDto>,
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Logged out successfully',
        data: {
          message: 'Successfully logged out',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication cookie',
    type: ErrorResponseDto,
    schema: {
      example: {
        statusCode: 401,
        message: 'Authorization token required',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/api/auth/logout',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during logout',
    type: ErrorResponseDto,
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = request.cookies[COOKIES.AUTH_TOKEN];
    
    if (!token) {
      throw new UnauthorizedException('Authorization token required');
    }

    const user = await this.authService.getCurrentUser(token);

    // Clear the authentication cookie
    response.clearCookie(COOKIES.AUTH_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    const result = await this.authService.logout(user.id);
    return successResponse(result, 'Logged out successfully');
  }

  @ApiOperation({
    summary: 'Get Current User',
    description: 'Retrieve information about the currently authenticated user. Uses authentication cookie instead of Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: StandardApiResponseDto<UserInfoDto>,
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'User information retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'john.doe@example.com',
          email_confirmed_at: '2023-12-01T10:00:00.000Z',
          isEmailVerified: true,
          created_at: '2023-11-01T10:00:00.000Z',
          updated_at: '2023-12-01T10:00:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication cookie',
    type: ErrorResponseDto,
    schema: {
      example: {
        statusCode: 401,
        message: 'Authorization token required',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/api/auth/me',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error while retrieving user information',
    type: ErrorResponseDto,
  })
  @Get('me')
  async getCurrentUser(@Req() request: Request) {
    const token = request.cookies[COOKIES.AUTH_TOKEN];
    
    if (!token) {
      throw new UnauthorizedException('Authorization token required');
    }

    const user = await this.authService.getCurrentUser(token);

    // Get public user record to check verification status
    const authService = this.authService as any;
    let isEmailVerified = false;
    let publicUser = null;
    
    try {
      if (authService.usersRepository) {
        publicUser = await authService.usersRepository.findById(user.id);
        isEmailVerified = publicUser?.isEmailVerified || false;
      }
    } catch (error) {
      // If public user lookup fails, continue without verification status
    }

    return successResponse(
      {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        isEmailVerified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      'User information retrieved successfully'
    );
  }

  //#endregion
}
