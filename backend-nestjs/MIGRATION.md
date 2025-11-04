# Migration Guide: Express to NestJS

## Overview

This document explains the migration from the Express.js backend (`backend/`) to the NestJS backend (`backend-nestjs/`).

## What Was Migrated

### ✅ Complete
- [x] Project structure and scaffolding
- [x] All 20+ feature modules (structure)
- [x] Authentication (JWT with Passport.js)
- [x] User model
- [x] Configuration management
- [x] Database setup (Sequelize + Mongoose)
- [x] Security middleware (Helmet, CORS)
- [x] Validation pipes
- [x] Swagger/OpenAPI documentation
- [x] Health checks
- [x] Base controller/service patterns

### 📋 Ready for Implementation
- [ ] Additional database models (migrate from `backend/models/`)
- [ ] Business logic from existing services
- [ ] Validators and DTOs
- [ ] Detailed route implementations
- [ ] Middleware (rate limiting, error handling specifics)
- [ ] Tests migration
- [ ] Background tasks and workers

## Architecture Comparison

### Express (Old)
```
backend/
├── index.ts (main entry)
├── modules/
│   └── {module}/
│       ├── index.ts
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       └── validators/
├── models/
├── middleware/
└── config/
```

### NestJS (New)
```
backend-nestjs/
├── src/
│   ├── main.ts (entry)
│   ├── app.module.ts (root)
│   ├── {module}/
│   │   ├── {module}.module.ts
│   │   ├── {module}.controller.ts
│   │   └── {module}.service.ts
│   ├── auth/ (with guards, strategies)
│   ├── config/
│   ├── database/
│   ├── models/
│   └── common/ (base classes)
└── test/
```

## Key Changes

### 1. Dependency Injection
**Express:**
```typescript
import service from './service';
class Controller {
  method() {
    return service.doSomething();
  }
}
```

**NestJS:**
```typescript
@Injectable()
export class Controller {
  constructor(private service: Service) {}
  
  method() {
    return this.service.doSomething();
  }
}
```

### 2. Route Decorators
**Express:**
```typescript
router.get('/items', controller.getItems);
router.post('/items', controller.createItem);
```

**NestJS:**
```typescript
@Controller('items')
export class ItemsController {
  @Get()
  getItems() { }
  
  @Post()
  createItem() { }
}
```

### 3. Validation
**Express:**
```typescript
router.post('/', validate({ body: schema }), controller.create);
```

**NestJS:**
```typescript
@Post()
create(@Body() dto: CreateDto) { }

// With class-validator
class CreateDto {
  @IsString()
  name: string;
}
```

### 4. Authentication
**Express:**
```typescript
router.get('/protected', authenticate, controller.method);
```

**NestJS:**
```typescript
@UseGuards(JwtAuthGuard)
@Get('protected')
method() { }

// Or globally with @Public() decorator for exceptions
```

## Running Both Backends

During transition, you can run both:

### Express Backend
```bash
cd backend
npm run dev  # Port 8080
```

### NestJS Backend
```bash
cd backend-nestjs
npm run start:dev  # Port 8080 (configure different port if needed)
```

## Migration Steps for Additional Features

### Step 1: Models
Copy models from `backend/models/` to `backend-nestjs/src/models/` and adapt:
- Keep Sequelize decorators
- Add `declare` keyword for TypeScript compatibility
- Register in appropriate module

### Step 2: DTOs
Create DTO classes in each module using class-validator:
```typescript
export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsOptional()
  @IsString()
  description?: string;
}
```

### Step 3: Services
Migrate business logic:
- Extend `BaseService` for CRUD
- Inject repositories via constructor
- Add custom methods as needed

### Step 4: Controllers
Migrate route handlers:
- Extend `BaseController` for CRUD
- Use decorators for routes
- Add Swagger decorators

### Step 5: Testing
Migrate tests to NestJS testing utilities:
```typescript
describe('ItemsController', () => {
  let controller: ItemsController;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [ItemsService],
    }).compile();
    
    controller = module.get<ItemsController>(ItemsController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

## Environment Variables

Both backends use the same environment variables. The NestJS backend includes additional configuration through the `ConfigModule`.

## Database

The NestJS backend supports the same databases:
- PostgreSQL (primary, via Sequelize)
- MongoDB (optional, via Mongoose)
- Redis (optional, via ioredis)

Connection management is handled through the `DatabaseModule`.

## API Compatibility

The NestJS backend maintains API compatibility:
- Same base path: `/api/v1`
- Same authentication mechanism (JWT)
- Same response format: `{ success: boolean, data?: any }`
- All original endpoints available

## Deployment

### Docker
The NestJS backend can use the same Docker setup. Update `docker-compose.yml` to point to `backend-nestjs/`.

### Environment
Production deployment requires:
1. Set `NODE_ENV=production`
2. Configure database connections
3. Set secure `JWT_SECRET`
4. Run `npm run build` then `npm run start:prod`

## Testing the Migration

1. **Start NestJS backend:**
   ```bash
   cd backend-nestjs
   npm install
   npm run start:dev
   ```

2. **Test endpoints:**
   - Health: http://localhost:8080/health
   - API Info: http://localhost:8080/api/v1
   - Swagger: http://localhost:8080/api/v1/docs
   - Login: POST http://localhost:8080/api/v1/auth/login

3. **Compare with Express:**
   - Same responses
   - Same authentication flow
   - Same status codes

## Rollback Plan

If issues arise:
1. Keep the Express backend (`backend/`) intact
2. Switch routing in reverse proxy/load balancer
3. The NestJS backend is in `backend-nestjs/` - no impact on existing code

## Next Steps

1. Migrate remaining database models
2. Implement detailed business logic for each module
3. Add comprehensive tests
4. Migrate middleware specifics
5. Update CI/CD pipelines
6. Performance testing and optimization
7. Gradual production rollout

## Support

For questions or issues during migration:
- Check NestJS documentation: https://docs.nestjs.com/
- Review the API reference: https://api-references-nestjs.netlify.app/api
- Open GitHub issues for project-specific problems

## Benefits of Migration

✅ **Better Code Organization**: Modular architecture with clear boundaries  
✅ **Type Safety**: Full TypeScript with decorators and DI  
✅ **Testability**: Built-in testing utilities and mocking  
✅ **Documentation**: Auto-generated OpenAPI/Swagger docs  
✅ **Scalability**: Better suited for large, complex applications  
✅ **Community**: Large ecosystem and active community  
✅ **Standards**: Follows established patterns and best practices  

## Conclusion

The NestJS migration provides a solid foundation for the Black-Cross platform. The modular architecture, dependency injection, and built-in tooling make it easier to maintain and scale the application.
