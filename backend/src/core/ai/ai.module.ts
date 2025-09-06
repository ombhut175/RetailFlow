import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './gemini.service';

/**
 * AI Module - Provides AI services including Gemini integration
 * Following hackathon rules: centralized service management
 */
@Module({
  imports: [ConfigModule],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class AiModule {}
