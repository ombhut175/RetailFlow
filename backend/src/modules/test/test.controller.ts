import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { TestService } from './test.service';
import { successResponse } from '../../common/helpers/api-response.helper';

@ApiTags('test')
@Controller('test')
export class TestController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly testService: TestService,
  ) {}

  //#region ==================== SUPABASE TESTS ====================

  @Get('supabase-status')
  @ApiOperation({ summary: 'Check Supabase connection status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Supabase connection status checked successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Supabase connection status checked successfully' },
        data: { 
          type: 'object',
          properties: {
            connected: { type: 'boolean', example: true },
            timestamp: { type: 'string', example: '2023-01-01T00:00:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Supabase connection failed' })
  async checkSupabaseStatus() {
    try {
      const client = this.supabaseService.getClient();
      // Simple test to check if client is available
      const status = {
        connected: !!client,
        timestamp: new Date().toISOString(),
      };
      
      return successResponse(status, 'Supabase connection status checked successfully');
    } catch (error) {
      throw error;
    }
  }

  //#endregion

  //#region ==================== DATABASE TESTS ====================

  @Get('database-status')
  @ApiOperation({ summary: 'Check database infrastructure status' })
  @ApiResponse({
    status: 200,
    description: 'Database infrastructure status checked successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Database infrastructure is ready' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Database connection service is configured and ready to use when models are created' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Database infrastructure check failed' })
  async checkDatabaseStatus() {
    try {
      const result = await this.testService.testDatabaseConnection();
      return successResponse(result.data, result.message);
    } catch (error) {
      throw error;
    }
  }

  @Get('health-check-db')
  @ApiOperation({ summary: 'Test health_checking table by adding and removing a record' })
  @ApiResponse({
    status: 200,
    description: 'Health check table test completed successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Health check table test completed successfully' },
        data: {
          type: 'object',
          properties: {
            recordId: { type: 'number', example: 1 },
            operations: {
              type: 'object',
              properties: {
                insert: { type: 'string', example: 'successful' },
                delete: { type: 'string', example: 'successful' },
                verification: { type: 'string', example: 'successful' }
              }
            },
            timestamp: { type: 'string', example: '2023-01-01T00:00:00.000Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Health check table test failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Health check table test failed' },
        data: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Database connection error' },
            timestamp: { type: 'string', example: '2023-01-01T00:00:00.000Z' }
          }
        }
      }
    }
  })
  async testHealthCheckTable() {
    try {
      const result = await this.testService.testHealthCheckTable();
      return successResponse(result.data, result.message);
    } catch (error) {
      throw error;
    }
  }

  //#endregion
}
