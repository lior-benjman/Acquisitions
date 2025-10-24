# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development

- **Start development server**: `npm run dev` - Runs the server with hot-reload using Node.js `--watch` flag
- **Database operations**:
  - `npm run db:generate` - Generate Drizzle migrations from schema changes
  - `npm run db:migrate` - Apply database migrations
  - `npm run db:studio` - Open Drizzle Studio for database management

### Code Quality

- **Linting**: `npm run lint` (check) / `npm run lint:fix` (auto-fix)
- **Formatting**: `npm run format` (format code) / `npm run format:check` (check formatting)

## Architecture Overview

This is a Node.js Express API for an "acquisitions" system with authentication capabilities.

### Technology Stack

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: PostgreSQL via Neon serverless with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Zod schemas
- **Logging**: Winston with file and console transports
- **Security**: Helmet, CORS, cookie-parser

### Directory Structure

```
src/
├── config/          # Database and logger configuration
├── controllers/     # Route handlers and business logic
├── models/          # Drizzle database schemas
├── routes/          # Express route definitions
├── services/        # Business logic layer
├── utils/           # Utility functions (JWT, cookies, formatting)
└── validations/     # Zod validation schemas
```

### Key Architectural Patterns

1. **Layered Architecture**: Clear separation between routes → controllers → services → database
2. **Database Schema-First**: Drizzle ORM with migrations in `drizzle/` directory
3. **Validation Layer**: Zod schemas validate all incoming requests
4. **Centralized Logging**: Winston logger configured in `src/config/logger.js` with file persistence
5. **Security-First**: JWT authentication, bcrypt hashing, helmet security headers

### Database Configuration

- Uses Neon PostgreSQL serverless database
- Schema defined in `src/models/` using Drizzle ORM
- Migrations managed via `drizzle-kit` commands
- Current schema includes `users` table with authentication fields

### Environment Setup

- Requires `DATABASE_URL` environment variable for Neon connection
- JWT secret configurable via `JWT_SECRET` environment variable
- Log level configurable via `LOG_LEVEL`
- Uses `.env` file for local development

### Code Style Standards

- ES modules with 2-space indentation
- Single quotes, semicolons required
- Unix line endings
- Prettier formatting with ESLint rules
- Arrow functions preferred over regular functions
- No unused variables (except prefixed with underscore)

### API Structure

Current implementation includes:

- Authentication endpoints at `/api/auth/`
- Health check at `/health`
- User signup functionality with validation and JWT token generation
- Cookie-based authentication storage

The codebase follows REST API conventions and is structured for scalability with clear separation of concerns.
