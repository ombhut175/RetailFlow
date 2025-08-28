import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { successResponse } from './common/helpers/api-response.helper';
import { API_MESSAGES } from './common/constants/string-const';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ 
    status: 200, 
    description: 'Hello message retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Hello message retrieved successfully' },
        data: { type: 'string', example: 'Hello World!' }
      }
    }
  })
  getHello() {
    const message = this.appService.getHello();
    return successResponse(message, 'Hello message retrieved successfully');
  }
}
