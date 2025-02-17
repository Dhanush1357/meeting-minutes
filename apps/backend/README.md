# NestJS Application Structure

This is a NestJS-based application that follows a modular architecture pattern for better organization and maintainability.

## Project Structure

The application is organized into feature-based modules, each containing its own components:

### Common File Patterns

- **\*.module.ts**
  - Defines the scope of the feature module
  - Imports required dependencies
  - Declares controllers and providers
  - Exports shared components for other modules

- **\*.controller.ts**
  - Handles HTTP requests
  - Defines API endpoints and routes
  - Manages request/response cycle
  - Delegates business logic to services

- **\*.service.ts**
  - Contains business logic
  - Handles data processing
  - Interacts with the database
  - Provides reusable functionality

- **dto/**
  - Contains Data Transfer Object classes
  - Defines request/response data structures
  - Implements validation rules
  - Ensures type safety

## Core Modules

### Authentication (`auth/`)
- Handles user authentication and authorization
- Manages JWT tokens
- Implements authentication strategies
- Processes login/registration

### Users (`users/`)
- Manages user-related operations
- Handles profile updates
- Controls user roles and permissions
- Stores user data

### Dashboard (`dashboard/`)
- Provides dashboard functionality
- Generates metrics and statistics
- Displays user analytics
- Manages dashboard views

### Mail (`mail/`)
- Handles email communications
- Sends notification emails
- Manages email templates
- Integrates with email services

### Database (`prisma/`)
- Contains Prisma ORM setup
- Manages database connections
- Handles database queries
- Provides database utilities

## Entry Points

### `main.ts`
- Application bootstrap
- Server configuration
- Global middleware setup
- Application initialization

### `app.module.ts`
- Root application module
- Global module imports
- Application-wide providers
- Core configuration

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run start:dev
```

## Development Guidelines

- Follow the modular pattern when adding new features
- Place DTOs in the respective feature's `dto/` folder
- Implement business logic in services, not controllers
- Use dependency injection for better testability
- Follow NestJS best practices and decorators

## Contributing

1. Create a feature branch
2. Implement changes
3. Write tests
4. Submit a pull request
