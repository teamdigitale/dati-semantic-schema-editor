# Schema Editor API

A NestJS-based API service for schema semantic score. This API provides endpoints for calculating semantic scores of YAML schema files and health monitoring.

## Features

- **Semantic Score Calculation**: Upload YAML files to calculate their semantic score based on content structure and semantic keywords
- **Health Monitoring**: Built-in health check endpoint for service monitoring
- **Swagger Documentation**: Interactive API documentation (available in development mode)

## Environment Setup

Create a `.env` file in the `apps/api` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# SPARQL Configuration (required for semantic score calculation)
SPARQL_URL=your_sparql_endpoint_url
```

## Installation

```bash
# Install dependencies
$ pnpm install
```

## Development Commands

```bash
# Start in development mode with hot reload
$ pnpm run start:dev

# Start in debug mode with hot reload
$ pnpm run start:debug
$ pnpm run dev  # alias for start:debug

# Build the application
$ pnpm run build

# Start production build
$ pnpm run start:prod
```

## Testing

```bash
# Run unit tests
$ pnpm run test

# Run tests in watch mode
$ pnpm run test:watch

# Run tests with coverage
$ pnpm run test:coverage
```

## Code Quality

```bash
# Lint and fix code
$ pnpm run lint

# Format code with Prettier
$ pnpm run format
```

## API Documentation

### Swagger UI

When running in development mode, the API provides interactive documentation via Swagger UI:

- **URL**: `http://localhost:3000/docs`
- **URL**: `http://localhost:3000/docs-json`
- **URL**: `http://localhost:3000/docs-yaml`
- **Features**:
  - Interactive API testing
  - Request/response schemas
  - Authentication support
  - Download OpenAPI specification

### Usage Examples

#### Health Check

```bash
curl http://localhost:3000/status
```

Response:

```json
{
  "status": 200
}
```

## Running the Application

1. **Start the development server**:

   ```bash
   pnpm run start:dev
   ```

2. **Access the application**:
   - API Base URL: `http://localhost:3000`
   - Health Check: `http://localhost:3000/status`
   - Swagger UI: `http://localhost:3000/docs` (development only)

3. **Test the endpoints**:
   - Use the Swagger UI to inspect endpoints
   - Or use curl as shown in the examples above

## Deployment

For production deployment:

1. **Build the application**:

   ```bash
   pnpm run build
   ```

2. **Set production environment variables**:

   ```env
   NODE_ENV=production
   PORT=3000
   SPARQL_URL=your_production_sparql_url
   etc...
   ```

3. **Start the production server**:
   ```bash
   pnpm run start:prod
   ```

Note: Swagger UI is disabled in production mode.

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

This project is part of the Dati Semantic Schema Editor and follows the same licensing terms.
