# Frontend Application Documentation

## Project Overview

This is a modern, scalable frontend application built with:
- Next.js
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Zustand for State Management

## Directory Structure

### Key Directories

- `src/app/`: Page components and routing
- `src/components/`: Reusable UI components
- `src/hooks/`: Custom React hooks
- `src/lib/`: Utility functions and configurations
- `src/stores/`: Global state management
- `src/factories/`: API request factories
- `public/`: Static assets and PWA configuration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js
- npm or yarn
- Git

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

1. Copy the example environment file:
```bash
# update the values in local env file
cp .env.example .env.local
```

## Project Configuration

### Key Configuration Files

- `next.config.ts`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS customization
- `tsconfig.json`: TypeScript compiler settings
- `components.json`: Shadcn/UI component configuration

## Development Guidelines

### Component Development

1. Use functional components with TypeScript
2. Utilize Shadcn/UI components for consistent design
3. Implement prop types and interfaces
4. Keep components small and focused
5. Use custom hooks for complex logic

### State Management

- Use Zustand for global state
- Create stores in `src/stores/`
- Implement type-safe stores

### API Interactions

- Use the API factory in `src/factories/apiFactory.ts`
- Implement centralized API endpoint definitions
- Handle errors and loading states consistently

### Styling

- Utilize Tailwind CSS utility classes
- Follow design system and color palette
- Use responsive design principles

### Authentication

- Manage authentication state in `useAuthStore.ts`
- Implement protected routes
- Handle token management

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Performance Optimization

- Implement code splitting
- Use dynamic imports
- Optimize images and assets
- Leverage Next.js image optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with descriptive messages
4. Push to your fork
5. Create a pull request