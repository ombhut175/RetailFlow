import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { GeminiService } from '../../core/ai/gemini.service';
import { successResponse, errorResponse } from '../../common/helpers/api-response.helper';

/**
 * AI Controller - Test endpoints for Gemini AI service
 * Demonstrates all helper functions following hackathon rules
 */
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly geminiService: GeminiService) {}

  /**
   * Health check endpoint for Gemini service
   * GET /ai/test - Simple test to verify service is working
   */
  @Get('test')
  async testGeminiService() {
    try {
      this.logger.log('Testing Gemini service with simple prompt');
      
      // Simple test prompt
      const testPrompt = "Say 'Hello from Gemini AI!' and explain what you are in one sentence.";
      
      const result = await this.geminiService.generateText(testPrompt);
      
      return successResponse({
        status: 'working',
        response: result,
        timestamp: new Date().toISOString(),
        model: 'gemini-2.5-flash'
      }, 'Gemini service is working correctly');
    } catch (error) {
      this.logger.error(`Gemini service test failed: ${error.message}`, error.stack);
      return errorResponse(500, `Gemini service error: ${error.message}`);
    }
  }

  /**
   * Comprehensive test of all Gemini service functions
   * GET /ai/test-all - Tests text generation, JSON generation, and helper functions
   */
  @Get('test-all')
  async testAllGeminiFunctions() {
    try {
      this.logger.log('Running comprehensive Gemini service tests');
      
      const results = {
        timestamp: new Date().toISOString(),
        tests: {} as any
      };

      // Test 1: Simple text generation
      this.logger.log('Testing text generation...');
      const textResult = await this.geminiService.generateText(
        "Generate a simple greeting message for a hackathon project"
      );
      results.tests.textGeneration = {
        status: 'success',
        response: textResult,
        responseLength: textResult.length
      };

      // Test 2: JSON generation
      this.logger.log('Testing JSON generation...');
      const jsonResult = await this.geminiService.generateJson(
        "Create a sample user object with name, age, and skills for a developer",
        {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            age: { type: 'NUMBER' },
            skills: { type: 'ARRAY', items: { type: 'STRING' } }
          }
        }
      );
      results.tests.jsonGeneration = {
        status: 'success',
        response: jsonResult
      };

      // Test 3: Text to array conversion
      this.logger.log('Testing text to array conversion...');
      const arrayResult = await this.geminiService.textToArray(
        "I need to learn JavaScript, Python, TypeScript, and React",
        "Extract the programming languages and technologies as separate items"
      );
      results.tests.textToArray = {
        status: 'success',
        response: arrayResult,
        count: arrayResult.length
      };

      // Test 4: JSON extraction from text
      this.logger.log('Testing JSON extraction...');
      const messyText = `Here's some data: {"name": "Test User", "status": "active"} - hope this helps!`;
      const extractedJson = this.geminiService.extractJsonFromText(messyText);
      results.tests.jsonExtraction = {
        status: extractedJson ? 'success' : 'failed',
        response: extractedJson
      };

      // Calculate overall status
      const allTestsPassed = Object.values(results.tests).every(
        (test: any) => test.status === 'success'
      );

      return successResponse({
        overallStatus: allTestsPassed ? 'all_tests_passed' : 'some_tests_failed',
        testsRun: Object.keys(results.tests).length,
        ...results
      }, 'Gemini service comprehensive test completed');

    } catch (error) {
      this.logger.error(`Comprehensive test failed: ${error.message}`, error.stack);
      return errorResponse(500, `Test suite error: ${error.message}`);
    }
  }

  /**
   * Simple text generation endpoint
   * GET /ai/generate?prompt=your-prompt-here
   */
  @Get('generate')
  async generateText(@Query('prompt') prompt: string) {
    try {
      if (!prompt) {
        return errorResponse(400, 'Prompt is required');
      }

      this.logger.log(`Generating text for prompt: ${prompt.substring(0, 50)}...`);
      
      const result = await this.geminiService.generateText(prompt);
      
      return successResponse({
        text: result,
        length: result.length
      }, 'Text generated successfully');
    } catch (error) {
      this.logger.error(`Text generation failed: ${error.message}`);
      return errorResponse(500, error.message);
    }
  }

  /**
   * JSON generation endpoint with structured output
   * POST /ai/json
   * Body: { "prompt": "Generate JSON for...", "schema"?: {...} }
   */
  @Post('json')
  async generateJson(@Body() body: { prompt: string; schema?: any }) {
    try {
      const { prompt, schema } = body;
      
      if (!prompt) {
        return errorResponse(400, 'Prompt is required');
      }

      this.logger.log(`Generating JSON for prompt: ${prompt.substring(0, 50)}...`);
      
      const result = await this.geminiService.generateJson(prompt, schema);
      
      return successResponse(result, 'JSON generated successfully');
    } catch (error) {
      this.logger.error(`JSON generation failed: ${error.message}`);
      return errorResponse(500, error.message);
    }
  }

  /**
   * JSON array generation endpoint
   * POST /ai/json-array
   * Body: { "prompt": "Generate array of...", "itemSchema"?: {...} }
   */
  @Post('json-array')
  async generateJsonArray(@Body() body: { prompt: string; itemSchema?: any }) {
    try {
      const { prompt, itemSchema } = body;
      
      if (!prompt) {
        return errorResponse(400, 'Prompt is required');
      }

      this.logger.log(`Generating JSON array for prompt: ${prompt.substring(0, 50)}...`);
      
      const result = await this.geminiService.generateJsonArray(prompt, itemSchema);
      
      return successResponse({
        data: result,
        count: result.length
      }, 'JSON array generated successfully');
    } catch (error) {
      this.logger.error(`JSON array generation failed: ${error.message}`);
      return errorResponse(500, error.message);
    }
  }

  /**
   * Text to array conversion endpoint
   * POST /ai/text-to-array
   * Body: { "text": "text with lists...", "instruction"?: "extract items as..." }
   */
  @Post('text-to-array')
  async textToArray(@Body() body: { text: string; instruction?: string }) {
    try {
      const { text, instruction } = body;
      
      if (!text) {
        return errorResponse(400, 'Text is required');
      }

      this.logger.log(`Converting text to array: ${text.substring(0, 50)}...`);
      
      const result = await this.geminiService.textToArray(text, instruction);
      
      return successResponse({
        items: result,
        count: result.length
      }, 'Text converted to array successfully');
    } catch (error) {
      this.logger.error(`Text to array conversion failed: ${error.message}`);
      return errorResponse(500, error.message);
    }
  }

  /**
   * Text to structured object conversion endpoint
   * POST /ai/text-to-object
   * Body: { "text": "unstructured text...", "instruction": "extract as object with...", "schema"?: {...} }
   */
  @Post('text-to-object')
  async textToObject(@Body() body: { text: string; instruction: string; schema?: any }) {
    try {
      const { text, instruction, schema } = body;
      
      if (!text || !instruction) {
        return errorResponse(400, 'Text and instruction are required');
      }

      this.logger.log(`Converting text to object: ${text.substring(0, 50)}...`);
      
      const result = await this.geminiService.textToObject(text, instruction, schema);
      
      return successResponse(result, 'Text converted to object successfully');
    } catch (error) {
      this.logger.error(`Text to object conversion failed: ${error.message}`);
      return errorResponse(500, error.message);
    }
  }

  /**
   * Generate content with system instructions
   * POST /ai/system-prompt
   * Body: { "prompt": "user prompt", "systemInstruction": "You are a helpful assistant..." }
   */
  @Post('system-prompt')
  async generateWithSystemInstruction(@Body() body: { prompt: string; systemInstruction: string }) {
    try {
      const { prompt, systemInstruction } = body;
      
      if (!prompt || !systemInstruction) {
        return errorResponse(400, 'Both prompt and systemInstruction are required');
      }

      this.logger.log(`Generating with system instruction: ${prompt.substring(0, 50)}...`);
      
      const result = await this.geminiService.generateWithSystemInstruction(prompt, systemInstruction);
      
      return successResponse({
        text: result,
        length: result.length
      }, 'Content generated with system instruction successfully');
    } catch (error) {
      this.logger.error(`System instruction generation failed: ${error.message}`);
      return errorResponse(500, error.message);
    }
  }

  /**
   * Extract JSON from existing text
   * POST /ai/extract-json
   * Body: { "text": "some text with embedded JSON..." }
   */
  @Post('extract-json')
  async extractJsonFromText(@Body() body: { text: string }) {
    try {
      const { text } = body;
      
      if (!text) {
        return errorResponse(400, 'Text is required');
      }

      this.logger.log(`Extracting JSON from text: ${text.substring(0, 50)}...`);
      
      const result = this.geminiService.extractJsonFromText(text);
      
      if (result === null) {
        return errorResponse(400, 'No valid JSON found in the text');
      }
      
      return successResponse(result, 'JSON extracted successfully');
    } catch (error) {
      this.logger.error(`JSON extraction failed: ${error.message}`);
      return errorResponse(500, error.message);
    }
  }

  /**
   * Clean and validate JSON text
   * POST /ai/clean-json
   * Body: { "jsonText": "possibly malformed JSON..." }
   */
  @Post('clean-json')
  async cleanJsonText(@Body() body: { jsonText: string }) {
    try {
      const { jsonText } = body;
      
      if (!jsonText) {
        return errorResponse(400, 'JSON text is required');
      }

      this.logger.log(`Cleaning JSON text: ${jsonText.substring(0, 50)}...`);
      
      const cleaned = this.geminiService.cleanJsonText(jsonText);
      
      // Try to validate the cleaned JSON
      let isValid = false;
      let parsed = null;
      
      try {
        parsed = JSON.parse(cleaned);
        isValid = true;
      } catch (error) {
        // JSON is still invalid
      }
      
      return successResponse({
        original: jsonText,
        cleaned,
        isValid,
        parsed: isValid ? parsed : null
      }, 'JSON text cleaned successfully');
    } catch (error) {
      this.logger.error(`JSON cleaning failed: ${error.message}`);
      return errorResponse(500, error.message);
    }
  }
}
