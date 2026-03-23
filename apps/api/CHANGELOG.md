# api

## 0.2.0

### Minor Changes

- 9539adb: Added SERVER_URL environment variable to populate server url in openapi file.

  BREAKING CHANGES:
  - SERVER_URL environment variable is required at startup
  - The healthcheck endpoint is now served via /api/v1/status
  - The openapi file is now served via /api/v1/opanapi.{yaml|json}
  - The swagger UI is now served via /api/v1/swagger-ui

### Patch Changes

- Updated dependencies [b69d23d]
  - @teamdigitale/schema-editor-utils@0.1.1

## 0.1.0

### Minor Changes

- 41e1a31: Updated schema-editor-utils semantic score response object and API output

### Patch Changes

- f6d6aa1: Added openapi ratelimit fields documentation
- d8fb254: Updated vite and vitest to solve vitest problems with url query param. Added a warning when an invalid oas is passed.
- Updated dependencies [08d6322]
- Updated dependencies [41e1a31]
- Updated dependencies [2910eb0]
- Updated dependencies [d8fb254]
  - @teamdigitale/schema-editor-utils@0.1.0

## 0.0.2

### Patch Changes

- acf57d7: Added API and created a new common package that includes both client/server functionalities for semantic score
- acf57d7: Created schema-editor-utils lib with common methods that can be used both on browser then node environemnts. Added api for schema semantic score calculation
- Updated dependencies [acf57d7]
- Updated dependencies [acf57d7]
  - @teamdigitale/schema-editor-utils@0.0.2
