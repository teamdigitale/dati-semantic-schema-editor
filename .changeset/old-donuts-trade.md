---
'api': minor
---

Added BASE_PATH environment variable to populate server url in openapi file.

BREAKING CHANGES:
- BASE_PATH environment variable is required at startup
- The healthcheck endpoint is now served via /api/v1/status
- The openapi file is now served via /api/v1/opanapi.{yaml|json}
- The swagger UI is now served via /api/v1/swagger-ui
