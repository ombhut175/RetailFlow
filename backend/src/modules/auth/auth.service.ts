import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { MESSAGES } from '../../common/constants/string-const';
import { LoginDto, SignupDto, ForgotPasswordDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async login(loginDto: LoginDto) {
    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (error) {
        this.logger.error(`Login failed for ${loginDto.email}: ${error.message}`);

        // Handle specific Supabase auth errors
        if (error.message.includes('Invalid login credentials')) {
          throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);
        }
        if (error.message.includes('Email not confirmed')) {
          throw new UnauthorizedException('Please confirm your email before logging in');
        }

        throw new UnauthorizedException(error.message);
      }

      this.logger.log(`User ${loginDto.email} logged in successfully`);
      return {
        message: MESSAGES.LOGIN_SUCCESSFUL,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected login error: ${error.message}`);
      throw new BadRequestException(MESSAGES.UNEXPECTED_ERROR);
    }
  }

  async signup(signupDto: SignupDto) {
    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase.auth.signUp({
        email: signupDto.email,
        password: signupDto.password,
        options: {
          emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/confirm`,
        },
      });

      if (error) {
        this.logger.error(`Signup failed for ${signupDto.email}: ${error.message}`);

        // Handle specific Supabase auth errors
        if (error.message.includes('User already registered')) {
          throw new BadRequestException(MESSAGES.EMAIL_ALREADY_EXISTS);
        }
        if (error.message.includes('Password should be at least')) {
          throw new BadRequestException(MESSAGES.WEAK_PASSWORD);
        }
        if (error.message.includes('Unable to validate email address')) {
          throw new BadRequestException(MESSAGES.INVALID_EMAIL);
        }

        throw new BadRequestException(error.message);
      }

      this.logger.log(`User ${signupDto.email} signed up successfully`);

      return {
        message: MESSAGES.SIGNUP_SUCCESSFUL,
        user: data.user,
        session: data.session,
        emailConfirmationRequired: !data.session, // If no session, email confirmation is required
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected signup error: ${error.message}`);
      throw new BadRequestException(MESSAGES.UNEXPECTED_ERROR);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const supabase = this.supabaseService.getClient();

      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordDto.email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password`,
      });

      if (error) {
        this.logger.error(`Password reset failed for ${forgotPasswordDto.email}: ${error.message}`);

        // For security reasons, we don't want to reveal if the email exists or not
        // So we return success even if the email doesn't exist
        if (error.message.includes('User not found')) {
          this.logger.warn(`Password reset attempted for non-existent email: ${forgotPasswordDto.email}`);
          return { message: MESSAGES.PASSWORD_RESET_SENT };
        }

        throw new BadRequestException(error.message);
      }

      this.logger.log(`Password reset email sent to ${forgotPasswordDto.email}`);
      return { message: MESSAGES.PASSWORD_RESET_SENT };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected forgot password error: ${error.message}`);
      throw new BadRequestException(MESSAGES.UNEXPECTED_ERROR);
    }
  }

  async logout(userId: string) {
    try {
      const supabase = this.supabaseService.getClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        this.logger.error(`Logout failed for user ${userId}: ${error.message}`);
        throw new BadRequestException('Logout failed');
      }

      this.logger.log(`User ${userId} logged out successfully`);
      return { message: 'Logged out successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected logout error: ${error.message}`);
      throw new BadRequestException(MESSAGES.UNEXPECTED_ERROR);
    }
  }

  async getCurrentUser(token: string) {
    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase.auth.getUser(token);

      if (error) {
        this.logger.error(`Failed to get current user: ${error.message}`);
        throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
      }

      return data.user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Unexpected getCurrentUser error: ${error.message}`);
      throw new BadRequestException(MESSAGES.UNEXPECTED_ERROR);
    }
  }
}
