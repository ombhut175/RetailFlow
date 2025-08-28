# ✅ Backend Coding Rules and Best Practices

---

## 🧾 1. Environment Variables 

* **DO NOT hardcode** any credentials, URLs, or magic values.
* Use `process.env` to access variables.
* **Document all required variables** in `env.example` present at root of project.
* If anything is unclear or missing, ask the maintainer (me).

---

## 🧵 2. String Constants

* Define **all hardcoded strings** (e.g., messages, table names, error keys, Supabase policies, Environment variables names) inside a **central `string-const.ts`** file.
* Use **categorized enums or objects** for structure.

```ts
// helpers/string-const.ts
export enum TABLES {
  TASKS = 'tasks',
}

export enum MESSAGES {
  USER_NOT_FOUND = 'User not found',
  TASK_NOT_FOUND = 'Task not found',
}

export enum ENV {
  SUPABASE_URL = 'SUPABASE_URL',
  SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY',
}
```

Use like:

```ts
supabase.from(TABLES.TASKS).select(...)
throw new NotFoundException(MESSAGES.TASK_NOT_FOUND)

```

```ts
process.env[ENV.SUPABASE_URL]

```

---

## 📦 3. DTOs and Validation

* All inputs must use `DTOs` with `class-validator` and `class-transformer`.
* **Separate DTOs** for:

  * `CreateXDto`
  * `UpdateXDto`
  * `DeleteXDto` (when using body/payload)
* Mark optional fields using `@IsOptional()` and validate types strictly.

Example:

```ts
export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
```

---

## ♻️ 4. No Repeated Code

* **DRY (Don't Repeat Yourself)**: All repeated logic must go into helper functions or services.
* For example:

  * Token extraction → helper
  * Setting cookie → helper
  * Supabase error formatting → helper
  * Common DB queries → utility service

---

## 🌐 5. Global App Configuration

Apply these in `main.ts`:

### ✅ Global Prefix

```ts
app.setGlobalPrefix('api');
```

### ✅ Global CORS

```ts
app.enableCors({
  origin: true,
  credentials: true,
});
```

### ✅ Global Cookie Parser

```ts
import * as cookieParser from 'cookie-parser';
app.use(cookieParser());
```

---

## 🚨 6. Global Exception Filters

* Use NestJS **`HttpExceptionFilter`** to catch and format all errors.
* Customize to return:

  * `statusCode`
  * `message`
  * `timestamp`
  * `path`

Apply globally in `main.ts`:

```ts
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
app.useGlobalFilters(new HttpExceptionFilter());
```

Filter example:

```ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const message = exception.message || 'Unexpected error occurred';

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

## 🛠 7. Helper Functions

* All utility logic (e.g. parsing cookies, verifying tokens, formatting DB errors) should be placed in:

  * `helpers/` or `utils/` folder.
* Write **pure and reusable** functions, e.g.:

  * `parseCookies()`
  * `verifySupabaseToken()`
  * `getUserFromRequest()`
  * `formatSupabaseError()`

---

## 📌 8. Task-Specific Guidelines

### 🔐 Auth:

* JWT is set as HTTP-only cookie.
* Extract token from cookies on protected routes.
* Validate Supabase session from token before any data access.



## 📘 9. Swagger API Documentation

* **All new controller functions must be documented** using Swagger decorators.

* Use appropriate decorators like:

  ```ts
  @ApiTags('users')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  ```

* Ensure DTOs are also annotated with:

  ```ts
  @ApiProperty({ example: 'John Doe' })
  ```

* Keep Swagger annotations **up-to-date** as APIs evolve.



## 🚀 10. Standardized API Responses

* All responses (success or error) should follow a **consistent format**.
* Create a common `ApiResponseHelper` in `helpers/`:

```ts
// helpers/api-response.helper.ts
export const successResponse = (data: any, message = 'Success') => ({
  statusCode: 200,
  success: true,
  message,
  data,
});

export const createdResponse = (data: any, message = 'Created') => ({
  statusCode: 201,
  success: true,
  message,
  data,
});
```

Usage in controller:

```ts
@Get()
async getAll() {
  const users = await this.userService.findAll();
  return successResponse(users, 'Users fetched successfully');
}
```

---

## ❌ 11. Avoid Manual Status Codes in Controllers

* Do **not** manually set status codes with `@Res()` and `res.status()`.
* Let NestJS handle response codes using decorators:

```ts
@Post()
@HttpCode(HttpStatus.CREATED) // or use built-in decorators like @Post() + return 201
```

---

## 🧼 12. Clean Controller Structure

* Controllers should be **thin** – delegate all logic to services.
* Only do request validation and response formatting in controllers.

```ts
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return successResponse(await this.userService.getAllUsers());
  }
}
```

---

## 🧪 13. Service Design Patterns

* Services should be **modular** and reusable.
* For domain logic, prefer smaller private helper methods inside services.

```ts
@Injectable()
export class UserService {
  async getAllUsers() {
    return this.userRepository.findAll();
  }

  private sanitizeUser(user: UserEntity) {
    delete user.password;
    return user;
  }
}
```

---

## 🔁 14. Reusable Database Functions

* Abstract common DB operations (e.g., find by ID with not found check) into **BaseService** or utility functions.

```ts
export async function findOrThrow<T>(
  query: Promise<T>,
  message = 'Resource not found',
) {
  const result = await query;
  if (!result) throw new NotFoundException(message);
  return result;
}
```

---

## 💥 15. Error Handling Enhancements

* Always throw specific exceptions (e.g., `BadRequestException`, `ForbiddenException`) rather than generic `Error`.

Example:

```ts
if (!user) {
  throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
}
```

---

## 🏗️ 16. Repository Architecture & Database Access

* **NEVER create monolithic repositories** that handle multiple domains in a single class.
* **Use Domain-Driven Repository Pattern** with separate repositories for each domain entity.
* **Structure repositories as follows**:

```
src/core/database/
├── repositories/
│   ├── base.repository.ts          # Common CRUD operations & DrizzleService access
│   ├── users.repository.ts         # User-specific operations only
│   ├── tickets.repository.ts       # Ticket-specific operations only
│   ├── skills.repository.ts        # Skills-specific operations only
│   └── index.ts                    # Export all repositories
├── database.module.ts              # Configure and export all repositories
└── database.repository.ts          # Remove or keep as facade only if needed
```

* **Benefits of this approach**:
  * **Single Responsibility Principle**: Each repository handles one domain
  * **Easier Testing**: Test individual repositories in isolation
  * **Better Maintainability**: Smaller, focused files
  * **Team Collaboration**: Different developers can work on different repositories
  * **Code Reusability**: Common operations in base repository
  * **Easier Debugging**: Issues isolated to specific domains

* **Implementation Rules**:
  * Each repository **must extend** `BaseRepository` for common database access
  * Services **should inject** specific repositories directly (e.g., `UsersRepository`, `TicketsRepository`)
  * **Avoid** injecting the monolithic `DatabaseRepository` facade in new services
  * Use **composition over inheritance** for complex database operations
  * Keep repositories **focused on data access** - business logic belongs in services

* **Example Usage**:

```ts
// ✅ GOOD: Direct repository injection
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly skillsRepo: SkillsRepository,
  ) {}

  async createUser(userData: NewUser) {
    return this.usersRepo.createUser(userData);
  }
}

// ❌ BAD: Monolithic repository injection
@Injectable()
export class UsersService {
  constructor(private readonly dbRepo: DatabaseRepository) {}
  
  async createUser(userData: NewUser) {
    return this.dbRepo.createUser(userData); // Violates SRP
  }
}
```

---

## 🧹📁 17.  Folder Structure & Organization

```
/src
  /modules
    /auth
      auth.controller.ts
      auth.service.ts
      auth.module.ts
      dto/
    /users
    /tasks
    ...
  /common
    /decorators
    /filters
    /guards
    /interceptors
    /pipes
    /helpers
    /constants
  /config
    supabase.config.ts
    app.config.ts
  /core
    /database
    /logger
    base.service.ts
  main.ts
  app.module.ts
```

### 🔹 Breakdown

* `modules/` → Feature-based modules are grouped here.
* `common/` → Cross-cutting concerns (used by many modules).
* `core/` → System-level services (DB, logging, etc.)
* `config/` → All configuration logic (e.g., `ConfigModule.forRoot()` schema files).

* Use **modular grouping** under `/src/modules/` for scalability.
* All shared logic (pipes, filters, decorators, guards, helpers, etc.) should live in `/src/common/`.
* Use `/src/core/` for system-level bootstrapping code like database, base service, logger, etc.
* Keep configurations in `/src/config/`.

**Avoid a flat structure** when you have 50+ modules.

---

## 🛡️ 18. Guards, Interceptors, Pipes

* Use built-in mechanisms:

  * Guards → Authorization (`RolesGuard`)
  * Interceptors → Transform/Logging
  * Pipes → Validation & Transformation

* Always abstract reusable ones in `common/`.

---

## 🧾 19. Logging Best Practices

* Use `Logger` class for debug/log instead of `console.log`.

```ts
import { Logger } from '@nestjs/common';
private readonly logger = new Logger(UserService.name);
this.logger.log('Fetching all users');
```

---

## 🌐 20. HTTP Module for External Calls

* Use NestJS `HttpModule` for calling external APIs.
* Wrap it with retry strategy and response/error transformation.

---

## ⚙️ 21. Use ConfigModule Properly

* Centralize configs like JWT secret, DB URLs using `@nestjs/config`.
* Use schema validation (`Joi`) to ensure all `.env` variables are present and valid.



---

## 📝 22. Module Documentation Requirements

* **Update documentation** in `/docs` whenever adding or modifying a module.
* For each module or API endpoint, documentation **must include**:
  * Complete endpoint path (`/api/users/:id`)
  * HTTP method(s) (`GET`, `POST`, `PUT`, `DELETE`)
  * Request parameters, query params, and body schema with types
  * Response format and status codes with examples
  * Authentication requirements
  * Rate limits (if applicable)
  
* Format example:

```md
## Users Module

### GET /api/users/:id
- **Description**: Retrieves a user by their ID
- **Auth Required**: Yes, Bearer Token
- **Parameters**:
  - `id` (path) - string - User UUID
- **Response**: 
  - 200 OK
    ```json
    {
      "statusCode": 200,
      "success": true,
      "message": "User fetched successfully",
      "data": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2023-01-01T00:00:00Z"
      }
    }
    ```
  - 404 Not Found
    ```json
    {
      "statusCode": 404,
      "message": "User not found",
      "timestamp": "2023-01-01T00:00:00Z",
      "path": "/api/users/123"
    }
    ```
```

---

## 📋 23. Use Regions for Better Code Organization

* **Use `#region` and `#endregion` comments** to organize large controllers, services, and other files.
* Group related functionality together with **descriptive region names**.
* Use **consistent formatting** with clear separators for visual distinction.

### ✅ Controller Example:

```ts
@Controller('profiles')
export class ProfilesController {
  
  //#region ==================== LEARNER PROFILE ENDPOINTS ====================

  @Post('learner')
  async createLearnerProfile() { /* ... */ }

  @Put('learner')
  async updateLearnerProfile() { /* ... */ }

  @Get('learner')
  async getLearnerProfile() { /* ... */ }

  //#endregion

  //#region ==================== TRAINER PROFILE ENDPOINTS ====================

  @Post('trainer')
  async createTrainerProfile() { /* ... */ }

  @Put('trainer/:id')
  async updateTrainerProfile() { /* ... */ }

  //#endregion

  //#region ==================== ADMIN PROFILE ENDPOINTS ====================

  @Post('admin')
  async createAdminProfile() { /* ... */ }

  //#endregion
}
```

### ✅ Service Example:

```ts
@Injectable()
export class UserService {

  //#region ==================== CRUD OPERATIONS ====================

  async create() { /* ... */ }
  async findAll() { /* ... */ }
  async findOne() { /* ... */ }
  async update() { /* ... */ }
  async delete() { /* ... */ }

  //#endregion

  //#region ==================== VALIDATION HELPERS ====================

  private validateEmail() { /* ... */ }
  private validatePassword() { /* ... */ }

  //#endregion

  //#region ==================== BUSINESS LOGIC ====================

  async assignRole() { /* ... */ }
  async sendNotification() { /* ... */ }

  //#endregion
}
```

### 🎯 Benefits:
* **Better navigation** in IDEs with collapsible regions
* **Logical grouping** of related methods
* **Improved readability** for large files
* **Easier maintenance** and code reviews

### 📝 Region Naming Guidelines:
* Use **UPPERCASE** for region descriptions
* Include **equal signs (=)** for visual separation
* Be **descriptive** but **concise**
* Group by **functionality**, not implementation details

---

## 🧵 24. Queues with BullMQ (Best Practices)

- **Configuration**
  - **Do not hardcode** Redis credentials. Use `@nestjs/config` and `Joi` schema in `src/config/env.validation.ts`.
  - Centralize queue names in `common/constants/string-const.ts` under `QUEUES` enum. Example: `QUEUES.JOBS = 'jobs'`.
  - Connection options must be loaded from `configuration.ts` (`redis.host`, `redis.port`, `redis.password`).

- **Module Structure**
  - Keep HTTP-facing test endpoints under `src/modules/bullmq`.
  - Processors should extend `WorkerHost` and live alongside their module or be promoted to `core/queue` when the number grows.
  - Register queues via `BullModule.registerQueue({ name: QUEUES.X })`.

- **Enqueue Rules**
  - Enqueue from services (not controllers) to keep controllers thin.
  - Always set job options explicitly: `{ attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: true }` unless a different policy is required.
  - Payloads must be serializable; avoid large blobs. Store only identifiers and fetch data in the processor when needed.
  - Make processors idempotent: handle re-delivery safely.

- **Processor Rules**
  - Implement `@OnWorkerEvent('completed'|'failed')` for observability.
  - Use `Logger` instead of `console.log`.
  - Catch and throw meaningful `Error` messages; avoid swallowing errors.
  - Long-running or external API tasks must run in processors, not in HTTP request lifecycle.

- **DTOs & Swagger**
  - All enqueue endpoints must validate inputs with DTOs and be annotated with Swagger decorators.

- **Observability & Ops**
  - Expose a lightweight health endpoint for queues (e.g., `/queues/health`) for smoke checks.
  - Prefer per-queue backoff policies; monitor failure rates.
  - Plan a separate worker process for production scale. For now, processors run in-app; when splitting, reuse the same `BullModule.forRootAsync` config.

- **Testing**
  - Unit-test enqueue services (assert queue `.add` is called with expected name/options).
  - Integration-test processors with a disposable Redis and fake providers.

---

## 🗄️ 25. Database Access Strategy: Drizzle First, Supabase CLI Last

- **Primary Rule**: Use **Drizzle ORM** for **all database operations** including CRUD, queries, migrations, and schema management.
- **Drizzle Usage**: 
  - All table operations (SELECT, INSERT, UPDATE, DELETE)
  - Complex queries and joins
  - Database migrations and schema changes
  - Raw SQL when needed via `sql` template literals
  - Connection pooling and transaction management

- **Supabase CLI Usage**: **ONLY** when accessing schemas other than `public`:
  - `auth` schema (user management, sessions)
  - `storage` schema (file buckets, storage policies)
  - `realtime` schema (subscriptions)
  - `graphql_public` schema (if using GraphQL)
  - Custom schemas created outside the application

- **Implementation Guidelines**:
  - **Never use Supabase CLI** for `public` schema operations
  - **Always use Drizzle** for application data tables
  - Use Supabase CLI only for administrative tasks or cross-schema operations
  - Keep Supabase CLI usage minimal and well-documented

- **Example**:
  ```ts
  // ✅ GOOD: Use Drizzle for public schema
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  
  // ✅ GOOD: Use Supabase CLI only for auth schema
  const { data: { user } } = await supabase.auth.getUser(token);
  
  // ❌ BAD: Don't use Supabase CLI for public schema
  const { data } = await supabase.from('users').select('*').eq('id', userId);
  ```

---

## 🧵 26. Scalable BullMQ Architecture & Patterns

- **Centralized Configuration**
  - Define BullMQ connection and defaults in one place (e.g., `src/modules/bullmq/bull.config.ts`).
  - Use `@nestjs/config` for Redis options; do not hardcode.
  - Set sensible `defaultJobOptions` (attempts, backoff, removeOnComplete) centrally.

- **Dynamic Feature Registration**
  - Create a `BullmqFeatureModule.forFeature([{ name, processor, producer }])` to register queues declaratively.
  - Add new queues by adding a folder and one line in `forFeature`—no scattered `registerQueue` calls.

- **Queue-per-Feature Structure**
  - Each queue has its own folder under `src/modules/bullmq/queues/<feature>/` containing:
    - `*.types.ts` (Job names enum and payload interfaces)
    - `*.queue.ts` (producer service; the only public injection point)
    - `*.processor.ts` (extends `WorkerHost`; orchestrates and delegates)
  - Keep business logic in domain services; processors should delegate, not contain heavy logic.

- **Injection Rule**
  - Do not inject `@InjectQueue` in feature modules/services. Inject the queue's Producer service instead.

- **Separation of Concerns (API vs Workers)**
  - Support running workers in a separate Nest process for scale; share the same BullMQ root config.
  - Keep lightweight test/health endpoints under `src/modules/bullmq` when running in-app.

- **Types & Idempotency**
  - Strongly type job names/data per queue.
  - Use idempotent processors and consider setting `jobId` to a business key to deduplicate.

- **Observability & Ops**
  - Use `Logger`, `@OnWorkerEvent('completed'|'failed')`, and expose queue health endpoints.
  - Optional: integrate dashboards (e.g., bull-board) and metrics for queue depth/latency.

- **Example Layout**
  ```
  src/modules/bullmq/
    bullmq.module.ts
    bull.config.ts
    bullmq.feature.module.ts
    queues/
      normalize/
        normalize.types.ts
        normalize.queue.ts
        normalize.processor.ts
  ```

- **Controller & Service Guidance**
  - Controllers remain thin; enqueue from services using Producer services.
  - Validate DTOs and document enqueue endpoints with Swagger.

---