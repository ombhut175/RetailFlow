import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //#region ==================== AUTHENTICATION ENDPOINTS ====================

  @ApiOperation({
    summary: 'User Login',
    description: 'Authenticate user with email and password. Returns access tokens and user information.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns access tokens and user information.',
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
            created_at: '2023-11-01T10:00:00.000Z',
            updated_at: '2023-12-01T10:00:00.000Z',
          },
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
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return successResponse(result, 'Login successful');
  }

  @ApiOperation({
    summary: 'User Registration',
    description: 'Create a new user account with email and password. Sends email confirmation.',
  })
  @ApiBody({
    type: SignupDto,
    description: 'User registration details',
  })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully. Email confirmation sent.',
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
            created_at: '2023-12-01T10:00:00.000Z',
            updated_at: '2023-12-01T10:00:00.000Z',
          },
          message: 'Please check your email for confirmation instructions',
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
    return successResponse(result, 'Account created successfully');
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
    description: 'Log out the current authenticated user and invalidate their session.',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
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
    description: 'Invalid or missing authorization token',
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
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await this.authService.getCurrentUser(token);

    const result = await this.authService.logout(user.id);
    return successResponse(result, 'Logged out successfully');
  }

  @ApiOperation({
    summary: 'Get Current User',
    description: 'Retrieve information about the currently authenticated user.',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
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
          created_at: '2023-11-01T10:00:00.000Z',
          updated_at: '2023-12-01T10:00:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authorization token',
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
  async getCurrentUser(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await this.authService.getCurrentUser(token);

    return successResponse(
      {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      'User information retrieved successfully'
    );
  }

  //#endregion
}
