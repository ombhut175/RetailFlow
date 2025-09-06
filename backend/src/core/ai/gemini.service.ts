import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, Type, ApiError } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { ENV, MESSAGES } from '../../common/constants/string-const';

/**
 * Gemini AI Service for text generation and multimodal capabilities
 * Uses the latest Google Gen AI SDK (@google/genai)
 * Follows hackathon rules: AI-first development with proper error handling
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI;
  private readonly defaultModel = 'gemini-2.5-flash'; // General text & multimodal tasks

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>(ENV.GEMINI_API_KEY);
    
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY not found in environment variables');
      throw new Error(MESSAGES.GEMINI_API_KEY_MISSING);
    }

    this.ai = new GoogleGenAI({ apiKey });
    this.logger.log('🤖 Gemini AI Service initialized successfully');
  }

  /**
   * Generate text content from a simple text prompt
   * @param prompt The text prompt to generate content from
   * @param model Optional model to use (defaults to gemini-2.5-flash)
   * @returns Generated text response
   */
  async generateText(prompt: string, model?: string): Promise<string> {
    try {
      this.logger.debug(`Generating text with prompt: ${prompt.substring(0, 100)}...`);
      
      const response = await this.ai.models.generateContent({
        model: model || this.defaultModel,
        contents: prompt,
        config: {
          // Disable thinking for faster response in hackathon
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      const generatedText = response.text || '';
      this.logger.debug(`Generated ${generatedText.length} characters`);
      
      return generatedText;
    } catch (error) {
      this.logger.error(`Text generation failed: ${error.message}`, error.stack);
      
      if (error instanceof ApiError) {
        throw new Error(`${MESSAGES.GEMINI_API_ERROR}: ${error.message} (Status: ${error.status})`);
      }
      
      throw new Error(`${MESSAGES.GEMINI_GENERATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Generate structured JSON output from a text prompt
   * Helper function to convert text to JSON with validation
   * @param prompt The text prompt
   * @param schema Optional JSON schema for structured output
   * @returns Parsed JSON object
   */
  async generateJson<T = any>(
    prompt: string,
    schema?: any,
    model?: string
  ): Promise<T> {
    try {
      this.logger.debug(`Generating JSON with prompt: ${prompt.substring(0, 100)}...`);
      
      const response = await this.ai.models.generateContent({
        model: model || this.defaultModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          thinkingConfig: {
            thinkingBudget: 0 // Fast response for hackathon
          }
        }
      });

      const jsonText = (response.text || '').trim();
      
      try {
        const parsedJson = JSON.parse(jsonText) as T;
        this.logger.debug(`Successfully generated and parsed JSON`);
        return parsedJson;
      } catch (parseError) {
        this.logger.error(`JSON parsing failed: ${parseError.message}`);
        throw new Error(`${MESSAGES.GEMINI_JSON_PARSE_FAILED}: ${parseError.message}`);
      }
    } catch (error) {
      this.logger.error(`JSON generation failed: ${error.message}`, error.stack);
      
      if (error instanceof ApiError) {
        throw new Error(`${MESSAGES.GEMINI_API_ERROR}: ${error.message} (Status: ${error.status})`);
      }
      
      throw new Error(`${MESSAGES.GEMINI_GENERATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Generate an array of JSON objects from a text prompt
   * Helper function to convert text to array of JSON objects
   * @param prompt The text prompt
   * @param itemSchema Schema for individual array items
   * @returns Array of parsed JSON objects
   */
  async generateJsonArray<T = any>(
    prompt: string,
    itemSchema?: any,
    model?: string
  ): Promise<T[]> {
    try {
      this.logger.debug(`Generating JSON array with prompt: ${prompt.substring(0, 100)}...`);
      
      const arraySchema = {
        type: Type.ARRAY,
        items: itemSchema || {
          type: Type.OBJECT,
          properties: {}, // Flexible object if no schema provided
        }
      };

      const response = await this.ai.models.generateContent({
        model: model || this.defaultModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: arraySchema,
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      const jsonText = (response.text || '').trim();
      
      try {
        const parsedArray = JSON.parse(jsonText) as T[];
        
        if (!Array.isArray(parsedArray)) {
          throw new Error('Response is not an array');
        }

        this.logger.debug(`Successfully generated array with ${parsedArray.length} items`);
        return parsedArray;
      } catch (parseError) {
        this.logger.error(`JSON array parsing failed: ${parseError.message}`);
        throw new Error(`${MESSAGES.GEMINI_JSON_PARSE_FAILED}: ${parseError.message}`);
      }
    } catch (error) {
      this.logger.error(`JSON array generation failed: ${error.message}`, error.stack);
      
      if (error instanceof ApiError) {
        throw new Error(`${MESSAGES.GEMINI_API_ERROR}: ${error.message} (Status: ${error.status})`);
      }
      
      throw new Error(`${MESSAGES.GEMINI_GENERATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Smart text parsing helper - attempts to extract JSON from text response
   * Useful when the AI sometimes returns text with embedded JSON
   * @param text Input text that might contain JSON
   * @returns Extracted and parsed JSON or null if no valid JSON found
   */
  extractJsonFromText<T = any>(text: string): T | null {
    try {
      // Try to parse the entire text as JSON first
      return JSON.parse(text) as T;
    } catch {
      // If that fails, try to find JSON in the text using regex
      const jsonRegex = /\{.*\}|\[.*\]/s;
      const match = text.match(jsonRegex);
      
      if (match) {
        try {
          return JSON.parse(match[0]) as T;
        } catch (parseError) {
          this.logger.warn(`Found JSON-like text but parsing failed: ${parseError.message}`);
        }
      }
      
      return null;
    }
  }

  /**
   * Convert text to structured list/array format
   * Useful for extracting lists from natural language text
   * @param text Input text containing lists
   * @param prompt Additional instruction for list extraction
   * @returns Array of string items
   */
  async textToArray(text: string, prompt?: string): Promise<string[]> {
    try {
      const defaultPrompt = `Extract a list of items from the following text. Return only a JSON array of strings, no additional text:

${text}

${prompt || 'Return each item as a separate string in the array.'}`;

      const result = await this.generateJsonArray<string>(
        defaultPrompt,
        {
          type: Type.STRING,
          description: 'Individual item from the list'
        }
      );

      return result;
    } catch (error) {
      this.logger.error(`Text to array conversion failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Smart text to object conversion
   * Extracts structured data from unstructured text
   * @param text Input text to parse
   * @param instruction Instruction for what kind of object to extract
   * @param schema Optional schema for the expected object structure
   * @returns Parsed object
   */
  async textToObject<T = any>(
    text: string,
    instruction: string,
    schema?: any
  ): Promise<T> {
    try {
      const prompt = `${instruction}

Text to parse:
${text}

Return only a JSON object, no additional text.`;

      return await this.generateJson<T>(prompt, schema);
    } catch (error) {
      this.logger.error(`Text to object conversion failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate content with system instructions
   * Useful for role-based AI responses
   * @param prompt User prompt
   * @param systemInstruction System instruction to guide AI behavior
   * @param model Optional model to use
   * @returns Generated text
   */
  async generateWithSystemInstruction(
    prompt: string,
    systemInstruction: string,
    model?: string
  ): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: model || this.defaultModel,
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      return response.text || '';
    } catch (error) {
      this.logger.error(`System instruction generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Streaming text generation for real-time responses
   * Useful for chatbots and long-form content
   * @param prompt Text prompt
   * @param model Optional model to use
   * @returns AsyncIterable of text chunks
   */
  async* generateTextStream(
    prompt: string,
    model?: string
  ): AsyncIterable<string> {
    try {
      const responseStream = await this.ai.models.generateContentStream({
        model: model || this.defaultModel,
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      this.logger.error(`Streaming generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate and clean JSON text
   * Helper function to ensure valid JSON format
   * @param jsonText Potentially malformed JSON text
   * @returns Clean, valid JSON string
   */
  cleanJsonText(jsonText: string): string {
    // Remove markdown code blocks if present
    let cleaned = jsonText.replace(/```json\n?|```\n?/g, '').trim();
    
    // Remove any leading/trailing non-JSON text
    const jsonStart = cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : cleaned.indexOf('[');
    const jsonEnd = cleaned.lastIndexOf('}') !== -1 ? cleaned.lastIndexOf('}') : cleaned.lastIndexOf(']');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    
    return cleaned;
  }
}
