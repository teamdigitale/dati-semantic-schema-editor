# Schema Editor API

A NestJS-based API service for schema semantic score.
This API provides endpoints for calculating semantic scores of OpenAPI 3.0 schema files and health monitoring.

## Features

- Semantic Score Calculation: Upload OpenAPI 3.0 files to calculate their semantic score based on content structure and semantic keywords
- Health Monitoring: Built-in health check endpoint for service monitoring
- OpenAPI 3.0 documentation: available at `http://localhost:3000/openapi.yaml`

## Environment Setup

Create a `.env` file in the `apps/api` directory with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://example.com

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=15

# SPARQL Configuration (required for semantic score calculation)
SPARQL_URL=https://virtuoso.example.com/sparql
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

- URL: `http://localhost:3000/openapi.yaml`

- Features:
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
  "status": 200,
  "title": "OK"
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

### Prerequisites

- Node.js (version compatible with NestJS)
- Access to a SPARQL endpoint
- Environment variables configured

### Build and Start

For local environment deployment, follow these steps:

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Build the application**:

   ```bash
   cd apps/api
   pnpm run build
   ```

3. **Set production environment variables**:

```env
NODE_ENV=production
PORT=3000
SPARQL_URL=your_production_sparql_url
etc...
```

4. **Start the production server**:

```bash
pnpm run start:prod
```

### Docker

The application can be deployed using Docker. Make sure to configure environment variables in the container:

```bash
docker build --target api --tag api:latest .
```

```bash
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e SPARQL_URL=https://virtuoso.example.com/sparql \
  -e THROTTLE_LIMIT=15 \
  -e THROTTLE_TTL=60000 \
  api:latest
```

### Deployment Considerations

- **SPARQL**: Ensure the SPARQL endpoint is accessible from the deployment environment
- **Rate Limiting**: Adjust `THROTTLE_LIMIT` and `THROTTLE_TTL` parameters based on expected load
- **CORS**: Configure `CORS_ORIGIN` with actual origins in production (avoid `*`)
- **Logging**: Logs are enabled in production for monitoring
- **Swagger**: Swagger documentation is disabled in production for security

## Architecture

The API is structured in NestJS modules:

- **SemanticScoreModule**: Handles semantic score calculation
- **HealthModule**: Provides the health check endpoint
- **ConfigModule**: Manages configuration and environment variables
- **ThrottlerModule**: Implements rate limiting

The semantic score calculation uses the `@teamdigitale/schema-editor-utils` library which handles:

- JSON-LD reference resolution
- SPARQL queries to Virtuoso
- Semantic score calculation

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

This project is part of the Dati Semantic Schema Editor and follows the same licensing terms.
