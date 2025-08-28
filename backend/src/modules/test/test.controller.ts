import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { successResponse } from '../../common/helpers/api-response.helper';

@ApiTags('test')
@Controller('test')
export class TestController {
  constructor(private readonly supabaseService: SupabaseService) {}

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
}
