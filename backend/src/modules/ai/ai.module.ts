import { Module } from '@nestjs/common';
import { AiModule as CoreAiModule } from '../../core/ai/ai.module';
import { AiController } from './ai.controller';

/**
 * AI Module - Provides AI endpoints for testing Gemini functionality
 * Following hackathon rules: clear module organization
 */
@Module({
  imports: [CoreAiModule],
  controllers: [AiController],
})
export class AiModule {}
