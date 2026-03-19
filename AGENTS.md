# Agent Guidelines for DellekesHub

This is a monorepo with a **Nuxt 4 frontend** (Vue 3) and a **NestJS backend**.

---

## 1. Build / Lint / Test Commands

### Backend (NestJS)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Build
npm run build

# Start in production
npm run start:prod

# Start in development (watch mode)
npm run start:dev

# Lint with ESLint (fixes issues)
npm run lint

# Format with Prettier
npm run format

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run a single test file
npm run test -- auth.service.spec.ts

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

### Frontend (Nuxt 4)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Start development server
npm run dev

# Generate static site
npm run generate

# Preview production build
npm run preview
```

---

## 2. Code Style Guidelines

### General

- **Project Type**: TypeScript is used in both frontend and backend
- **No comments**: Do not add code comments unless explicitly required
- **Error handling**: Use try/catch with proper error logging
- **Logging**: Use NestJS Logger for backend services (`private readonly logger = new Logger(ServiceName.name)`)

---

### Backend (NestJS)

#### Imports

- Use absolute imports with relative paths (e.g., `import { UsersService } from '../users/users.service'`)
- Group imports: external packages first, then internal modules
- Use named exports for services, controllers, modules

#### Naming Conventions

- **Files**: `kebab-case` (e.g., `auth.service.ts`)
- **Classes**: `PascalCase` (e.g., `AuthService`)
- **Methods/Properties**: `camelCase` (e.g., `findByUsername`)
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces/Types**: `PascalCase` (e.g., `CreateVideo`)

#### TypeScript

- Enable strict mode in tsconfig where possible
- Use interfaces for object shapes, types for unions/intersections
- Use `any` sparingly (ESLint allows it but avoid when possible)
- Use Zod for runtime validation (already integrated)

#### Error Handling

- Use NestJS built-in exceptions: `BadRequestException`, `ConflictException`, `NotFoundException`, `UnauthorizedException`
- Throw exceptions with descriptive messages
- Use guards for authorization (see `auth/middleware/`)

#### REST API

- Follow RESTful conventions
- Use DTOs with class-validator for request validation
- Use Zod schemas in `validation/` folders for complex validation
- Return appropriate HTTP status codes

#### Testing

- Test files: `*.spec.ts` in same directory as source
- Use NestJS Testing module: `Test.createTestingModule()`
- Mock dependencies with `jest.createMock()` or manual mocks
- Test structure: `describe`, `beforeEach`, `it`/`test`

---

### Frontend (Nuxt 4 / Vue 3)

#### Structure

- Pages: `app/pages/`
- Components: `app/components/custom/` (business logic), `app/components/ui/` (shadcn-vue components)
- Composables: Use Nuxt `useFetch`, `useRouter`, `useRoute`
- Layouts: `app/layouts/`

#### Vue Components

- Use `<script setup>` syntax
- Use Composition API exclusively
- Use `ref` for primitives, `reactive` for objects
- Auto-imports are enabled (no import statements needed for composables)

#### Styling

- Use Tailwind CSS (v4)
- Use `tailwind-merge` and `clsx` for conditional classes
- shadcn-vue components in `components/ui/`
- Icons: Use `@nuxt/icon` module with Icon component

#### Data Fetching

- Use `useFetch()` for API calls
- Handle errors with try/catch
- Use loading states appropriately

#### Naming

- Components: `PascalCase` (e.g., `Navbar.vue`)
- Props: `camelCase`
- Events: `kebab-case` in templates

---

### ESLint & Prettier (Backend)

- ESLint: Uses `typescript-eslint` with recommended configs
- Prettier: Single quotes, trailing commas
- Run `npm run lint` before committing backend code
- Run `npm run format` to auto-format

---

### MongoDB / Mongoose

- Schemas in `persistence/` folders
- Use Mongoose decorators: `@Prop`, `@Schema`, `@Injectable`
- Document types: `Document` suffix (e.g., `VideoDocument`)
- Indexes defined in schema decorators

---

### Authentication

- JWT for API authentication
- Session-based auth for web (express-session)
- Guards: `RolesGuard`, `SessionGuard` in `auth/middleware/`
- Use `@Roles()` decorator for role-based access

---

### Zod Validation

- Validation schemas in `validation/` folders per module
- Use `zod-validation.ts` utility for request validation
- Parse and validate in controllers or pipes

---

### Key Dependencies

**Backend:**
- NestJS 11
- Mongoose 9
- Passport (JWT + Session)
- Zod 4
- class-validator / class-transformer

**Frontend:**
- Nuxt 4
- Vue 3.5
- Tailwind CSS 4
- shadcn-vue (Reka UI)
- Zod 4

---

## 3. File Organization

```
backend/
├── src/
│   ├── auth/           # Authentication (guards, strategies, validation)
│   ├── users/          # User management
│   ├── videos/         # Video management
│   ├── collections/    # Collection management
│   ├── reviews/        # Reviews
│   ├── images/         # Image handling
│   ├── stream/         # Video streaming
│   ├── watch-progress/ # Progress tracking
│   ├── lib/            # Utilities (utils, validation)
│   └── main.ts

frontend/
├── app/
│   ├── components/     # Vue components
│   ├── pages/         # Route pages
│   ├── layouts/       # Layouts
│   ├── composables/   # (via Nuxt auto-import)
│   └── app.vue
├── nuxt.config.ts
└── package.json
```

---

## 4. Common Patterns

### Backend Service Pattern
```typescript
@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    private imageService: ImageService,
  ) {}

  async findVideoById(id: string): Promise<VideoDocument | null> {
    return this.videoModel.findById(id);
  }
}
```

### Frontend Component Pattern
```vue
<script setup>
const router = useRouter()

async function fetchData() {
  try {
    const { data } = await useFetch('/api/endpoint')
    return data
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div>Component content</div>
</template>
```

---

## 5. Running Specific Tests

To run a single test file in the backend:

```bash
cd backend
npm run test -- auth.service.spec.ts
```

Or with jest directly:
```bash
cd backend
npx jest auth.service.spec.ts
```

---

## 6. Environment Variables

- Backend: `.env` file (see `.env.example` if available)
- Frontend: Nuxt config or `.env` files
- MongoDB connection string required for backend
- JWT secret for authentication
