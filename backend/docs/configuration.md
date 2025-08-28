# Configuration Guide

This document describes the configuration setup for Supabase, Swagger, and environment variables in this NestJS project.

## Environment Variables

### Loading Priority

The application loads environment variables in the following priority order:

1. **`.env.local`** (highest priority - local development overrides)
2. **`.env`** (fallback - shared/team configuration)

This allows developers to have local overrides without affecting team configuration.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NODE_ENV` | Environment mode | `development`, `production`, `test` |
| `PORT` | Server port | `3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SWAGGER_USER` | Username for Swagger access | `admin` |
| `SWAGGER_PASSWORD` | Password for Swagger access | `admin123` |

## Supabase Configuration

### Setup

1. **Environment File Setup**
   ```bash
   # For shared/team configuration (optional fallback)
   cp env.example.txt .env
   
   # For local development overrides (recommended)
   cp env.local.example .env.local
   
   # Edit the files with your actual values
   ```

2. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy the Project URL
   - Copy the anon/public key
   - Copy the service_role key (keep this secret!)

3. **Update Environment File**
   ```bash
   # Copy the example file
   cp env.example.txt .env
   
   # Edit .env with your actual values
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
   ```

### Usage

The Supabase service is available throughout the application:

```typescript
import { SupabaseService } from './core/supabase/supabase.service';

@Injectable()
export class YourService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async someMethod() {
    const client = this.supabaseService.getClient();
    // Use the client for database operations
  }
}
```

## Swagger Configuration

### Access

- **Development**: Available at `/api` (e.g., `http://localhost:3000/api`)
- **Production**: Disabled for security

### Features

- Interactive API documentation
- Request/response examples
- Authentication support (Bearer token)
- Organized by tags

### Adding Documentation

All new endpoints must include Swagger decorators:

```typescript
@ApiTags('users')
@ApiOperation({ summary: 'Get user by ID' })
@ApiResponse({ status: 200, description: 'User found' })
@ApiResponse({ status: 404, description: 'User not found' })
@Get(':id')
async getUser(@Param('id') id: string) {
  // Implementation
}
```

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "timestamp": "2023-01-01T00:00:00Z",
  "path": "/api/endpoint"
}
```

## Global Configuration

### CORS
- Enabled for all origins in development
- Credentials allowed
- Configured in `main.ts`

### Global Prefix
- All routes prefixed with `/api`
- Example: `/users` becomes `/api/users`

### Exception Handling
- Global exception filter for consistent error formatting
- Automatic logging of all errors
- Standardized error response structure

## Testing the Configuration

### Test Endpoints

1. **Health Check**: `GET /api/test/supabase-status`
   - Verifies Supabase connection
   - Returns connection status and timestamp

2. **Swagger Docs**: `GET /api`
   - Interactive API documentation
   - Test endpoints directly from the browser

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loaded**
   - Check if `.env.local` or `.env` file exists in project root
   - Verify the loading priority: `.env.local` > `.env`
   - Check variable names match exactly
   - Restart the application after changes
   - Look for console logs showing which files were loaded

2. **Supabase Connection Failed**
   - Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - Check if Supabase project is active
   - Ensure network connectivity

3. **Swagger Not Accessible**
   - Check `NODE_ENV` is not set to `production`
   - Verify the `/api` endpoint is accessible
   - Check browser console for errors

### Logs

The application logs important events:
- Supabase connection status
- Environment variable loading
- Swagger initialization
- Error details with timestamps

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different keys for development/production
   - Rotate keys regularly

2. **Supabase Keys**
   - `SUPABASE_ANON_KEY` is safe for client-side use
   - `SUPABASE_SERVICE_ROLE_KEY` should never be exposed to clients
   - Use Row Level Security (RLS) policies

3. **Swagger in Production**
   - Automatically disabled in production
   - Consider adding authentication for development environments
   - Monitor access logs
