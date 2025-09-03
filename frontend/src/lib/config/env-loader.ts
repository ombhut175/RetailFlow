// Environment loader using @next/env for reliable variable loading
// This addresses the Next.js 15 + Turbopack environment variable injection issue

import { loadEnvConfig } from '@next/env';

// Load environment variables from .env files
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Define the environment configuration with client-side fallbacks
const ENV_CONFIG = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5099',
  nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
} as const;

export const ENV = ENV_CONFIG;

export function getEnv() {
  return ENV_CONFIG;
}

export function getApiBaseURL(prefix: string): string {
  const base = ENV.apiBaseUrl.replace(/\/+$/g, '');
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '');
  return base ? `${base}/${cleanPrefix}` : `/${cleanPrefix}`;
}
