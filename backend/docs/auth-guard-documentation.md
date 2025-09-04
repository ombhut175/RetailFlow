# AuthGuard Documentation

## Overview
The `AuthGuard` is a NestJS guard that validates Supabase authentication tokens and attaches user information to requests. It follows the project's AI-first development rules with comprehensive logging, proper error handling, and type safety.

## Features
- ✅ **Supabase Auth Integration**: Uses Supabase Auth for token validation
- ✅ **Request Token Extraction**: Supports both `Authorization: Bearer` headers and cookies
- ✅ **User Info Attachment**: Attaches user ID, email, and full Supabase user object to request
- ✅ **Comprehensive Logging**: Detailed logging with request correlation IDs
- ✅ **Type Safety**: TypeScript interfaces for authenticated requests
- ✅ **Error Handling**: Proper error messages and stack traces in development

## Usage

### Basic Usage

```typescript
@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth() // For Swagger documentation
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
```

### Extract Specific User Properties

```typescript
@Controller('orders')
export class OrdersController {
  @Post()
  @UseGuards(AuthGuard)
  async createOrder(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') userEmail: string,
    @Body() createOrderDto: CreateOrderDto
  ) {
    // Use userId and userEmail directly
    return this.ordersService.create(userId, createOrderDto);
  }
}
```

### Access Full Supabase User Object

```typescript
@Controller('profile')
export class ProfileController {
  @Get('detailed')
  @UseGuards(AuthGuard)
  async getDetailedProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      metadata: user.supabaseUser.user_metadata,
      lastSignIn: user.supabaseUser.last_sign_in_at,
      emailConfirmed: user.supabaseUser.email_confirmed_at,
    };
  }
}
```

## Request Object Structure

After successful authentication, the request object contains:

```typescript
interface AuthenticatedRequest extends Request {
  user: {
    id: string;           // Supabase user UUID
    email: string;        // User's email address
    supabaseUser: any;    // Full Supabase user object
  };
}
```

## Token Extraction

The guard extracts tokens in this order:
1. **Authorization Header**: `Authorization: Bearer <token>`
2. **Cookies**: `auth_token` cookie (set automatically by login endpoint)

### Frontend Integration Examples

**JavaScript/Fetch:**
```javascript
const response = await fetch('/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json',
  },
});
```

**Axios:**
```javascript
const response = await axios.get('/api/users/profile', {
  headers: {
    Authorization: `Bearer ${userToken}`,
  },
});
```

**Cookie-Based Authentication:**
If you've logged in through the `/api/auth/login` endpoint, the token is automatically set as an `auth_token` cookie. You can make requests without manually setting the Authorization header:

```javascript
// No need to set Authorization header - cookie is sent automatically
const response = await fetch('/api/users/profile', {
  credentials: 'include', // Important: Include cookies in the request
});

// Or with Axios
const response = await axios.get('/api/users/profile', {
  withCredentials: true, // Important: Include cookies in the request
});
```

## Error Responses

### Missing Token
```json
{
  "statusCode": 401,
  "message": "No authorization token provided",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/users/profile"
}
```

### Invalid Token
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/users/profile"
}
```

## Testing

### Test Endpoints Available

1. **GET /api/test/auth/profile** - Basic authentication test
2. **GET /api/test/auth/user-id** - Extract user ID only
3. **GET /api/test/auth/full-user** - Get complete user data

### Testing with Swagger

1. Navigate to `/api` (Swagger UI)
2. Authenticate using your Supabase token
3. Test the protected endpoints in the "test" section

### Manual Testing with cURL

```bash
# Test with valid token
curl -H "Authorization: Bearer your-supabase-token" \
     http://localhost:3000/api/test/auth/profile

# Test without token (should return 401)
curl http://localhost:3000/api/test/auth/profile
```

## Logging Output

The guard provides detailed logging for debugging:

### Successful Authentication
```json
{
  "operation": "canActivate",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "authTime": "45ms",
  "userMetadata": {
    "emailVerified": true,
    "lastSignIn": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Failed Authentication
```json
{
  "operation": "canActivate",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "error": {
    "message": "Invalid or expired token",
    "name": "UnauthorizedException"
  }
}
```

## Integration with Other Guards

You can combine `AuthGuard` with other guards using `@UseGuards()`:

```typescript
@Controller('admin')
export class AdminController {
  @Get('users')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getUsers(@CurrentUser() user: any) {
    // Both authentication and role check applied
    return this.adminService.getAllUsers();
  }
}
```

## Global vs Route-Level Usage

### Route Level (Recommended)
```typescript
@Get('profile')
@UseGuards(AuthGuard)
async getProfile() { /* ... */ }
```

### Global Usage (Optional)
```typescript
// In main.ts
app.useGlobalGuards(new AuthGuard(supabaseService));
```

## Best Practices

1. **Always use `@ApiBearerAuth()`** for Swagger documentation
2. **Use `@CurrentUser()` decorator** instead of manual request.user access
3. **Handle authentication errors** gracefully in your frontend
4. **Log authentication events** for security monitoring
5. **Use correlation IDs** for request tracing across services

## Security Notes

- Tokens are validated against Supabase Auth service
- No local JWT verification - relies on Supabase for security
- Supports token revocation through Supabase
- Logs authentication attempts for security monitoring
- Sensitive token data is not logged (only prefixes for debugging)

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if token is properly formatted and not expired
2. **500 Internal Server Error**: Verify Supabase configuration and network connectivity
3. **Missing user data**: Ensure guard is applied before accessing `@CurrentUser()`

### Debug Mode

Set `LOG_LEVEL=debug` in environment to see detailed authentication flow logs.
